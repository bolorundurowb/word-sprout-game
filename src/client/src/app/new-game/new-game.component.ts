import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { TuiAlertService, TuiLoader, TuiTextfield, TuiTitle } from '@taiga-ui/core';
import {
  TuiInputModule,
  TuiInputNumberModule,
  TuiInputTagModule,
  TuiTextfieldControllerModule
} from '@taiga-ui/legacy';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { UserService } from '../services/user.service';
import { GameService } from '../services/game.service';

@Component({
  selector: 'ws-new-game',
  standalone: true,
  imports: [
    TuiTitle,
    TuiInputModule,
    TuiInputNumberModule,
    TuiTextfieldControllerModule,
    TuiTextfield,
    TuiInputTagModule,
    ReactiveFormsModule,
    TuiLoader
  ],
  templateUrl: 'new-game.component.html',
  styleUrl: 'new-game.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NewGameComponent implements OnInit {
  private readonly alerts = inject(TuiAlertService);
  private readonly router = inject(Router);
  private readonly gameService = inject(GameService);
  private readonly userService = inject(UserService);

  isLoading = false;
  defaultColumns = [ 'Name', 'Animal', 'Place', 'Food', 'Thing/Item' ];
  defaultCharacters = [ 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z' ];

  gameForm = new FormGroup({
    username: new FormControl<string>('', [
      Validators.required
    ]),
    maxRoundDurationInSecs: new FormControl<number>(30, [
      Validators.min(10),
      Validators.max(60),
      Validators.required
    ]),
    maxIntervalBetweenRoundsInSecs: new FormControl<number>(15, [
      Validators.min(5),
      Validators.max(30),
      Validators.required
    ]),
    columns: new FormControl<string[]>(this.defaultColumns, [
      Validators.minLength(1),
      Validators.maxLength(10),
      Validators.required
    ]),
    characterSet: new FormControl<string[]>(this.defaultCharacters, [
      Validators.minLength(1),
      Validators.maxLength(100),
      Validators.required
    ]),
  });

  constructor(title: Title) {
    title.setTitle('New Game | Word Sprout');
  }

  ngOnInit() {
    this.gameForm.patchValue({
      username: this.userService.getUsername()
    });
  }

  async createGame() {
    this.isLoading = true;

    try {
      const payload = this.gameForm.value;
      const res = await this.gameService.create(payload) as any;

      this.alerts.open('Game created successfully', {
        label: 'Success',
        appearance: 'success',
        autoClose: 0,
      }).subscribe();

      // persist the chosen username
      this.userService.setUsername(payload.username!);

      // reroute to the active game page
      await this.router.navigate([ 'games', 'active', res.code ]);
    } catch (e) {
      this.alerts.open((e as any)?.error?.message ?? 'Something went wrong', {
        label: 'Error',
        appearance: 'error',
        autoClose: 0,
      }).subscribe();
    } finally {
      this.isLoading = false;
    }
  }
}
