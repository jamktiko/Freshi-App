/**
 * StorageService unit tests.
 *
 * @capacitor/preferences is resolved to a manual mock via
 * jest.config.js moduleNameMapper (src/__mocks__/capacitor-preferences.js).
 * Tests run in plain Node via Jest — no browser, no native bridge.
 */

import { Preferences } from '@capacitor/preferences';
import { StorageService } from './storage.service';

describe('StorageService', () => {
  let service: StorageService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new StorageService();
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
    (Preferences.get as jest.Mock).mockResolvedValueOnce({ value: mockSerialized });

    const result = await service.getProducts();

    expect(Preferences.get).toHaveBeenCalledWith({ key: 'freshi_products' });
    expect(result).toEqual([{ id: '1', name: 'Milk' }]);
  });

  it('should return an empty array if nothing is saved', async () => {
    (Preferences.get as jest.Mock).mockResolvedValueOnce({ value: null });

    const result = await service.getProducts();

    expect(result).toEqual([]);
  });

  it('should return an empty array if stored value is corrupted JSON', async () => {
    (Preferences.get as jest.Mock).mockResolvedValueOnce({ value: '{not valid json' });

    const result = await service.getProducts();

    expect(result).toEqual([]);
  });

  it('should call remove when clearProducts is called', async () => {
    await service.clearProducts();

    expect(Preferences.remove).toHaveBeenCalledWith({ key: 'freshi_products' });
  });
});
