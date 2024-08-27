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
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

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
    username: new FormControl(''),
    maxRoundDurationInSecs: new FormControl(30),
    maxIntervalBetweenRoundsInSecs: new FormControl(15),
    columns: new FormControl(this.defaultColumns),
    characterSet: new FormControl(this.defaultCharacters),
  });

  constructor(title: Title, private userService: UserService) {
    title.setTitle('New Game | Word Sprout');
  }

  ngOnInit() {
    this.gameForm.get('username')?.setValue(this.userService.getUsername());
  }
}
