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
        path: 'welcome',
        loadComponent: () =>
          import('../welcome/welcome.page').then((m) => m.WelcomePage),
      },
      {
        path: 'settings',
        loadComponent: () =>
          import('../settings/settings.page').then((m) => m.SettingsPage),
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
    redirectTo: '/tabs/welcome',
    pathMatch: 'full',
  },
];
