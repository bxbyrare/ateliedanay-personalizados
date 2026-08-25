export type UserRole = 'customer' | 'admin';

export interface PublicUser {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  cpf: string | null;
  role: UserRole;
  createdAt: string;
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  isActive: boolean;
  sortOrder: number;
}

export interface ProductImage {
  id: string;
  url: string;
  altText: string | null;
  isPrimary: boolean;
  sortOrder: number;
}

export type CustomizationFieldType = 'text' | 'textarea' | 'select' | 'number' | 'date';

export interface ProductCustomizationField {
  id: string;
  label: string;
  fieldType: CustomizationFieldType;
  isRequired: boolean;
  maxLength: number;
  options: string[] | null;
  helpText: string | null;
  sortOrder: number;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  priceCents: number;
  categoryId: string | null;
  isActive: boolean;
  isFeatured: boolean;
  stockQuantity: number | null;
  images: ProductImage[];
  category: Category | null;
  customizationFields?: ProductCustomizationField[];
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface CartItem {
  id: string;
  cartId: string;
  productId: string;
  quantity: number;
  customizationValues: Record<string, string>;
  priceCentsSnapshot: number;
  product: Product;
}

export interface Cart {
  id: string;
  userId: string;
  items: CartItem[];
}

export type BrazilianState =
  | 'AC' | 'AL' | 'AP' | 'AM' | 'BA' | 'CE' | 'DF' | 'ES' | 'GO'
  | 'MA' | 'MT' | 'MS' | 'MG' | 'PA' | 'PB' | 'PR' | 'PE' | 'PI'
  | 'RJ' | 'RN' | 'RS' | 'RO' | 'RR' | 'SC' | 'SP' | 'SE' | 'TO';

export interface Address {
  id: string;
  label: string;
  recipientName: string;
  cep: string;
  street: string;
  number: string;
  complement: string | null;
  neighborhood: string;
  city: string;
  state: BrazilianState;
  country: string;
  phone: string;
  isDefault: boolean;
}

export type OrderStatus =
  | 'aguardando_pagamento'
  | 'pagamento_aprovado'
  | 'em_producao'
  | 'enviado'
  | 'entregue'
  | 'cancelado';

export interface OrderItem {
  id: string;
  productId: string | null;
  productNameSnapshot: string;
  unitPriceCentsSnapshot: number;
  quantity: number;
  customizationValues: Record<string, string>;
  lineTotalCents: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  subtotalCents: number;
  shippingCents: number;
  totalCents: number;
  shippingRecipient: string;
  shippingCep: string;
  shippingStreet: string;
  shippingNumber: string;
  shippingComplement: string | null;
  shippingNeighborhood: string;
  shippingCity: string;
  shippingState: string;
  shippingPhone: string;
  notes: string | null;
  createdAt: string;
  items: OrderItem[];
}

export interface WishlistItem {
  id: string;
  productId: string;
  product: Product;
}

export interface ApiErrorBody {
  error: {
    message: string;
    fields?: Record<string, string[]>;
  };
}
