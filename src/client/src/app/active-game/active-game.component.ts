import { Component, inject, OnInit } from '@angular/core';
import { TuiButton, TuiLoader, TuiTitle } from '@taiga-ui/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { JsonPipe, NgForOf, NgIf, NgOptimizedImage, NgStyle } from '@angular/common';
import { GameService } from '../services/game.service';
import { ToastService } from '../services/toast.service';
import { GameRealTimeService } from '../services/game-rt.service';
import { TuiChip } from '@taiga-ui/kit';
import { UserService } from '../services/user.service';
import { TuiTable } from '@taiga-ui/addon-table';

@Component({
  selector: 'ws-active-game',
  standalone: true,
  imports: [
    TuiTitle,
    JsonPipe,
    NgForOf,
    TuiChip,
    NgIf,
    TuiButton,
    TuiLoader,
    TuiTable,
    NgStyle,
    NgOptimizedImage,
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

  avatarColors = ['#a2b9bc', '#6b5b95', '#feb236', '#d64161', '#ff7b25', '#b2ad7f', '#878f99'];
  gameCode: string = '';
  joinGameUrl: string = '';
  game: any = {};
  gameRtService?: GameRealTimeService;

  currentUserName: string = '';
  userInitiatedGame = false;
  isLoading = false;

  gameStarted = false;
  currentIntervalCountdown = 0;
  currentRoundCountdown = 0;
  gameState: any = {};


  constructor(title: Title) {
    title.setTitle('Active Game | Word Sprout');
  }

  avatarColour(index: number): string {
    return this.avatarColors[index % this.avatarColors.length];
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

      this.userInitiatedGame = this.game.initiatedBy === currentUserName;
      this.gameStarted = this.game.status === 'Active';

      // if game status is active get the current state
      if (this.gameStarted) {
        this.gameState = await this.gameService.getState(this.gameCode);
      }

      // set up the real time service
      this.gameRtService = new GameRealTimeService(this.gameCode);
      await this.gameRtService.init();
      this.gameRtService.playerJoined().subscribe(userName => {
        this.game.players.push({ userName });
      });
      this.gameRtService.gameStarted().subscribe(() => {
        this.game.status = 'Active';
        this.gameStarted = true;
      });
      this.gameRtService.roundCountdownInitiated().subscribe(currentPlayer => {
        this.gameState.currentPlayer = currentPlayer;
        this.currentIntervalCountdown = this.game.maxIntervalBetweenRoundsInSecs;
        const intervalId = setInterval(() => {
          this.currentIntervalCountdown -= 1;
          if (this.currentIntervalCountdown === 0) {
            clearInterval(intervalId);
          }
        }, 1000);
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

  async startGame() {
    this.isLoading = true;

    try {
      this.game = await this.gameService.start(this.gameCode);
    } catch (e) {
      this.toasts.showError((e as any)?.error?.message ?? 'Something went wrong');
    } finally {
      this.isLoading = false;
    }
  }
}
