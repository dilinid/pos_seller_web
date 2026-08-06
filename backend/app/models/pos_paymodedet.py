from sqlmodel import Field, SQLModel


class PosPayModeDet(SQLModel, table=True):
    __tablename__ = "pos_paymodedet"

    # `paycode` stores the card/issuer code (for example HSBC, BOC, AMEX).
    paycode: str = Field(primary_key=True, max_length=10)
    paystno: str = Field(max_length=4)
    payDispno: int = Field(default=0, ge=0)
