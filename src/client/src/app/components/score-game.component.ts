import { AfterViewInit, Component, EventEmitter, Input, Output } from '@angular/core';
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
        (click)="cellScoreInputHandler($event)"
        (change)="cellScoreChangeHandler($event)"/>
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
      width: 9rem;
      max-width: 12rem;
      margin-left: 0.25rem;
      margin-right: 0.25rem;
    }

    .score-cell-container input {
      border-radius: 0.2rem;
      font-size: 1rem;
      text-align: end;
    }
  `
})
export class ScoreGameRoundCellComponent implements AfterViewInit {
  @Input() columnName = '';
  @Input() columnValue: RowDataValue = null;
  @Input() allowEdit: boolean = false;
  @Input() cellScore: number = 0;
  @Output() cellScoreChanged: EventEmitter<{ columnName: string, value: number }> = new EventEmitter<{
    columnName: string,
    value: number
  }>();

  ngAfterViewInit() {
    if (this.cellScore > 0) {
      this.cellScoreChanged.emit({ columnName: this.columnName, value: this.cellScore });
    }
  }

  cellScoreInputHandler = (event: Event) => {
    const target = event.target as HTMLInputElement;
    const value = +target.value;
    this.cellScoreChanged.emit({ columnName: this.columnName, value });
  };

  cellScoreChangeHandler = (event: Event) => {
    const target = event.target as HTMLInputElement;
    const value = +target.value;

    if (value < 0) {
      this.cellScore = 0;
    } else {
      this.cellScoreChanged.emit({ columnName: this.columnName, value });
    }
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
          [allowEdit]="allowEdit"
          [columnName]="column"
          [columnValue]="columnEntries[column]"
          [cellScore]="computeValueInitialScore(column)"
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
      padding: 0.275rem 0.2rem;
    }

    .score-row-container .username {
      font-weight: bold;
      font-size: 1rem;
      width: 4.5rem;
      display: inline-block;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .score-row-container .total-score {
      font-weight: bold;
      font-size: 1.5rem;
      padding: 0.25rem;
      margin-top: 0.2rem;
      margin-left: 1rem;
      border: 0.1rem solid #BABABA;
      border-radius: 0.25rem;
      height: 2rem;
      width: 2rem;
      display: inline-block;
      text-align: center;
    }
  `
})
export class ScoreGameRoundRowComponent {
  @Input() character: string = '';
  @Input() userName: string = '';
  @Input() allowEdit = false;
  @Input() columns: string[] = [];
  @Input() columnEntries: RowData = {};
  @Input() otherPlayerEntries: Record<string, RowData> = {};

  columnScores: Record<string, number> = {};
  totalScore: number = Object.values(this.columnScores).reduce((acc, item) => acc + +(item ?? 0), 0);

  handleScoreChanged = (event: { columnName: string, value: number }) => {
    this.columnScores[event.columnName] = event.value;
    this.totalScore = Object.values(this.columnScores).reduce((acc, item) => acc + +(item ?? 0), 0);
  };

  computeValueInitialScore(columnName: string): number {
    const columnEntry = this.columnEntries[columnName]?.trim().toLowerCase();

    // if the user did not write anything, or it does not start with the character being played, then the core is zero
    if (!columnEntry || !columnEntry.startsWith(this.character.toLowerCase())) {
      return 0;
    }

    // if another player has written the same value, then the core is halved
    let entryPlayedByOtherPlayer = false;
    for (const [player, playerEntries] of Object.entries(this.otherPlayerEntries)) {
      if (playerEntries[columnName]?.trim().toLowerCase() === columnEntry) {
        entryPlayedByOtherPlayer = true;
        break;
      }
    }

    return entryPlayedByOtherPlayer ? 5 : 10
  }
}

@Component({
  selector: 'ws-score-game-round',
  standalone: true,
  template: `
    <div>
      <ng-container *ngFor="let item of playerEntries | keyvalue">
        <ws-score-game-round-row
          [character]="character"
          [columns]="columns"
          [allowEdit]="allowEdit"
          [userName]="item.key"
          [columnEntries]="item.value"
          [otherPlayerEntries]="getOtherPlayersEntries(item.key)"/>
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
  @Input() allowEdit = false;
  @Input() columns: string[] = [];
  @Input() playerEntries: Record<string, RowData> = {};

  getOtherPlayersEntries(userName: string): Record<string, RowData> {
    const { [userName]: _, ...rest } = this.playerEntries;
    return rest;
  }
}
