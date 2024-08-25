import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TuiRoot, TuiTitle } from '@taiga-ui/core';

@Component({
  selector: 'ws-root',
  standalone: true,
  imports: [ RouterOutlet, TuiRoot, TuiTitle ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
}
