import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom, Observable } from 'rxjs';
import { environment } from 'src/environment/environment.prod';
import { IGetProduct, IpostProduct, Iproduct } from './product';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private apiURL: string = environment.apiURL;
  private http = inject(HttpClient);

  getProducts(): Observable<IGetProduct> {
    return this.http.get<IGetProduct>(this.apiURL + '/items');
  }

  async postProduct(newProduct: IpostProduct) {
    try {
      const response = await firstValueFrom(
        this.http.post(this.apiURL + '/items', newProduct),
      );
      return response;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}
