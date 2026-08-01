"""Authentication endpoints using ITUserMaster model."""

from datetime import datetime, timedelta, timezone

import bcrypt
import jwt
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel
from sqlmodel import Session, select

from app.config import settings
from app.database import get_session
from app.models.it_user_master import ITUserMaster
from app.models.pos_customer import PosCustomer

router = APIRouter()

# ── helpers ──────────────────────────────────────────────────────────────────


def _verify_password(plain: str, hashed: str) -> bool:
    if not hashed:
        return False
    try:
        if bcrypt.checkpw(plain.encode(), hashed.encode()):
            return True
    except Exception:
        pass
    return plain == hashed


def _create_access_token(user: ITUserMaster) -> str:
    expire = datetime.now(timezone.utc) + timedelta(
        minutes=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES
    )
    payload = {
        "sub": str(user.id),
        "username": user.user_name,
        "name": user.name,
        "user_role": user.user_role,
        "exp": expire,
        "type": "access",
    }
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


def get_current_user(
    token: str = Depends(oauth2_scheme),
    session: Session = Depends(get_session),
) -> ITUserMaster:
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.JWT_ALGORITHM]
        )
        user_id = int(payload["sub"])
    except (jwt.ExpiredSignatureError, jwt.InvalidTokenError, ValueError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )

    user = session.get(ITUserMaster, user_id)
    if not user or (user.status is not None and user.status == 0):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive",
        )
    return user


# ── request/response schemas ─────────────────────────────────────────────────


class LoginRequest(BaseModel):
    username: str
    password: str


class SignupRequest(BaseModel):
    name: str
    email: str
    password: str
    phone: str | None = None
    address: str | None = None


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_role: str | None = None
    user_name: str | None = None
    name: str | None = None


# ── endpoints ────────────────────────────────────────────────────────────────


@router.post("/api/auth/login", response_model=TokenResponse)
@router.post("/oauth/token", response_model=TokenResponse)
def login(
    body: LoginRequest,
    session: Session = Depends(get_session),
):
    username = body.username.strip()
    password = body.password

    if not username or not password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username and password are required",
        )

    # Bounds match the `it_user_master.user_name`/`password` column widths.
    if len(username) > 50 or len(password) > 500:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username or password exceeds maximum allowed length",
        )

    stmt = select(ITUserMaster).where(ITUserMaster.user_name == username)
    user = session.exec(stmt).first()

    if not user or not _verify_password(password, user.password or ""):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password",
        )

    if user.status is not None and user.status == 0:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account is inactive",
        )

    access_token = _create_access_token(user)

    return TokenResponse(
        access_token=access_token,
        user_role=user.user_role,
        user_name=user.user_name,
        name=user.name,
    )


@router.post("/api/auth/signup", response_model=TokenResponse)
def signup(
    body: SignupRequest,
    session: Session = Depends(get_session),
):
    name = body.name.strip()
    email = body.email.strip().lower()
    phone = (body.phone or "").strip() or None
    address = (body.address or "").strip() or None
    password = body.password

    if not name or not email or not password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Name, email and password are required",
        )

    # Bounds match the `pos_customer`/`it_user_master` column widths these values are stored in.
    if len(name) > 60:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Name must be at most 60 characters",
        )
    if len(email) > 40 or "@" not in email or email.startswith("@") or email.endswith("@"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Enter a valid email address",
        )
    if phone and len(phone) > 30:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Phone number must be at most 30 characters",
        )
    if address and len(address) > 40:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Address must be at most 40 characters",
        )
    if len(password) < 8:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 8 characters",
        )
    if len(password) > 500:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at most 500 characters",
        )

    existing = session.exec(
        select(ITUserMaster).where(ITUserMaster.user_name == email)
    ).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists",
        )

    now = datetime.utcnow()

    try:
        customer = PosCustomer(
            cus_name=name,
            cus_email=email,
            cus_tep1=phone,
            cus_add1=address,
            cus_active=True,
            cus_crdate=now,
        )
        session.add(customer)
        session.flush()  # populate customer.cus_id before generating cus_code

        customer.cus_code = f"CUS{customer.cus_id:06d}"

        user = ITUserMaster(
            customer_id=customer.cus_id,
            name=name,
            user_name=email,
            password=bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode(),
            user_role="CLERK",
            status=1,
            c_at=now,
        )
        session.add(user)
        session.commit()
    except Exception:
        session.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create account. Please try again.",
        )

    access_token = _create_access_token(user)

    return TokenResponse(
        access_token=access_token,
        user_role=user.user_role,
        user_name=user.user_name,
        name=user.name,
    )
