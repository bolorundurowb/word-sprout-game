import { Component, computed, EventEmitter, Input, Output, Signal } from '@angular/core';
import { RowData, RowDataValue } from '../app.types';
import { JsonPipe, KeyValuePipe, NgForOf, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'ws-score-game-round-cell',
  standalone: true,
  template: `
    <div class="score-cell-container">
      <span>
        <ng-container *ngIf="columnValue">
          {{ columnValue }}
        </ng-container>
        <ng-container *ngIf="!columnValue">
          <i>(None)</i>
        </ng-container>
      </span>

      <input
        min="0"
        max="10"
        name="cell-score"
        type="number"
        [disabled]="!columnValue || !allowEdit"
        [value]="cellScore"
        (click)="cellScoreInputHandler($event)"/>
    </div>
  `,
  imports: [
    FormsModule,
    NgIf
  ],
  styles: `
    .score-cell-container {
      border-radius: 0.25rem;
      border: 0.1rem solid #BABABA;
      padding: 0.25rem 0.5rem;
      display: inline-flex;
      align-items: center;
      justify-content: space-between;
      height: 2rem;
      width: 10rem;
      max-width: 12rem;
      margin-left: 0.5rem;
      margin-right: 0.5rem;
    }

    .score-cell-container input {
      border-radius: 0.2rem;
      font-size: 1rem;
      text-align: end;
    }
  `
})
export class ScoreGameRoundCellComponent {
  @Input() columnName = '';
  @Input() columnValue: RowDataValue = null;
  @Input() allowEdit: boolean = false;
  @Input() cellScore: number = 0;
  @Output() cellScoreChanged: EventEmitter<{ columnName: string, value: number }> = new EventEmitter<{
    columnName: string,
    value: number
  }>();

  cellScoreInputHandler = (event: Event) => {
    const target = event.target as HTMLInputElement;
    const value = +target.value;
    this.cellScoreChanged.emit({ columnName: this.columnName, value });
  };
}

@Component({
  selector: 'ws-score-game-round-row',
  standalone: true,
  template: `
    <div class="score-row-container">
      <span class="username">{{ userName }}:</span>
      <ng-container *ngFor="let column of columns">
        <ws-score-game-round-cell
          [allowEdit]="true"
          [columnName]="column"
          [columnValue]="columnEntries[column]"
          (cellScoreChanged)="handleScoreChanged($event)">
        </ws-score-game-round-cell>
      </ng-container>

      <span class="total-score">
        {{ totalScore }}
      </span>
    </div>
  `,
  imports: [
    ScoreGameRoundCellComponent,
    NgForOf
  ],
  styles: `
    .score-row-container {
      padding-left: 0.2rem;
      padding-right: 0.2rem;
    }

    .score-row-container .username {
      font-weight: bold;
      font-size: 1rem;
    }

    .score-row-container .total-score {
      font-weight: bold;
      font-size: 1.1rem;
      margin-left: 1.5rem;
      border: 0.1rem solid #BABABA;
      padding: 0.25rem 0.5rem;
      border-radius: 0.25rem;
      height: 2rem;
      width: 3rem;
      display: inline-block;
      margin-top: -1rem;
    }
  `
})
export class ScoreGameRoundRowComponent {
  @Input() userName: string = '';
  @Input() columns: string[] = [];
  @Input() columnEntries: RowData = {};

  columnScores: Record<string, number> = {};
  totalScore: number = Object.values(this.columnScores).reduce((acc, item) => acc + +(item ?? 0), 0);

  handleScoreChanged = (event: { columnName: string, value: number }) => {
    this.columnScores[event.columnName] = event.value;
    this.totalScore = Object.values(this.columnScores).reduce((acc, item) => acc + +(item ?? 0), 0);
  };
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
