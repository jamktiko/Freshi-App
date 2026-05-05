import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { getCurrentUser } from 'aws-amplify/auth';

export const loggedInGuard: CanActivateFn = async (route, state) => {
  const router = inject(Router);
  try {
    // IF user is logged in, return to home page
    await getCurrentUser();
    router.navigate(['/tabs/home']);
    return false;
  } catch (error) {
    // IF user is NOT logged in, let in
    return true;
  }
};
