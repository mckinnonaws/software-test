from pydantic import BaseModel, Field


class ProductCreate(BaseModel):
    name: str
    description: str = ""
    price: float = Field(gt=0)
    stock: int = Field(ge=0, default=0)
    image_url: str = ""


class ProductUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    price: float | None = Field(default=None, gt=0)
    stock: int | None = Field(default=None, ge=0)
    image_url: str | None = None


class ProductRead(BaseModel):
    id: int
    name: str
    description: str
    price: float
    stock: int
    image_url: str

    model_config = {"from_attributes": True}
