export interface IProduct {
  itemId: string;
  productName: string;
  brand: string | null;
  category: string | null;
  expirationDate: string; // ISO date string
  openedDate: string | null; // ISO Date
  S3imageKey: string | null;
  createdAt: string; // // ISO timestamp
  lastUpdate: string; // // ISO timestamp
  confidence: string | null;
}

// Product interface for locally stored products
export interface ILocalProduct extends IProduct {
  synced: boolean;
}

// UPDATE LOCALPRODUCT INTERFACE
export interface IUpdateLocal {
  itemId: string;
  productName?: string;
  brand?: string | null;
  category?: string | null;
  expirationDate?: string; // ISO date string
  openedDate?: string | null; // ISO Date
  S3imageKey?: string | null;
  createdAt?: string; // // ISO timestamp
  lastUpdate?: string; // // ISO timestamp
  confidence?: string | null;
  synced?: boolean;
}

// Product interface for products to be sent with POST
export interface IPostProduct extends IProduct {}

// Procut intefrace for products to be received from backend
export interface IReceivedProduct extends IProduct {
  isDeleted: boolean | null;
  TTL: number | null;
}

export interface IPostProductResponse {
  success: boolean;
  data: IReceivedProduct;
}
export interface IGetAllProductsResponse {
  success: boolean;
  data: IReceivedProduct[];
  lastkey: null;
}
export interface ISyncPost {
  lastSync: null | string; // ISO timestamp
  unsyncedItems: ISentSyncProduct[];
}

export interface IDeleteProductResponse {
  success: boolean;
}

// INTERFACES FOR SYNCING WIITH BACKEND

export type Operation = 'CREATE' | 'UPDATE' | 'DELETE';

// Product information, that is needed when sending products while syncing
export interface ISentSyncProduct extends IProduct {
  operation: 'CREATE' | 'UPDATE' | 'DELETE';
}

// Response package the backend sends to frontend when syncing
export interface ISyncResponse {
  success: boolean;
  syncedClientItems: ISyncedClientItems[];
  updated: IUpdated[];
  deleted: IDeleted[];
  conflicts: IConflicts[];
  syncToken: string;
}

// Contains the results of offline-changes sent by frontend during sync
export interface ISyncedClientItems {
  localId: string;
  itemId: string;
  operation: Operation;
  status:
    | 'SYNCED'
    | 'MISSING_ITEM_ID'
    | 'INVALID_ID'
    | 'NOT_FOUND'
    | 'INVALID_CLIENT_UPDATE_AT';
}

export interface IUpdated extends IProduct {}
export interface IDeleted {
  itemId: string;
  lastUpdate: string; // ISO TIMESTAMP
}
export interface IConflicts {
  localId: string;
  itemId: string;
  operation: Operation;
  reason: string;
  serverItem: {
    itemId: string;
    productName: string;
    lastUpdate: string;
  };
}

export interface IDeletedProduct {
  operation: 'DELETE';
  itemId: string;
  clientUpdatedAt: string; // ISO TIMESTAMP
}
