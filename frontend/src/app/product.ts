export interface Iproduct {
  ItemId: string;
  productName: string;
  brand: string;
  category: string;
  expirationDate: string; // ISO date string
  openedDate: string;
  s3ImageKey: string;
  isDeleted: boolean;
}

export const mockProducts: Iproduct[] = [
  {
    ItemId: '1',
    productName: 'Rasvaton Maito',
    brand: 'Valio',
    category: 'Maitotuotteet',
    expirationDate: '2026-04-25',
    openedDate: '2026-04-27',
    s3ImageKey: 'randomtext',
    isDeleted: false,
  },
  {
    ItemId: '2',
    productName: 'Jogurtti',
    brand: 'Arla',
    category: 'Maitotuotteet',
    expirationDate: '2026-04-27',
    openedDate: '2026-05-01',
    s3ImageKey: 'anotherrandom',
    isDeleted: false,
  },
  {
    ItemId: '3',
    productName: 'Leipä',
    brand: 'Fazer',
    category: 'Leivät',
    expirationDate: '2026-04-29',
    openedDate: '2026-05-10',
    s3ImageKey: 'moretext',
    isDeleted: false,
  },
  {
    ItemId: '4',
    productName: 'Omena',
    brand: 'Luomu',
    category: 'Hedelmät',
    expirationDate: '2026-05-02',
    openedDate: '2026-05-20',
    s3ImageKey: 'keyhere',
    isDeleted: false,
  },
];
