import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { getCurrentUser } from 'aws-amplify/auth';

export const authGuard: CanActivateFn = async (route, state) => {
  const router = inject(Router);

  try {
    // IF User is logged in, let in
    await getCurrentUser();
    return true;
  } catch (error) {
    // IF User is NOT logged in, return to welcome page
    router.navigate(['/tabs/welcome']);
    return false;
  }
};
