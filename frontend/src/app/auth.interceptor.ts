import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { fetchAuthSession } from 'aws-amplify/auth';
import { catchError, from, switchMap } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  return from(fetchAuthSession()).pipe(
    switchMap((session) => {
      // AWS id-token
      const token = session.tokens?.idToken?.toString();

      if (token) {
        const clonedReq = req.clone({
          setHeaders: {
            Authorization: `Bearer ${token}`,
          },
        });

        // Continue with cloned request
        return next(clonedReq);
      }

      // if no token, continue with original request
      return next(req);
    }),
    catchError((error) => {
      console.log('Session not found', error);

      router.navigate(['/tabs/welcome']);

      throw error;
    }),
  );
};
