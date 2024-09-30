import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NgForOf } from '@angular/common';
import { TuiInputModule, TuiTextfieldControllerModule } from '@taiga-ui/legacy';
import { TuiTextfieldOptionsDirective } from '@taiga-ui/core';
import { FormsModule } from '@angular/forms';
import { RowData } from "../app.types";

export interface GameRoundData {
  character: string;
  score?: number;
  entries: Record<string, string>;
}

@Component({
  selector: '[wsGameRoundRow]',
  standalone: true,
  imports: [
    NgForOf,
    TuiInputModule,
    TuiTextfieldOptionsDirective,
    TuiTextfieldControllerModule,
    FormsModule,
  ],
  template: `
    <td>{{ character }}</td>
    <ng-container *ngFor="let column of columns">
      <td>
        <tui-input
          tuiTextfieldSize="m"
          [(ngModel)]="data[column]"
          [tuiTextfieldLabelOutside]="true">
          <input
            name="ws-gr-{{column}}"
            tuiTextfieldLegacy
            [disabled]="!enabled"
            (drop)="disableEvent($event)"
            (paste)="disableEvent($event)"
          />
        </tui-input>
      </td>
    </ng-container>
    <td>
      {{ score }}
    </td>
    <ng-content></ng-content>
  `,
  styles: `
    td {
      padding: 0.2rem 0.5rem;
    }
  `
})
export class GameRoundRowComponent {
  @Input() columns: string[] = [];
  @Input() character: string = '';
  @Input() score?: number;
  @Input() enabled = true;

  // @ts-ignore
  @Input() data: RowData;
  @Output() dataChange = new EventEmitter<RowData>();

  constructor() {
    this.data = {};
  }

  disableEvent(event: any) {
    event.preventDefault();
  }
}
