import { Component, Input } from "@angular/core";
import { RowData } from "../app.types";

@Component({
  selector: 'ws-score-game-round-row',
  standalone: true,
  template: `
    <div>
      Hello
      {{ userName }}
      {{ columnEntries }}
    </div>
  `,
  styles: `
  `
})
export class ScoreGameRowComponent {
  @Input() userName: string = '';
  @Input() columnEntries: RowData = {};
}

@Component({
  selector: 'ws-score-game-round-cell',
  standalone: true,
  template: `
  <div>Hello</div>
  `,
  styles: ``
})
export class ScoreGameRoundCellComponent {

}
