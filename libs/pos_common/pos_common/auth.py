"""Shared JWT verification for every service. Ordering/Picking/Packing verify
tokens issued by Core locally (same SECRET_KEY/HS256) with no per-request DB
lookup or network call — the JWT payload already carries everything routine
authorization needs (id, username, name, role, customer_id).

Trade-off (accepted, see plan risks): a user deactivated in it_user_master
keeps working in these services until their token naturally expires (<=30 min
by default), since only Core has the live it_user_master row. Core's own
get_current_user (in services/core) still does the live DB check for routes
that need it (e.g. re-issuing tokens).
"""

import jwt
from fastapi import Depends, Header, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel

from pos_common.config import settings

# tokenUrl is only used for OpenAPI docs / the Depends() wiring, not an actual
# redirect — every service points it at Core's real login route.
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


class TokenClaims(BaseModel):
    id: int
    username: str | None = None
    name: str | None = None
    user_role: str | None = None
    customer_id: int | None = None


def decode_token(token: str) -> TokenClaims:
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
        return TokenClaims(
            id=int(payload["sub"]),
            username=payload.get("username"),
            name=payload.get("name"),
            user_role=payload.get("user_role"),
            customer_id=payload.get("customer_id"),
        )
    except (jwt.ExpiredSignatureError, jwt.InvalidTokenError, KeyError, ValueError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )


def get_current_user(token: str = Depends(oauth2_scheme)) -> TokenClaims:
    return decode_token(token)


def require_internal_token(authorization: str | None = Header(default=None)) -> None:
    """Guards /internal/* endpoints reached only via the Docker network (never
    proxied by the gateway) — a static shared-secret bearer token, not an
    end-user JWT, since the caller here is another service, not a person."""
    expected = f"Bearer {settings.INTERNAL_SERVICE_TOKEN}"
    if not authorization or authorization != expected:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or missing internal service token",
        )
