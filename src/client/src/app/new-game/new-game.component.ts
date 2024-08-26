import { Component } from '@angular/core';
import { TuiTitle } from '@taiga-ui/core';

@Component({
  selector: 'ws-new-game',
  standalone: true,
  imports: [
    TuiTitle
  ],
  templateUrl: 'new-game.component.html',
  styleUrl: 'new-game.component.scss'
})
export class NewGameComponent {
}
