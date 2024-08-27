/**
 * Created by Bolorunduro Winner on 27/08/2024
 */

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class GameService {
  readonly BASE_API = 'http://localhost:5238/api/v1/games';

  constructor(private http: HttpClient) {
  }

  create(payload: any) {
    return this.http.post(this.BASE_API, payload).toPromise();
  }
}
