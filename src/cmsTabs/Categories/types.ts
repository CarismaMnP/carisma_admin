export interface ICategory {
  id: number;
  name: string;
  description: string;
  imageUrl: string;
  horizontalImageUrl: string;
  previewUrl: string;
  link: string;
  parentId: number;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}
