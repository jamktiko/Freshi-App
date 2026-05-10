/**
 * Jest setup for Angular testing environment.
 *
 * Initializes Angular's TestBed with the browser-dynamic testing platform,
 * which is required for tests that use TestBed (e.g. guard tests).
 * Pure-function tests (pipes, validators, forms) don't need this but it
 * doesn't hurt to have it globally available.
 */
import 'zone.js';
import 'zone.js/testing';
import { TestBed } from '@angular/core/testing';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting,
} from '@angular/platform-browser-dynamic/testing';

TestBed.initTestEnvironment(
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting(),
);
