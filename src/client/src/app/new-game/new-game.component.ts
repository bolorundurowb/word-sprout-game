import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { TuiTextfield, TuiTitle } from '@taiga-ui/core';
import {
  TuiInputModule,
  TuiInputNumberModule,
  TuiInputTagModule,
  TuiTextfieldControllerModule
} from '@taiga-ui/legacy';
import { Title } from '@angular/platform-browser';
import { UserService } from '../services/user.service';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

interface NewGameReq {
  userName: string;
  maxRoundDurationInSecs: number;
  maxIntervalBetweenRoundsInSecs: number;
  columns: string[];
  characterSet: string[];
}

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
    ReactiveFormsModule
  ],
  templateUrl: 'new-game.component.html',
  styleUrl: 'new-game.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NewGameComponent implements OnInit {
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

  constructor(title: Title, private userService: UserService) {
    title.setTitle('New Game | Word Sprout');
  }

  ngOnInit() {
    this.gameForm.patchValue({
      username: this.userService.getUsername()
    });
  }

  createGame() {
    console.log('Hello world');
  }
}
