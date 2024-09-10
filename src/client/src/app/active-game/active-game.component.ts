import { Component, computed, inject, OnChanges, OnInit, signal, SimpleChanges, ViewChild } from '@angular/core';
import {
  TuiButton, TuiDataList, TuiDialog,
  TuiDialogContext,
  TuiDialogService,
  TuiLoader,
  TuiTextfieldOptionsDirective,
  TuiTitle
} from '@taiga-ui/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { JsonPipe, NgForOf, NgIf, NgOptimizedImage, NgStyle } from '@angular/common';
import { GameService } from '../services/game.service';
import { ToastService } from '../services/toast.service';
import { GameRealTimeService } from '../services/game-rt.service';
import { TuiChip, TuiDataListWrapper } from '@taiga-ui/kit';
import { UserService } from '../services/user.service';
import { GameRoundRowComponent } from '../components/game-round-row.component';
import { PolymorpheusContent } from '@taiga-ui/polymorpheus';
import { TuiSelectModule, TuiTextfieldControllerModule } from '@taiga-ui/legacy';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';

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
    NgStyle,
    NgOptimizedImage,
    GameRoundRowComponent,
    TuiSelectModule,
    TuiTextfieldControllerModule,
    ReactiveFormsModule,
    TuiDataListWrapper,
    TuiDataList,
    TuiDialog,
  ],
  templateUrl: 'active-game.component.html',
  styleUrl: 'active-game.component.scss'
})
export class ActiveGameComponent implements OnInit {
  GAME_ACTIVE = 'Active';

  private readonly toasts = inject(ToastService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly gameService = inject(GameService);
  private readonly userService = inject(UserService);
  private readonly dialogs = inject(TuiDialogService);

  @ViewChild('chooseCharacter') chooseCharacterTemplate: PolymorpheusContent<TuiDialogContext> | null = null;

  avatarColors = [ '#a2b9bc', '#6b5b95', '#feb236', '#d64161', '#ff7b25', '#b2ad7f', '#878f99' ];
  gameCode: string = '';
  joinGameUrl: string = '';
  game = signal({} as any);

  currentUserName = signal('');
  isGameActive = computed(() => this.game().status === this.GAME_ACTIVE);
  isGameAdmin = computed(() => this.game().initiatedBy === this.currentUserName());
  isLoading = false;

  currentIntervalCountdown = 0;
  currentRoundCountdown = 0;
  gameState: any = {};

  // state for the round selection modal
  isCharacterSelectionModalVisible = false;
  availableCharacters: string[] = [];
  characterControl = new FormControl<string>('', [
    Validators.required
  ]);


  constructor(title: Title) {
    title.setTitle('Active Game | Word Sprout');
  }

  async ngOnInit() {
    try {
      this.gameCode = this.parseGameCode();
      this.currentUserName.set(this.getCurrentUsername());
      this.joinGameUrl = this.composeJoinUrl();
      this.game.set(await this.getAndValidateGame());

      // if game status is active get the current state
      if (this.isGameActive()) {
        const gameState = await this.gameService.getState(this.gameCode);
        this.setGameState(gameState);
      }

      // set up the real time service
      const gameRtService = new GameRealTimeService(this.gameCode);
      await gameRtService.init();
      this.addRtListeners(gameRtService);
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
      this.game.set(await this.gameService.start(this.gameCode));
    } catch (e) {
      this.toasts.showError((e as any)?.error?.message ?? 'Something went wrong');
    } finally {
      this.isLoading = false;
    }
  }

  async startRound() {
    this.isLoading = true;

    try {
      await this.gameService.startRound(this.gameCode, this.characterControl.value!, this.currentUserName());
      this.isCharacterSelectionModalVisible = false;
    } catch (e) {
      this.toasts.showError((e as any)?.error?.message ?? 'Something went wrong');
    } finally {
      this.isLoading = false;
    }
  }

  avatarColour(index: number): string {
    return this.avatarColors[index % this.avatarColors.length];
  }

  showChooseCharacterModal() {
    // reset state fields
    this.characterControl.reset();
    this.availableCharacters = this.game().characterSet
      .filter((x: string) => !this.gameState.playedCharacters.includes(x));

    this.isCharacterSelectionModalVisible = true;
  }

  private parseGameCode(): string {
    const gameCode = this.route.snapshot.paramMap.get('gameCode');

    if (!gameCode) {
      throw new Error('No game code configured');
    }

    return gameCode;
  }

  private getCurrentUsername(): string {
    const currentUserName = this.userService.getUsername();

    if (!currentUserName) {
      throw new Error('You do not have a configured user name');
    }

    return currentUserName;
  }

  private composeJoinUrl(): string {
    return `${location.origin}/games/join?code=${this.gameCode}`;
  }

  private async getAndValidateGame(): Promise<any> {
    const game = (await this.gameService.getByCode(this.gameCode)) as any;

    if (!game.players.some((x: { userName: string; }) => x.userName === this.currentUserName())) {
      throw new Error('You are not a player in this game');
    }

    return game;
  }

  private setGameState(gameState: any) {
    this.gameState = gameState;
    const isCurrentPlayer = this.gameState.currentPlayer === this.currentUserName();

    if (isCurrentPlayer) {
      this.showChooseCharacterModal();
    }
  }

  private addRtListeners(rtService: GameRealTimeService) {
    // update players list when a new one joins
    rtService.playerJoined().subscribe(userName => {
      this.game.update(game => {
        game.players.push({ userName });
        return game;
      });
    });

    // indicate that the game has started
    rtService.gameStarted().subscribe(() => {
      this.game.update(game => ({ ...game, status: this.GAME_ACTIVE }));
      this.setGameState({ playedCharacters: [] });
    });

    // trigger the countdown as well as the player to choose c character
    rtService.roundCountdownInitiated().subscribe(currentPlayer => {
      this.setGameState({ ...this.gameState, currentPlayer });

      this.currentIntervalCountdown = this.game().maxIntervalBetweenRoundsInSecs;
      const intervalId = setInterval(() => {
        this.currentIntervalCountdown -= 1;
        if (this.currentIntervalCountdown === 0) {
          clearInterval(intervalId);
        }
      }, 1000);
    });
  }
}
