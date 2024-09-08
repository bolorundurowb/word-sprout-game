import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NgForOf } from '@angular/common';
import { TuiInputModule, TuiTextfieldControllerModule } from '@taiga-ui/legacy';
import { TuiTextfieldOptionsDirective } from '@taiga-ui/core';

export interface GameRoundData {
  character: string;
  score?: number;
  entries?: Record<string, string>;
}

@Component({
  selector: '[wsGameRoundRow]',
  standalone: true,
  imports: [
    NgForOf,
    TuiInputModule,
    TuiTextfieldOptionsDirective,
    TuiTextfieldControllerModule,
  ],
  template: `
    <td>{{ character }}</td>
    <ng-container *ngFor="let column of columns">
      <td>
        <tui-input
          tuiTextfieldSize="m"
          [tuiTextfieldLabelOutside]="true">
          <input
            name="ws-gr-{{column}}"
            tuiTextfieldLegacy
            [disabled]="!enabled"
            (drop)="disableEvent($event)"
            (paste)="disableEvent($event)"
            (change)="inputChanged($event)"
          />
        </tui-input>
      </td>
    </ng-container>
    <td>
      {{ score }}
    </td>
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
  @Input() currentCharacter?: string;

  // @ts-ignore
  @Input() data: GameRoundData;
  @Output() dataChange = new EventEmitter<GameRoundData>();

  enabled = this.character === this.currentCharacter;

  inputChanged(event: any) {
    console.log(event);
  }

  disableEvent(event: any) {
    event.preventDefault();
  }
}
