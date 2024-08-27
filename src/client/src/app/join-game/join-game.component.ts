import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { TuiAlertService, TuiLoader, TuiTextfield, TuiTitle } from '@taiga-ui/core';
import {
  TuiInputModule,
} from '@taiga-ui/legacy';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { UserService } from '../services/user.service';
import { GameService } from '../services/game.service';

@Component({
  selector: 'ws-join-game',
  standalone: true,
  imports: [
    TuiTitle,
    TuiInputModule,
    TuiTextfield,
    ReactiveFormsModule,
    TuiLoader
  ],
  templateUrl: 'join-game.component.html',
  styleUrl: 'join-game.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JoinGameComponent implements OnInit {
  private readonly alerts = inject(TuiAlertService);
  private readonly router = inject(Router);
  private readonly gameService = inject(GameService);
  private readonly userService = inject(UserService);

  isLoading = false;

  joinForm = new FormGroup({
    username: new FormControl<string>('', [
      Validators.required
    ]),
    gameCode: new FormControl<string>('', [
      Validators.required
    ]),
  });

  constructor(title: Title) {
    title.setTitle('Join Game | Word Sprout');
  }

  ngOnInit() {
    this.joinForm.patchValue({
      username: this.userService.getUsername()
    });
  }

  async joinGame() {
    this.isLoading = true;

    try {
      const payload = this.joinForm.value;
      const res = await this.gameService.create(payload) as any;

      this.alerts.open('Game joined successfully', {
        label: 'Success',
        appearance: 'success',
        autoClose: 0,
      }).subscribe();

      // persist the chosen username
      this.userService.setUsername(payload.username!);

      // reroute to the active game page
      await this.router.navigate([ 'games', 'active', res.code ]);
    } catch (e) {
      this.alerts.open(e as string || 'Something went wrong', {
        label: 'Error',
        appearance: 'error',
        autoClose: 0,
      }).subscribe();
    } finally {
      this.isLoading = false;
    }
  }
}
