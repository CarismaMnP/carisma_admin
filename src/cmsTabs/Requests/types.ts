export interface IBaseRequest {
  id: string;
  isUnread: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IClientRequest extends IBaseRequest {
  name: string;
  mail: string;
  message: string;
}

export interface IPartRequest extends IBaseRequest {
  make: string;
  model: string;
  generation: string;
  email: string;
  partDescription: string;
}
