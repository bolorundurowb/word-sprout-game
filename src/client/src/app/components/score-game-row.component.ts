import { Component, Input } from "@angular/core";

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
  @Input() columnEntries: Array<string> = [];
}
