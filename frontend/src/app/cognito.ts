/// AWS Cognito authentication and authorization service

import { Injectable, signal } from '@angular/core';
import { environment } from 'src/environment/environment.prod';
import { Amplify } from 'aws-amplify';
import {
  confirmSignUp,
  fetchAuthSession,
  getCurrentUser,
  signIn,
  signOut,
  signUp,
} from 'aws-amplify/auth';
import { IUser } from './user';
import { cognitoUserPoolsTokenProvider } from 'aws-amplify/auth/cognito';
import { sessionStorage } from 'aws-amplify/utils';
@Injectable({
  providedIn: 'root',
})
export class Cognito {
  registrationEmail = '';
  constructor() {
    // Confiruring AWS Amplify to work with AWS cognito
    Amplify.configure({
      Auth: {
        Cognito: {
          //  Amazon Cognito User Pool ID
          userPoolId: environment.cognito.userPoolID,
          // OPTIONAL - Amazon Cognito Web Client ID (26-char alphanumeric string)
          userPoolClientId: environment.cognito.appClientID,
          loginWith: {
            // Optional
            username: false,
            email: true, // Optional
          },
        },
      },
    });
  }

  // User registration function using email and password
  async registerUser(user: IUser) {
    try {
      const { isSignUpComplete, userId, nextStep } = await signUp(user);

      return { success: true, isSignUpComplete, userId, nextStep };
    } catch (error) {
      alert(error);
      return { success: false };
    }
  }

  // User registration confirmation with email code
  async confirmUser(email: string, code: string) {
    try {
      const { isSignUpComplete, nextStep } = await confirmSignUp({
        username: email,
        confirmationCode: code,
      });
      return { success: true, isSignUpComplete, nextStep };
    } catch (error) {
      alert(error);
      return { success: false };
    }
  }

  // User login with email and password
  async loginUser(email: string, password: string) {
    try {
      const { nextStep } = await signIn({
        username: email,
        password: password,
      });

      return { success: true, nextStep };
    } catch (error) {
      alert(error);
      return { success: false };
    }
  }

  // User logout
  async logoutUser() {
    try {
      signOut();
    } catch (error) {
      alert(error);
    }
  }
  // Get user tokens
  async getTokens() {
    try {
      const session = await fetchAuthSession();

      if (session.tokens) {
        return session.tokens;
      }
      return { idToken: 'none', accessToken: 'none' };
    } catch (error) {
      alert(error);
      return { idToken: 'error', accessToken: 'error' };
    }
  }

  // Get user info
  async getUser() {
    try {
      const { username, userId, signInDetails } = await getCurrentUser();
      return {
        username: username,
        userId: userId,
        signInDetails: signInDetails,
      };
    } catch (error) {
      return false;
    }
  }
}
