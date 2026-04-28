import { TestBed } from '@angular/core/testing';
import { StorageService } from './storage.service';
import { Preferences } from '@capacitor/preferences';

describe('StorageService', () => {
  let service: StorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StorageService);

    // Clear mock calls between tests
    spyOn(Preferences, 'set').and.resolveTo();
    spyOn(Preferences, 'remove').and.resolveTo();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should stringify products and save to Preferences', async () => {
    const mockProducts = [
      { id: '1', name: 'Milk' },
      { id: '2', name: 'Bread' },
    ];

    await service.saveProducts(mockProducts);

    expect(Preferences.set).toHaveBeenCalledWith({
      key: 'freshi_products',
      value: JSON.stringify(mockProducts),
    });
  });

  it('should parse and return products from Preferences', async () => {
    const mockSerialized = JSON.stringify([{ id: '1', name: 'Milk' }]);
    spyOn(Preferences, 'get').and.resolveTo({ value: mockSerialized });

    const result = await service.getProducts();

    expect(Preferences.get).toHaveBeenCalledWith({ key: 'freshi_products' });
    expect(result).toEqual([{ id: '1', name: 'Milk' }]);
  });

  it('should return an empty array if nothing is saved', async () => {
    spyOn(Preferences, 'get').and.resolveTo({ value: null });

    const result = await service.getProducts();

    expect(result).toEqual([]);
  });

  it('should call remove when clearProducts is called', async () => {
    await service.clearProducts();

    expect(Preferences.remove).toHaveBeenCalledWith({ key: 'freshi_products' });
  });
});
