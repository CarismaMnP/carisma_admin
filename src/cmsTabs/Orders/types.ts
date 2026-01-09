import { IUser } from '@/cmsTabs/Users/types.ts';
import { IProduct } from '@/cmsTabs/Products/types.ts';

export interface IOrder {
  id: number;
  state: string;
  user: IUser;
  sum: number;
  name: string;
  phone: string;
  mail: string;
  address: string;
  flat: string;
  building: string;
  floor: string;
  intercom: string;
  comment: string;
  city: string;
  cdekCityId: number;
  officeName: string;
  cdekOfficeId: string;
  type: string;
  deliveryName: string;
  deliveryPrice: number;
  deliveryCdekId: number;
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
