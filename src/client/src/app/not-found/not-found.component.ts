import { Component } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'ws-not-found',
  standalone: true,
  imports: [
    RouterLink
  ],
  templateUrl: 'not-found.component.html',
  styleUrl: 'not-found.component.scss'
})
export class NotFoundComponent {
  constructor(title: Title) {
    title.setTitle('404 | Word Sprout');
  }
}
