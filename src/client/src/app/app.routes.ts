import { Routes } from '@angular/router';
import { HowToComponent } from './how-to/how-to.component';
import { NewGameComponent } from './new-game/new-game.component';
import { ActiveGameComponent } from './active-game/active-game.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'instructions',
    pathMatch: 'full'
  },
  {
    path: 'instructions',
    component: HowToComponent
  },
  {
    path: 'new-game',
    component: NewGameComponent
  },
  {
    path: 'active-game/:gameCode',
    component: ActiveGameComponent
  }
];
