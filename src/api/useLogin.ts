// src/hooks/useLogin.ts
import { useMutation } from '@tanstack/react-query';
import { authService, LoginCredentials, LoginResponse } from '../utils/authService';

// The base URL for your OpenMRS instance
const OPENMRS_BASE_URL = 'https://ngx.ampath.or.ke/amrs';

export function useLogin() {
  return useMutation<LoginResponse, Error, LoginCredentials>({
    mutationFn: (credentials) => authService.login(credentials, OPENMRS_BASE_URL)
  });
}