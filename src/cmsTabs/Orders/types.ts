import { IUser } from '@/cmsTabs/Users/types.ts';
import { IProduct } from '@/cmsTabs/Products/types.ts';

export interface IOrder {
  id: string;
  userId: number;
  state: string;
  user?: IUser;
  sum: number;
  tax: number;
  total: number;
  fullName: string;
  phone: string;
  mail: string;
  delivey_type: string;
  country: string;
  city: string;
  zip_code: string;
  addressState: string;
  address_line_1: string;
  address_line_2: string;
  delivery_instructions: string;
  stripePaymentIntentId: string | null;
  createdAt: string;
  updatedAt: string;
  orderProducts?: IOrderProduct[];
}

interface IOrderProduct {
  count: number;
  createdAt: string;
  id: number;
  orderId: string;
  product: IProduct;
  productId: number;
  updatedAt: string;
  selectorValue: string;
}
