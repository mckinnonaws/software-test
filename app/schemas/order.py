from pydantic import BaseModel


class OrderItemRead(BaseModel):
    id: int
    product_id: int
    quantity: int
    unit_price: float

    model_config = {"from_attributes": True}


class OrderRead(BaseModel):
    id: int
    user_id: int
    status: str
    total: float
    items: list[OrderItemRead] = []

    model_config = {"from_attributes": True}
