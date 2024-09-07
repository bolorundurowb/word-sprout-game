import { Component, inject, OnInit } from '@angular/core';
import { TuiTitle } from '@taiga-ui/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { JsonPipe, NgForOf } from '@angular/common';
import { GameService } from '../services/game.service';
import { ToastService } from '../services/toast.service';

@Component({
  selector: 'ws-active-game',
  standalone: true,
  imports: [
    TuiTitle,
    JsonPipe,
    NgForOf,
  ],
  templateUrl: 'active-game.component.html',
  styleUrl: 'active-game.component.scss'
})
export class ActiveGameComponent implements OnInit {
  private readonly toasts = inject(ToastService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly gameService = inject(GameService);

  gameCode: string = '';
  joinGameUrl: string = '';
  game: any = {};

  constructor(title: Title) {
    title.setTitle('Active Game | Word Sprout');
  }

  async ngOnInit() {
    try {
      this.gameCode = this.route.snapshot.paramMap.get('gameCode')!;
      this.joinGameUrl = `${location.origin}/games/join?code=${this.gameCode}`;
      this.game = await this.gameService.getByCode(this.gameCode);
    } catch (e) {
      this.toasts.showError((e as any)?.error?.message ?? 'Something went wrong');
      await this.router.navigate(['/']);
    }
  }
}
