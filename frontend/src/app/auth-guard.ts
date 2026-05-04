import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { getCurrentUser } from 'aws-amplify/auth';

export const authGuard: CanActivateFn = async (route, state) => {
  const router = inject(Router);

  try {
    await getCurrentUser();
    return true;
  } catch (error) {
    router.navigate(['/tabs/welcome']);
    return false;
  }
};
