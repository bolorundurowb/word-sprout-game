import { Component } from '@angular/core';
import { RowData } from './app.types';
import { ScoreGameRoundComponent } from './components/score-game.component';

@Component(({
  selector: 'ws-temp-page',
  standalone: true,
  template: `
    <h1>Temp</h1>
    <ws-score-game-round
      [columns]="columns"
      [character]="character"
      [playerEntries]="playerEntries">
    </ws-score-game-round>
  `,
  imports: [ ScoreGameRoundComponent ]
}))
export class TempComponent {
  columns = [ 'Name', 'Animal', 'Place', 'Food', 'Thing/Item' ];
  character = 'J';
  playerEntries: Record<string, RowData> = {
    'jayden': {
      'Name': 'John',
      'Animal': 'Jackal',
      'Place': 'ungle',
      'Food': 'Jelly',
      'Thing/Item': null
    }
  };
}
