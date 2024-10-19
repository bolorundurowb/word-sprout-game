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

  getByCode(gameCode: string): Promise<any> {
    return firstValueFrom(this.http.get(`${this.BASE_API}/${gameCode}`));
  }

  create(payload: any): Promise<any> {
    return firstValueFrom(this.http.post(this.BASE_API, payload));
  }

  join(payload: any): Promise<any> {
    return firstValueFrom(this.http.post(`${this.BASE_API}/${payload.gameCode}/join`, { userName: payload.username }));
  }

  start(gameCode: string): Promise<any> {
    return firstValueFrom(this.http.post(`${this.BASE_API}/${gameCode}/start`, {}));
  }

  getState(gameCode: string): Promise<any> {
    return firstValueFrom(this.http.get(`${this.BASE_API}/${gameCode}/state`));
  }

  startRound(gameCode: string, character: string, userName: string): Promise<any> {
    return firstValueFrom(this.http.post(`${this.BASE_API}/${gameCode}/start-round`, {
      character,
      playerUserName: userName
    }));
  }

  getUserPlays(gameCode: string, userName: string): Promise<any> {
    return firstValueFrom(this.http.get(`${this.BASE_API}/${gameCode}/players/${userName}/plays`));
  }

  submitUserPlay(gameCode: string, userName: string, character: string, entries: any): Promise<any> {
    return firstValueFrom(
      this.http.post(`${this.BASE_API}/${gameCode}/players/${userName}/plays`, {
        character,
        columnValues: entries
      })
    );
  }

  scoreRound(gameCode: string, userName: string, character: string, playerScores: Record<string, number>): Promise<any> {
    return firstValueFrom(
      this.http.post(`${this.BASE_API}/${gameCode}/score-round`, {
        character,
        playerScores,
        username: userName,
      })
    );
  }
}
