export interface IProductImage {
  imageUrl: string;
  previewUrl?: string;
}

export interface IProduct {
  id: number;
  name: string;
  link: string;
  images: (string | IProductImage)[];
  price: number;
  make?: string;
  count?: number;
  ebayModel?: string;
  ebayCategory?: string;
  additionalFields?: string | Record<string, any>;
  about?: string;
  ebayAdditionalNotes?: string;
  ebayYear?: string;
  ebayAlsoFits?: string[] | string;
  isDeleted?: boolean;
}
