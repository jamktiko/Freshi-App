export interface Iproduct {
  itemId: string;
  productName: string;
  brand: string;
  category: string;
  expirationDate: string; // ISO date string
  openedDate: string;
  s3ImageKey: string;
  isDeleted: boolean;
}

export interface IGetProduct {
  success: boolean;
  data: Iproduct[];
  lastKey: null | string;
}

export interface IpostProduct {
  productName: string;
  expirationDate: string;
  brand?: string;
  category?: string;
  openedDate?: string | null;
}
export interface IaddProduct {
  name: string;
  brand: string;
  category: string;
  expiration: string;
}
