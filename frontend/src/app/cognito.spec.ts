import { TestBed } from '@angular/core/testing';

import { Cognito } from './cognito';

describe('Cognito', () => {
  let service: Cognito;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Cognito);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
