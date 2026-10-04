/// <reference types="jest" />
/// <reference types="@testing-library/jest-native" />

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import LoginScreen from '../src/app/(auth)/login';

// Mock Clerk hooks with new Signal-based API
jest.mock('@clerk/expo', () => ({
  useSignIn: () => ({
    signIn: {
      password: jest.fn().mockResolvedValue({ error: null }),
      finalize: jest.fn().mockResolvedValue({ error: null }),
      status: 'complete',
    },
    errors: { fields: { identifier: null, password: null, code: null }, raw: null, global: null },
    fetchStatus: 'idle',
  }),
  useSignUp: () => ({
    signUp: {
      password: jest.fn().mockResolvedValue({ error: null }),
      verifications: {
        sendEmailCode: jest.fn().mockResolvedValue({ error: null }),
        verifyEmailCode: jest.fn().mockResolvedValue({ error: null }),
      },
      finalize: jest.fn().mockResolvedValue({ error: null }),
      status: 'complete',
      unverifiedFields: [],
    },
    errors: { fields: { firstName: null, lastName: null, emailAddress: null, phoneNumber: null, password: null, username: null, code: null, captcha: null, legalAccepted: null }, raw: null, global: null },
    fetchStatus: 'idle',
  }),
}));

// Mock expo router
jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: jest.fn(), back: jest.fn(), push: jest.fn() }),
}));

describe('LoginScreen UAT', () => {
  it('renders login form by default', async () => {
    const { getByPlaceholderText, getByText } = await render(<LoginScreen />);
    
    expect(getByPlaceholderText('Email Address')).toBeTruthy();
    expect(getByPlaceholderText('Password')).toBeTruthy();
    expect(getByText('Sign In')).toBeTruthy();
  });

  it('switches to sign up mode', async () => {
    const { getByText } = await render(<LoginScreen />);
    
    const switchButton = getByText('Need an account? Sign Up');
    fireEvent.press(switchButton);
    
    expect(getByText('Sign Up')).toBeTruthy();
  });
});