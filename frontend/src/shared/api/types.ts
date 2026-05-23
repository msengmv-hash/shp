export interface Paginated<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface Category {
  id: number;
  title: string;
  slug: string;
  parent: number | null;
  children: Category[];
  image_url?: string;
}

export interface Brand {
  id: number;
  title: string;
  slug: string;
  description: string;
  logo_url?: string;
}

export interface Product {
  id: number;
  title: string;
  slug: string;
  sku: string;
  brand: Brand;
  category: Category;
  price: string;
  old_price?: string | null;
  stock: number;
  rating: string;
  reviews_count: number;
  is_hit: boolean;
  is_new: boolean;
  image: string;
  discount_percent: number;
  is_favorite: boolean;
  description?: string;
  images?: { id: number; image: string; alt: string }[];
  attributes?: { id: number; name: string; value: string; group: string }[];
  status?: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  role: string;
  is_staff: boolean;
  is_superuser: boolean;
  is_active: boolean;
}

export interface Favorite {
  id: number;
  product: number;
  product_detail: Product;
  created_at: string;
}

export interface Review {
  id: number;
  product: number;
  user_name: string;
  rating: number;
  text: string;
  created_at: string;
}

export interface Order {
  id: number;
  status: string;
  payment_status: string;
  customer_name: string;
  total: string;
  created_at: string;
  items: { id: number; title: string; price: string; quantity: number; total: string }[];
}

export interface Address {
  id: number;
  title: string;
  city: string;
  street: string;
  apartment: string;
  entrance: string;
  floor: string;
  is_default: boolean;
}

export interface StorefrontSummary {
  products: number;
  categories: number;
  brands: number;
  promotions: number;
  min_price: string;
  max_price: string;
  top_categories: { title: string; slug: string; products_count: number }[];
}

export interface Promotion {
  id: number;
  title: string;
  slug: string;
  subtitle: string;
  image_url: string;
  products: Product[];
}

export interface CartItem {
  id: number;
  product: number;
  product_detail: Product;
  quantity: number;
  total: string;
}

export interface Cart {
  id: number;
  items: CartItem[];
  total: string;
}
