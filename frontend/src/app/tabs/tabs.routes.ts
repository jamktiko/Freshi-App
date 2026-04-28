import { Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

export const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    children: [
      {
        path: 'register',
        loadComponent: () =>
          import('../register/register.page').then((m) => m.RegisterPage),
      },
      {
        path: 'confirm',
        loadComponent: () =>
          import('../confirm/confirm.page').then((m) => m.ConfirmPage),
      },
      {
        path: 'login',
        loadComponent: () =>
          import('../login/login.page').then((m) => m.LoginPage),
      },
      {
        path: 'home',
        loadComponent: () =>
          import('../home/home.page').then((m) => m.HomePage),
      },
      {
        path: '',
        redirectTo: '/tabs/register',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: '',
    redirectTo: '/tabs/register',
    pathMatch: 'full',
  },
];
