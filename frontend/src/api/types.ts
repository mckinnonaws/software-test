export interface User {
  id: number;
  email: string;
  is_admin: boolean;
}

export interface Token {
  access_token: string;
  token_type: string;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  image_url: string;
}

export interface ProductCreate {
  name: string;
  description?: string;
  price: number;
  stock?: number;
  image_url?: string;
}

export interface ProductUpdate {
  name?: string;
  description?: string;
  price?: number;
  stock?: number;
  image_url?: string;
}

export interface CartItem {
  id: number;
  product_id: number;
  quantity: number;
}

export interface Cart {
  id: number;
  user_id: number;
  items: CartItem[];
}

export interface CartItemAdd {
  product_id: number;
  quantity: number;
}

export interface CartItemUpdate {
  quantity: number;
}

export interface OrderItem {
  id: number;
  product_id: number;
  quantity: number;
  unit_price: number;
}

export interface Order {
  id: number;
  user_id: number;
  status: string;
  total: number;
  items: OrderItem[];
}

export interface ApiError {
  detail: string;
}
