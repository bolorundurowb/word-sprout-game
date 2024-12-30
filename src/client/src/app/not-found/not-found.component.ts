import { Component } from '@angular/core';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'ws-not-found',
  standalone: true,
  imports: [],
  templateUrl: 'not-found.component.html',
  styleUrl: 'not-found.component.scss'
})
export class NotFoundComponent {
  constructor(title: Title) {
    title.setTitle('404 | Word Sprout');
  }
}
