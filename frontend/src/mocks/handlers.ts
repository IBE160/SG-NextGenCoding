import { http, HttpResponse } from 'msw';

export const handlers = [
  http.post('/api/v1/auth/forgot-password', async () => {
    return HttpResponse.json({ message: "If an account with that email exists, a password reset link has been sent." });
  }),
  http.post('/api/v1/auth/reset-password', async () => {
    return HttpResponse.json({ message: "Your password has been reset successfully! You can now log in." });
  }),
  http.get('/api/message', () => {
    return HttpResponse.json({ message: 'Hello from the handler!' });
  }),
];