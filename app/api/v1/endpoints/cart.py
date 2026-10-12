from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.cart import Cart, CartItem
from app.models.product import Product
from app.models.user import User
from app.schemas.cart import CartItemAdd, CartItemUpdate, CartItemRead, CartRead

router = APIRouter(prefix="/cart", tags=["cart"])


def _get_or_create_cart(user_id: int, db: Session) -> Cart:
    cart = db.scalar(select(Cart).where(Cart.user_id == user_id))
    if cart is None:
        cart = Cart(user_id=user_id)
        db.add(cart)
        db.commit()
        db.refresh(cart)
    return cart


def _cart_read(cart: Cart, db: Session) -> CartRead:
    items = db.scalars(select(CartItem).where(CartItem.cart_id == cart.id)).all()
    return CartRead(
        id=cart.id,
        user_id=cart.user_id,
        items=[CartItemRead.model_validate(item) for item in items],
    )


@router.get("", response_model=CartRead)
def get_cart(user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> CartRead:
    cart = _get_or_create_cart(user.id, db)
    return _cart_read(cart, db)


@router.post("/items", response_model=CartRead, status_code=status.HTTP_201_CREATED)
def add_item(
    payload: CartItemAdd,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> CartRead:
    product = db.get(Product, payload.product_id)
    if product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    cart = _get_or_create_cart(user.id, db)
    existing = db.scalar(
        select(CartItem).where(CartItem.cart_id == cart.id, CartItem.product_id == payload.product_id)
    )
    new_qty = payload.quantity + (existing.quantity if existing else 0)
    if new_qty > product.stock:
        raise HTTPException(status_code=400, detail="Insufficient stock")
    if existing:
        existing.quantity = new_qty
    else:
        db.add(CartItem(cart_id=cart.id, product_id=payload.product_id, quantity=payload.quantity))
    db.commit()
    return _cart_read(cart, db)


@router.patch("/items/{item_id}", response_model=CartRead)
def update_item(
    item_id: int,
    payload: CartItemUpdate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> CartRead:
    cart = _get_or_create_cart(user.id, db)
    item = db.get(CartItem, item_id)
    if item is None or item.cart_id != cart.id:
        raise HTTPException(status_code=404, detail="Cart item not found")
    product = db.get(Product, item.product_id)
    if product is None or payload.quantity > product.stock:
        raise HTTPException(status_code=400, detail="Insufficient stock")
    item.quantity = payload.quantity
    db.commit()
    return _cart_read(cart, db)


@router.delete("/items/{item_id}", response_model=CartRead)
def remove_item(
    item_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> CartRead:
    cart = _get_or_create_cart(user.id, db)
    item = db.get(CartItem, item_id)
    if item is None or item.cart_id != cart.id:
        raise HTTPException(status_code=404, detail="Cart item not found")
    db.delete(item)
    db.commit()
    return _cart_read(cart, db)
