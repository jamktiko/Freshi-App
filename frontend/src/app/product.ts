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
export interface IaddProduct {
  name: string;
  brand: string;
  category: string;
  expiration: string;
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
  {
    ItemId: '5',
    productName: 'Juusto',
    brand: 'Valio',
    category: 'Maitotuotteet',
    expirationDate: '2026-04-28',
    openedDate: '2026-05-05',
    s3ImageKey: 'cheese1',
    isDeleted: false,
  },
  {
    ItemId: '6',
    productName: 'Kananmunat',
    brand: 'Omenainen',
    category: 'Munat',
    expirationDate: '2026-05-03',
    openedDate: '2026-05-08',
    s3ImageKey: 'eggs1',
    isDeleted: false,
  },
  {
    ItemId: '7',
    productName: 'Kalafile',
    brand: 'Keiju',
    category: 'Kala',
    expirationDate: '2026-04-26',
    openedDate: '2026-04-28',
    s3ImageKey: 'fish1',
    isDeleted: false,
  },
  {
    ItemId: '8',
    productName: 'Kermavilli',
    brand: 'Arla',
    category: 'Maitotuotteet',
    expirationDate: '2026-05-01',
    openedDate: '2026-05-04',
    s3ImageKey: 'cream1',
    isDeleted: false,
  },
  {
    ItemId: '9',
    productName: 'Banaani',
    brand: 'Tropikki',
    category: 'Hedelmät',
    expirationDate: '2026-04-30',
    openedDate: '2026-05-02',
    s3ImageKey: 'banana1',
    isDeleted: false,
  },
  {
    ItemId: '10',
    productName: 'Brokkoli',
    brand: 'Luomu',
    category: 'Vihannekset',
    expirationDate: '2026-05-07',
    openedDate: '2026-05-09',
    s3ImageKey: 'broccoli1',
    isDeleted: false,
  },
  {
    ItemId: '11',
    productName: 'Tomaatti',
    brand: 'Paikallinen',
    category: 'Vihannekset',
    expirationDate: '2026-04-29',
    openedDate: '2026-05-01',
    s3ImageKey: 'tomato1',
    isDeleted: false,
  },
  {
    ItemId: '12',
    productName: 'Pinaatti',
    brand: 'Luomu',
    category: 'Vihannekset',
    expirationDate: '2026-05-04',
    openedDate: '2026-05-06',
    s3ImageKey: 'spinach1',
    isDeleted: false,
  },
  {
    ItemId: '13',
    productName: 'Oliivi öljy',
    brand: 'Carapelli',
    category: 'Öljyt',
    expirationDate: '2026-05-06',
    openedDate: '2026-05-08',
    s3ImageKey: 'oliveoil1',
    isDeleted: false,
  },
  {
    ItemId: '14',
    productName: 'Pastasoossi',
    brand: 'Barilla',
    category: 'Soseet',
    expirationDate: '2026-05-08',
    openedDate: '2026-05-10',
    s3ImageKey: 'pastasauce1',
    isDeleted: false,
  },
];
