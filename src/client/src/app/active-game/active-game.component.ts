import { Component, computed, inject, OnInit, signal, ViewChild, WritableSignal } from '@angular/core';
import { TuiButton, TuiDataList, TuiDialog, TuiDialogContext, TuiLoader, TuiTitle } from '@taiga-ui/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { JsonPipe, KeyValuePipe, NgClass, NgForOf, NgIf, NgOptimizedImage, NgStyle } from '@angular/common';
import { GameService } from '../services/game.service';
import { ToastService } from '../services/toast.service';
import { GameRealTimeService } from '../services/game-rt.service';
import { TuiChip, TuiDataListWrapper } from '@taiga-ui/kit';
import { UserService } from '../services/user.service';
import { GameRoundRowComponent } from '../components/game-round-row.component';
import { PolymorpheusContent } from '@taiga-ui/polymorpheus';
import { TuiSelectModule, TuiTextfieldControllerModule } from '@taiga-ui/legacy';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { ScoreGameRowComponent } from "../components/score-game-row.component";
import { Game, GameRoundStatus, GameState, RowData } from "../app.types";
import { parseErrorMessage } from "../app.utils";

@Component({
  selector: 'ws-active-game',
  standalone: true,
  imports: [
    TuiTitle,
    JsonPipe,
    NgForOf,
    TuiChip,
    NgIf,
    KeyValuePipe,
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
    NgClass,
    ScoreGameRowComponent,
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

  @ViewChild('chooseCharacter') chooseCharacterTemplate: PolymorpheusContent<TuiDialogContext> | null = null;

  avatarColors = ['#a2b9bc', '#6b5b95', '#feb236', '#d64161', '#ff7b25', '#b2ad7f', '#878f99'];
  gameCode: string = '';
  joinGameUrl: string = '';
  game: WritableSignal<Game> = signal({} as Game);

  currentUserName = signal('');
  isGameActive = computed(() => this.game().status === this.GAME_ACTIVE);
  isGameAdmin = computed(() => this.game().initiatedBy === this.currentUserName());
  isRoundComptroller = computed(() => this.currentUserName() === this.gameState.currentPlayer);
  gameState: GameState = { playedCharacters: [], secsSinceStatusChange: 0 };
  isLoading = false;
  currentUserPlays: Record<string, RowData> = {};

  // interval state details
  currentIntervalCountdown = 0;
  currentIntervalCountdownIntervalId?: any;

  // state for the round selection modal
  isCharacterSelectionModalVisible = false;
  availableCharacters: string[] = [];
  characterControl = new FormControl<string>('', [
    Validators.required
  ]);

  // round state details
  isRoundSubmissionModalVisible = false;
  currentRoundCountdownIntervalId?: any;
  currentRoundCountdown = 0;
  roundEntry: any;
  currentRoundPlays: Record<string, RowData> = {};

  // round over state details
  isRoundEndedModalVisible = false;
  endedRoundUserPlays: Record<string, RowData> = {};


  constructor(title: Title) {
    title.setTitle('Active Game | Word Sprout');
  }

  async ngOnInit() {
    try {
      this.gameCode = this.parseGameCode();
      this.currentUserName.set(this.getCurrentUsername());
      this.joinGameUrl = this.composeJoinUrl();
      this.game.set(await this.getAndValidateGame());

      // if game status is active get the current state and user plays
      if (this.isGameActive()) {
        this.setGameState(await this.gameService.getState(this.gameCode));
        this.currentUserPlays = await this.gameService.getPlays(this.gameCode, this.currentUserName());
      }

      // initialize the play row data
      this.initializeRowData();

      // set up the real time service
      const gameRtService = new GameRealTimeService(this.gameCode);
      await gameRtService.init();
      this.addRtListeners(gameRtService);
    } catch (e) {
      console.error(e);
      this.toasts.showError(parseErrorMessage(e));
      await this.router.navigate(['/']);
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
      clearInterval(this.currentIntervalCountdownIntervalId);
      this.isCharacterSelectionModalVisible = false;
    } catch (e) {
      this.toasts.showError(parseErrorMessage(e));
    } finally {
      this.isLoading = false;
    }

    return false;
  }

  async submitRound() {
    this.isLoading = true;

    try {
      // stop the round countdown
      if (this.currentRoundCountdownIntervalId) {
        clearInterval(this.currentRoundCountdownIntervalId);
      }

      const character = this.gameState.currentCharacter!;
      console.log('About to submit round', this.currentUserPlays, character);
      const res = await this.gameService.submitPlay(this.gameCode, this.currentUserName(), character, this.currentUserPlays[character]);
      // TODO: display the submitted play
      console.log('------------->', res, '<----------->')
      console.log('Round submitted');
      this.currentUserPlays[res.character] = res.columnValues;

      this.dismissRoundConfirmationModal();
    } catch (e) {
      this.toasts.showError(parseErrorMessage(e));
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

  showRoundConfirmationModal() {
    this.isRoundSubmissionModalVisible = true;
  }

  dismissRoundConfirmationModal() {
    this.isRoundSubmissionModalVisible = false;
  }

  showRoundEndedModal() {
    this.isRoundEndedModalVisible = true;
  }

  dismissRoundEndedModal() {
    this.isRoundEndedModalVisible = false;
  }

  rowDataChanged(event: any) {
    console.log(event);
    this.roundEntry = event;
  }

  protected isRowPlayed(character: string): boolean {
    return this.gameState.playedCharacters?.includes(character) ?? false;
  }

  protected isRowPlayable(character: string): boolean {
    return this.gameState.roundStatus === GameRoundStatus.PLAYING
      && character === this.gameState.currentCharacter;
  }

  private hasPlayerSubmittedRow(character: string): boolean {
    return this.currentUserPlays[character] !== undefined;
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

  private setGameState(gameState: Partial<GameState>) {
    this.gameState = {...this.gameState, ...gameState};
    const isCurrentPlayer = this.gameState.currentPlayer === this.currentUserName();
    const roundInProgress = this.gameState.currentCharacter && !this.gameState.playedCharacters.includes(this.gameState.currentCharacter);

    if (this.gameState.roundStatus === GameRoundStatus.PLAYING) {
      // TODO: add in logic to allow or continuing game play
      const timeRemaining = this.game().maxRoundDurationInSecs - this.gameState.secsSinceStatusChange;

      if (timeRemaining <= 0) {
        this.submitRound().then(() => console.log('Triggered a submission afrer loading the page'));
      } else {
        this.startRoundCountdown(timeRemaining);
      }
    } else {
      if (isCurrentPlayer) {
        this.showChooseCharacterModal();
      }
    }
  }

  private startRoundCountdown(timeInSecs: number) {
    this.currentRoundCountdown = timeInSecs;
    this.currentRoundCountdownIntervalId = setInterval(() => {
      this.currentRoundCountdown -= 1;
      if (this.currentRoundCountdown === 0) {
        clearInterval(this.currentRoundCountdownIntervalId);
        this.submitRound().then(() => {
          console.log('Round submitted after timeout');
        });
      }
    }, 1000);
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
    });

    // trigger the countdown as well as the player to choose c character
    rtService.roundCountdownInitiated().subscribe(gameState => {
      this.setGameState(gameState);

      this.currentIntervalCountdown = this.game().maxIntervalBetweenRoundsInSecs;
      this.currentIntervalCountdownIntervalId = setInterval(() => {
        this.currentIntervalCountdown -= 1;
        if (this.currentIntervalCountdown === 0) {
          this.characterControl.setValue(this.getRandomElement(this.availableCharacters));
          this.startRound().then(() => {
            console.log('Round started after timeout');
          });
        }
      }, 1000);
    });

    // trigger the countdown for the game round
    rtService.roundStarted().subscribe((gameState) => {
      this.setGameState(gameState);

      // cancel the interval countdown
      this.currentIntervalCountdown = 0;
      if (this.currentIntervalCountdownIntervalId) {
        clearInterval(this.currentIntervalCountdownIntervalId)
      }

      // start the round countdown
      this.startRoundCountdown(this.game().maxRoundDurationInSecs);

    // record round user plays
    rtService.roundPlaySubmitted().subscribe(({character, userName, columnValues}) => {
      if (this.gameState.currentCharacter !== character) {
        console.error('For some reason we received a play for the wrong character', {userName, character, columnValues});
      } else {
        this.currentRoundPlays[userName] = columnValues;
      }
    });

    // force submission and display round plays
    rtService.roundEnded().subscribe(async (gameState) => {
      this.setGameState(gameState);

      await this.submitRound()
      this.showRoundEndedModal();
    });

    // show the winner details and score breakdown
    rtService.gameOver().subscribe(({ winningPlayers, playerScores }) => {
      // TODO: display winners and prompt to play again
      this.toasts.showSuccess('Game over. Thanks for playing!');
    });
  }

  private getRandomElement<T>(array: T[]): T {
    if (array.length === 0) {
      throw new Error('Array is empty.');
    }

    const randomIndex = Math.floor(Math.random() * array.length);
    return array[randomIndex];
  }

  private initializeRowData() {
    for (const character of this.game().characterSet) {
      if (!this.currentUserPlays[character]) {
        this.currentUserPlays[character] = {};
      }
    }
  }

  protected readonly GameRoundStatus = GameRoundStatus;
}
