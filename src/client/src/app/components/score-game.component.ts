import { Component, Input } from '@angular/core';
import { RowData, RowDataValue } from '../app.types';
import { JsonPipe, KeyValuePipe, NgForOf } from '@angular/common';

@Component({
  selector: 'ws-score-game-round-cell',
  standalone: true,
  template: `
    <div>
      {{ columnName }}: {{ columnValue }}
    </div>
  `,
  styles: ``
})
export class ScoreGameRoundCellComponent {
  @Input() columnName = '';
  @Input() columnValue: RowDataValue = null;
}


@Component({
  selector: 'ws-score-game-round-row',
  standalone: true,
  template: `
    <div>
      <div>{{userName}}</div>
      <ng-container *ngFor="let column of columns">
        <ws-score-game-round-cell
          [columnName]="column"
          [columnValue]="columnEntries[column]">
        </ws-score-game-round-cell>
      </ng-container>
    </div>
  `,
  imports: [
    ScoreGameRoundCellComponent,
    NgForOf
  ],
  styles: ``
})
export class ScoreGameRoundRowComponent {
  @Input() userName: string = '';
  @Input() columns: string[] = [];
  @Input() columnEntries: RowData = {};
}


@Component({
  selector: 'ws-score-game-round',
  standalone: true,
  template: `
    <div>
      <ng-container *ngFor="let item of playerEntries | keyvalue">
        <ws-score-game-round-row
          [columns]="columns"
          [userName]="item.key"
          [columnEntries]="item.value"/>
      </ng-container>
    </div>
  `,
  imports: [
    JsonPipe,
    KeyValuePipe,
    NgForOf,
    ScoreGameRoundRowComponent
  ],
  styles: `
  `
})
export class ScoreGameRoundComponent {
  @Input() character: string = '';
  @Input() columns: string[] = [];
  @Input() playerEntries: Record<string, RowData> = {};
}
