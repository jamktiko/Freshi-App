import { Routes } from '@angular/router';
import { TabsPage } from './tabs.page';
import { authGuard } from '../auth-guard';
import { loggedInGuard } from '../logged-in-guard';

export const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    children: [
      {
        path: 'register',
        loadComponent: () =>
          import('../register/register.page').then((m) => m.RegisterPage),
        canActivate: [loggedInGuard],
      },
      {
        path: 'confirm',
        loadComponent: () =>
          import('../confirm/confirm.page').then((m) => m.ConfirmPage),
        canActivate: [loggedInGuard],
      },
      {
        path: 'login',
        loadComponent: () =>
          import('../login/login.page').then((m) => m.LoginPage),
        canActivate: [loggedInGuard],
      },
      {
        path: 'home',
        loadComponent: () =>
          import('../home/home.page').then((m) => m.HomePage),
        canActivate: [authGuard],
      },
      {
        path: 'welcome',
        loadComponent: () =>
          import('../welcome/welcome.page').then((m) => m.WelcomePage),
        canActivate: [loggedInGuard],
      },
      {
        path: 'settings',
        loadComponent: () =>
          import('../settings/settings.page').then((m) => m.SettingsPage),
        canActivate: [authGuard],
      },
      {
        path: '',
        loadComponent: () =>
          import('../home/home.page').then((m) => m.HomePage),
        canActivate: [authGuard],
        pathMatch: 'full',
      },
    ],
  },
  {
    path: '',
    redirectTo: '/tabs/home',
    pathMatch: 'full',
  },
];
