import { Component, inject, OnInit } from '@angular/core';
import { TuiButton, TuiTitle } from '@taiga-ui/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { JsonPipe, NgForOf, NgIf } from '@angular/common';
import { GameService } from '../services/game.service';
import { ToastService } from '../services/toast.service';
import { GameRealTimeService } from '../services/game-rt.service';
import { TuiChip } from '@taiga-ui/kit';
import { UserService } from '../services/user.service';

@Component({
  selector: 'ws-active-game',
  standalone: true,
  imports: [
    TuiTitle,
    JsonPipe,
    NgForOf,
    TuiChip,
    NgIf,
    TuiButton
  ],
  templateUrl: 'active-game.component.html',
  styleUrl: 'active-game.component.scss'
})
export class ActiveGameComponent implements OnInit {
  private readonly toasts = inject(ToastService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly gameService = inject(GameService);
  private readonly userService = inject(UserService);
  gameRtService?: GameRealTimeService;

  currentUserName: string = '';
  gameCode: string = '';
  joinGameUrl: string = '';
  game: any = {};

  constructor(title: Title) {
    title.setTitle('Active Game | Word Sprout');
  }

  async ngOnInit() {
    try {
      this.gameCode = this.route.snapshot.paramMap.get('gameCode')!;
      const currentUserName = this.userService.getUsername();

      if (!currentUserName) {
        throw new Error('You do not have a configured user name');
      }

      this.currentUserName = currentUserName;
      this.joinGameUrl = `${location.origin}/games/join?code=${this.gameCode}`;
      this.game = await this.gameService.getByCode(this.gameCode);

      if (!this.game.players.some((x: { userName: string; }) => x.userName === currentUserName)) {
        throw new Error('You are not a player in this game');
      }

      // set up the real time service
      this.gameRtService = new GameRealTimeService(this.gameCode);
      await this.gameRtService.init();
      this.gameRtService.playerJoined().subscribe(userName => {
        this.game.players.push({ userName });
      });
    } catch (e) {
      this.toasts.showError((e as any)?.error?.message ?? 'Something went wrong');
      await this.router.navigate([ '/' ]);
    }
  }

  async copyGameUrl() {
    await navigator.clipboard.writeText(this.joinGameUrl);
    this.toasts.showSuccess('Game link copied to clipboard');
  }
}
