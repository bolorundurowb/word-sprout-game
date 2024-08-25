import { Component } from '@angular/core';
import { TuiButton, TuiTitle } from '@taiga-ui/core';
import { Router } from '@angular/router';

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
  constructor(private router: Router) {
  }

  async goToNewGame() {
    await this.router.navigate(['games/new']);
  }
}
