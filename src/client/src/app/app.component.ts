import { Component, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { TuiRoot, TuiTitle } from '@taiga-ui/core';

@Component({
  selector: 'ws-root',
  standalone: true,
  imports: [ RouterOutlet, TuiRoot, TuiTitle ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  private readonly router = inject(Router);

  async goHome() {
    await this.router.navigate(['/']);
  }
}
