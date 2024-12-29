import { Component, OnDestroy, OnInit } from '@angular/core';
import { RowData } from './app.types';
import { ScoreGameRoundComponent } from './components/score-game.component';

@Component(({
  selector: 'ws-temp-page',
  standalone: true,
  template: `
    <h1>Temp</h1>
    <ws-score-game-round
      [allowEdit]="true"
      [columns]="columns"
      [character]="character"
      [playerEntries]="playerEntries"
      (playerScoresChanged)="logPlayerScoreChanges($event)">
    </ws-score-game-round>
  `,
  imports: [ ScoreGameRoundComponent ]
}))
export class TempComponent implements OnInit, OnDestroy {
  columns = [ 'Name', 'Animal', 'Place', 'Food', 'Thing/Item' ];
  character = 'J';
  playerEntries: Record<string, RowData> = {
    'jayden': {
      'Name': 'John',
      'Animal': 'Jackal',
      'Place': 'ungle',
      'Food': 'Jelly',
      'Thing/Item': null
    },
    'james': {
      'Name': 'James',
      'Animal': 'Jellyfish',
      'Place': 'Jungle',
      'Food': 'Jelly',
      'Thing/Item': 'Joint'
    }
  };

  intervalId?: any;
  millisecondsElapsed = 0;

  ngOnInit() {
   this.intervalId = setInterval(() => {
      this.millisecondsElapsed += 1;
    }, 1);
  }

  logPlayerScoreChanges(event: Record<string, number>) {
    console.log('Player scores changed', event, 'after', this.millisecondsElapsed, 'ms');
  }

  ngOnDestroy() {
    clearInterval(this.intervalId);
  }
}
