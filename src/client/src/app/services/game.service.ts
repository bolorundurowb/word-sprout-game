/**
 * Created by Bolorunduro Winner on 27/08/2024
 */

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class GameService {
  readonly BASE_API = 'http://localhost:5238/api/v1/games';

  constructor(private http: HttpClient) {
  }

  getByCode(gameCode: string) {
    return this.http.get(`${this.BASE_API}/${gameCode}`)
      .toPromise();
  }

  create(payload: any) {
    return this.http.post(this.BASE_API, payload)
      .toPromise();
  }

  join(payload: any) {
    return this.http.post(`${this.BASE_API}/${payload.gameCode}/join`, { userName: payload.username })
      .toPromise();
  }

  start(gameCode: string) {
    return firstValueFrom(this.http.post(`${this.BASE_API}/${gameCode}/start`, {}));
  }

  getState(gameCode: string) {
    return firstValueFrom(this.http.get(`${this.BASE_API}/${gameCode}/state`));
  }
}
