export type User = {
  id: number;
  email: string;
  is_admin: boolean;
};

export type Token = {
  access_token: string;
  token_type: string;
};

export type Product = {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  image_url: string;
};

export type ProductInput = {
  name: string;
  description?: string;
  price: number;
  stock?: number;
  image_url?: string;
};

export type ProductUpdateInput = Partial<ProductInput>;

export type CartItem = {
  id: number;
  product_id: number;
  quantity: number;
};

export type Cart = {
  id: number;
  user_id: number;
  items: CartItem[];
};

export type OrderItem = {
  id: number;
  product_id: number;
  quantity: number;
  unit_price: number;
};

export type Order = {
  id: number;
  user_id: number;
  status: string;
  total: number;
  items: OrderItem[];
};

export type ApiError = {
  detail?: string;
};
