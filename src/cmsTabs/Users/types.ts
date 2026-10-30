export type PurchasingAs = 'Residential' | 'Assurance' | 'Dealership';
export interface IUser {
  purchasingAs?: PurchasingAs | null;
  paidOrdersCount?: number;
  lastOrderAt?: string | null;
  createdAt?: string;
  resaleTaxExempt?: boolean;
  id: number;
  name: string;
  mail: string;
  phone: string;
  category: string;
  discount: number;
  total: number;
  cartSum: number;
}
