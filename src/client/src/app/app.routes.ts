import { Routes } from '@angular/router';
import { HowToComponent } from './how-to/how-to.component';
import { NewGameComponent } from './new-game/new-game.component';
import { ActiveGameComponent } from './active-game/active-game.component';
import { JoinGameComponent } from './join-game/join-game.component';
import { NotFoundComponent } from './not-found/not-found.component';

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
    path: 'games/new',
    component: NewGameComponent
  },
  {
    path: 'games/join',
    component: JoinGameComponent
  },
  {
    path: 'games/active/:gameCode',
    component: ActiveGameComponent
  },
  {
    path: '404',
    component: NotFoundComponent
  },
  {
    path: '**',
    redirectTo: '404'
  }
];
