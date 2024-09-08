import { Injectable } from '@angular/core';
import * as signalr from '@microsoft/signalr';
import { Observable } from 'rxjs';

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

  roundCountdownInitiated(): Observable<string> {
    return new Observable(observer => {
      this.hubConnection.on('RoundCountdownInitiated', (gameCode: string, currentPlayerUserName: string) => {
        if (gameCode === this.gameCode) {
          observer.next(currentPlayerUserName);
        }
      });
    });
  }
}
