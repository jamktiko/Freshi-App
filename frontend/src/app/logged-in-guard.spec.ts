import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { loggedInGuard } from './logged-in-guard';

describe('loggedInGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => loggedInGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
