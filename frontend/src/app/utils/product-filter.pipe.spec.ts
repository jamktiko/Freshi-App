import { ProductFilterPipe } from './product-filter.pipe';

describe('ProductFilterPipe', () => {
  let pipe: ProductFilterPipe;

  const mockProducts = [
    { id: '1', name: 'Milk', brand: 'Valio', daysLeft: 5 },
    { id: '2', name: 'Bread', category: 'Bakery', daysLeft: -1 },
    { id: '3', name: 'Almond Milk', brand: 'Oatly', daysLeft: 10 },
  ];

  beforeEach(() => {
    pipe = new ProductFilterPipe();
  });

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should return empty array if products is empty or null', () => {
    expect(pipe.transform([], '')).toEqual([]);
    expect(pipe.transform(null as any, '')).toEqual([]);
  });

  it('should return all products if search term is empty string', () => {
    const result = pipe.transform(mockProducts, '   ');
    expect(result.length).toBe(3);
  });

  it('should filter products matching case-insensitive name', () => {
    const result = pipe.transform(mockProducts, 'mILk');
    expect(result.length).toBe(2);
    expect(result[0].name).toBe('Milk');
    expect(result[1].name).toBe('Almond Milk');
  });

  it('should filter products matching case-insensitive brand', () => {
    const result = pipe.transform(mockProducts, 'valio');
    expect(result.length).toBe(1);
    expect(result[0].brand).toBe('Valio');
  });

  it('should return only expired products if showExpiredOnly is true', () => {
    const result = pipe.transform(mockProducts, '', true);
    expect(result.length).toBe(1);
    expect(result[0].name).toBe('Bread'); // -1 days left
  });

  it('should combine text search and expired filter', () => {
    // There are no expired products with 'milk' in name
    const result = pipe.transform(mockProducts, 'Milk', true);
    expect(result.length).toBe(0);
  });
});
