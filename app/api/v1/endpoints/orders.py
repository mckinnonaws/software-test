from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.cart import Cart, CartItem
from app.models.order import Order, OrderItem
from app.models.product import Product
from app.models.user import User
from app.schemas.order import OrderItemRead, OrderRead

router = APIRouter(prefix="/orders", tags=["orders"])


@router.get("", response_model=list[OrderRead])
def list_orders(user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> list[OrderRead]:
    orders = db.scalars(select(Order).where(Order.user_id == user.id).order_by(Order.id.desc())).all()
    result: list[OrderRead] = []
    for order in orders:
        items = db.scalars(select(OrderItem).where(OrderItem.order_id == order.id)).all()
        result.append(
            OrderRead(
                id=order.id,
                user_id=order.user_id,
                status=order.status,
                total=order.total,
                items=[OrderItemRead.model_validate(i) for i in items],
            )
        )
    return result


@router.get("/{order_id}", response_model=OrderRead)
def get_order(
    order_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> OrderRead:
    order = db.get(Order, order_id)
    if order is None or order.user_id != user.id:
        raise HTTPException(status_code=404, detail="Order not found")
    items = db.scalars(select(OrderItem).where(OrderItem.order_id == order.id)).all()
    return OrderRead(
        id=order.id,
        user_id=order.user_id,
        status=order.status,
        total=order.total,
        items=[OrderItemRead.model_validate(i) for i in items],
    )


@router.post("", response_model=OrderRead, status_code=status.HTTP_201_CREATED)
def checkout(user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> OrderRead:
    cart = db.scalar(select(Cart).where(Cart.user_id == user.id))
    if cart is None:
        raise HTTPException(status_code=400, detail="Cart is empty")
    cart_items = db.scalars(select(CartItem).where(CartItem.cart_id == cart.id)).all()
    if not cart_items:
        raise HTTPException(status_code=400, detail="Cart is empty")

    products: dict[int, Product] = {}
    for ci in cart_items:
        product = db.get(Product, ci.product_id)
        if product is None or product.stock < ci.quantity:
            raise HTTPException(status_code=400, detail="Insufficient stock")
        products[ci.product_id] = product

    order = Order(user_id=user.id, status="placed", total=0.0)
    db.add(order)
    db.flush()

    total = 0.0
    for ci in cart_items:
        product = products[ci.product_id]
        product.stock -= ci.quantity
        unit_price = product.price
        total += unit_price * ci.quantity
        db.add(OrderItem(order_id=order.id, product_id=ci.product_id, quantity=ci.quantity, unit_price=unit_price))

    order.total = round(total, 2)
    for ci in cart_items:
        db.delete(ci)
    db.commit()
    db.refresh(order)

    items = db.scalars(select(OrderItem).where(OrderItem.order_id == order.id)).all()
    return OrderRead(
        id=order.id,
        user_id=order.user_id,
        status=order.status,
        total=order.total,
        items=[OrderItemRead.model_validate(i) for i in items],
    )
