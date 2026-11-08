import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'learn' },
  { path: 'learn', loadComponent: () => import('./pages/learn').then(m => m.LearnComponent), title: 'Learn Xiangqi' },
  { path: 'play', loadComponent: () => import('./pages/play').then(m => m.PlayComponent), title: 'Play Xiangqi' },
];
