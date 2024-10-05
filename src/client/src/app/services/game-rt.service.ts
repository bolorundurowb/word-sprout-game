import * as signalr from '@microsoft/signalr';
import { Observable } from 'rxjs';
import { GameState, RoundEndedEvent, RoundPlaySubmittedEvent } from "../app.types";

export class GameRealTimeService {
  private hubConnection: signalr.HubConnection;

  constructor(private gameCode: string) {
    const gameRtHubUrl = 'http://localhost:5238/rt/v1/games';
    this.hubConnection = new signalr.HubConnectionBuilder()
      .withUrl(gameRtHubUrl)
      .withAutomaticReconnect()
      .build();
  }

  async init() {
    await this.hubConnection.start();
    console.log('Game RT connection started');
  }

  playerJoined(): Observable<string> {
    return new Observable(observer => {
      this.hubConnection.on('PlayerJoined', (gameCode: string, userName: string) => {
        if (gameCode === this.gameCode) {
          observer.next(userName);
        }
      });
    });
  }

  gameStarted(): Observable<void> {
    return new Observable(observer => {
      this.hubConnection.on('GameStarted', (gameCode: string,) => {
        if (gameCode === this.gameCode) {
          observer.next();
        }
      });
    });
  }

  roundCountdownInitiated(): Observable<GameState> {
    return new Observable(observer => {
      this.hubConnection.on('RoundCountdownInitiated', (gameCode: string, gameState: GameState) => {
        if (gameCode === this.gameCode) {
          observer.next(gameState);
        }
      });
    });
  }

  roundStarted(): Observable<GameState> {
    return new Observable(observer => {
      this.hubConnection.on('RoundStarted', (gameCode: string, gameState: GameState) => {
        if (gameCode === this.gameCode) {
          observer.next(gameState);
        }
      });
    });
  }

  roundPlaySubmitted(): Observable<RoundPlaySubmittedEvent> {
    return new Observable(observer => {
      this.hubConnection.on('RoundPlaySubmitted', (gameCode: string, userName: string, character: string, columnValues: Record<string, string>) => {
        if (gameCode === this.gameCode) {
          observer.next({ userName, character, columnValues });
        }
      });
    });
  }

  roundEnded(): Observable<GameState> {
    return new Observable(observer => {
      this.hubConnection.on('RoundEnded', (gameCode: string, gameState: GameState) => {
        if (gameCode === this.gameCode) {
          observer.next(gameState);
        }
      });
    });
  }

  gameOver(): Observable<any> {
    return new Observable(observer => {
      this.hubConnection.on('GameOver', (gameCode: string, winningPlayers: Array<string>, playerScores: Record<string, number>) => {
        if (gameCode === this.gameCode) {
          observer.next({ winningPlayers, playerScores });
        }
      });
    });
  }
}
