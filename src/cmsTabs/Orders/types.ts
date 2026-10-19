import { IUser } from '@/cmsTabs/Users/types.ts';
import { IProduct } from '@/cmsTabs/Products/types.ts';

export interface IOrder {
  id: string;
  userId: number;
  isIntegrationTest?: boolean;
  checkmateWorkOrder?: string;
  checkmateInvoice?: string;
  state: string;
  user?: IUser;
  sum: number;
  tax: number;
  shippingAmount?: number|string;
  shippingReview?: string;
  freightQuoteId?: string;
  freightSnapshot?: {request:{zip:string;addressType:string;insuredCents:number;shipmentItems:unknown[]};result:{reference:string;selected:{carrier:string};insuranceCents:number}};
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
  unitPriceCents?: number | null;
  productSnapshot?: {name: string};
  count: number;
  createdAt: string;
  id: number;
  orderId: string;
  product: IProduct;
  productId: number;
  updatedAt: string;
  selectorValue: string;
}
