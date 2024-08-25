import { Component } from '@angular/core';
import { TuiButton, TuiTitle } from '@taiga-ui/core';

@Component({
  selector: 'ws-how-to',
  standalone: true,
  imports: [
    TuiTitle,
    TuiButton
  ],
  templateUrl: 'how-to.component.html',
  styleUrl: 'how-to.component.scss',
})
export class HowToComponent {
}
