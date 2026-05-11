/**
 * Unit tests for authGuard and loggedInGuard.
 *
 * Uses jest.mock to intercept the aws-amplify/auth module so we can
 * control whether getCurrentUser resolves (logged in) or rejects
 * (not logged in) — without hitting any real AWS endpoints.
 *
 * The Angular inject(Router) call is handled by running the guard
 * inside TestBed.runInInjectionContext().
 */

import { TestBed } from '@angular/core/testing';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { getCurrentUser } from 'aws-amplify/auth';
import { authGuard } from '../auth-guard';
import { loggedInGuard } from '../logged-in-guard';

// Mock aws-amplify/auth at the module level
jest.mock('aws-amplify/auth', () => ({
  getCurrentUser: jest.fn(),
}));

const mockedGetCurrentUser = getCurrentUser as jest.Mock;

describe('authGuard', () => {
  let routerSpy: { navigate: jest.Mock };

  const dummyRoute = {} as ActivatedRouteSnapshot;
  const dummyState = {} as RouterStateSnapshot;

  beforeEach(() => {
    jest.clearAllMocks();
    routerSpy = { navigate: jest.fn() };

    TestBed.configureTestingModule({
      providers: [{ provide: Router, useValue: routerSpy }],
    });
  });

  it('should allow access when user is authenticated', async () => {
    mockedGetCurrentUser.mockResolvedValue({ username: 'test-user', userId: '123' });

    const result = await TestBed.runInInjectionContext(() =>
      authGuard(dummyRoute, dummyState),
    );

    expect(result).toBe(true);
    expect(routerSpy.navigate).not.toHaveBeenCalled();
  });

  it('should redirect to /tabs/welcome when user is NOT authenticated', async () => {
    mockedGetCurrentUser.mockRejectedValue(new Error('not authenticated'));

    const result = await TestBed.runInInjectionContext(() =>
      authGuard(dummyRoute, dummyState),
    );

    expect(result).toBe(false);
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/tabs/welcome']);
  });
});

describe('loggedInGuard', () => {
  let routerSpy: { navigate: jest.Mock };

  const dummyRoute = {} as ActivatedRouteSnapshot;
  const dummyState = {} as RouterStateSnapshot;

  beforeEach(() => {
    jest.clearAllMocks();
    routerSpy = { navigate: jest.fn() };

    TestBed.configureTestingModule({
      providers: [{ provide: Router, useValue: routerSpy }],
    });
  });

  it('should redirect to /tabs/home when user IS authenticated', async () => {
    mockedGetCurrentUser.mockResolvedValue({ username: 'test-user', userId: '123' });

    const result = await TestBed.runInInjectionContext(() =>
      loggedInGuard(dummyRoute, dummyState),
    );

    expect(result).toBe(false);
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/tabs/home']);
  });

  it('should allow access when user is NOT authenticated', async () => {
    mockedGetCurrentUser.mockRejectedValue(new Error('not authenticated'));

    const result = await TestBed.runInInjectionContext(() =>
      loggedInGuard(dummyRoute, dummyState),
    );

    expect(result).toBe(true);
    expect(routerSpy.navigate).not.toHaveBeenCalled();
  });
});
