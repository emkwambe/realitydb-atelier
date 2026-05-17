export function humanizeAuthError(msg: string): string {
  if (/invalid login credentials/i.test(msg)) return "Incorrect email or password.";
  if (/email not confirmed/i.test(msg)) return "Please confirm your email — check your inbox.";
  if (/rate.?limit/i.test(msg)) return "Too many attempts. Please wait a moment and try again.";
  if (/user not found/i.test(msg) || /signups.*not allowed/i.test(msg))
    return "No account with that email. Create one first.";
  if (/email.*disabled/i.test(msg)) return "Email sign-in is currently disabled.";
  return msg;
}
