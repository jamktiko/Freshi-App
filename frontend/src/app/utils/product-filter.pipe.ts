import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'productFilter',
  standalone: true,
})
export class ProductFilterPipe implements PipeTransform {
  /**
   * Filters an array of products by name, brand or category.
   *
   * @param products The array of products to filter
   * @param searchTerm The search string entered by the user
   * @param showExpiredOnly If true, returns only products whose daysLeft <= 0.
   */
  transform(
    products: any[],
    searchTerm: string,
    showExpiredOnly: boolean = false,
  ): any[] {
    if (!products) return [];

    let filtered = products;

    // Apply exact 'Expired' filter
    if (showExpiredOnly) {
      filtered = filtered.filter(
        (p) => p.daysLeft !== undefined && p.daysLeft <= 0,
      );
    }

    // Apply text search
    if (searchTerm && searchTerm.trim() !== '') {
      const lowerSearch = searchTerm.toLowerCase().trim();
      filtered = filtered.filter((p) => {
        const nameMatch = p.name
          ? p.name.toLowerCase().includes(lowerSearch)
          : false;
        const brandMatch = p.brand
          ? p.brand.toLowerCase().includes(lowerSearch)
          : false;
        const catMatch = p.category
          ? p.category.toLowerCase().includes(lowerSearch)
          : false;

        return nameMatch || brandMatch || catMatch;
      });
    }

    return filtered;
  }
}
