import type { AuthError } from '@supabase/supabase-js';

/**
 * Maps Supabase Auth `error.code` values to friendly, user-facing messages
 * suitable for a Toastiva toast (shown in place of the raw `error.message`).
 *
 * The full list of codes is the comprehensive table at:
 * https://supabase.com/docs/guides/auth/debugging/error-codes
 *
 * Messages are intentionally non-technical. Codes that signal a configuration
 * or client-implementation bug (rather than something the user did) map to a
 * generic "try again / contact support" message so internals never leak to the
 * UI — inspect the raw error in logs for those.
 */
export const AUTH_ERROR_MESSAGES: Record<string, string> = {
  // --- Sign in / credentials ---
  invalid_credentials: 'Incorrect email or password.',
  email_not_confirmed: 'Please confirm your email before signing in.',
  phone_not_confirmed: 'Please confirm your phone number before signing in.',
  user_not_found: 'We couldn’t find an account with those details.',
  user_banned: 'This account has been suspended. Contact support for help.',
  session_expired: 'Your session expired. Please sign in again.',
  session_not_found: 'Your session has ended. Please sign in again.',
  refresh_token_not_found: 'Your session has ended. Please sign in again.',
  refresh_token_already_used: 'Your session has ended. Please sign in again.',
  bad_jwt: 'Your session is no longer valid. Please sign in again.',
  no_authorization: 'Please sign in to continue.',
  reauthentication_needed: 'Please re-enter your password to continue.',
  reauthentication_not_valid: 'That code is incorrect. Please try again.',

  // --- Sign up / account creation ---
  email_exists: 'An account with this email already exists.',
  phone_exists: 'An account with this phone number already exists.',
  user_already_exists: 'An account with these details already exists.',
  signup_disabled: 'New sign-ups are currently unavailable.',
  email_provider_disabled: 'Email sign-up is currently unavailable.',
  phone_provider_disabled: 'Phone sign-up is currently unavailable.',
  anonymous_provider_disabled: 'Guest sign-in is currently unavailable.',
  email_address_invalid: 'Please enter a valid email address.',
  email_address_not_authorized: 'We can’t send email to this address right now.',
  provider_email_needs_verification:
    'Please check your inbox to verify your email address.',

  // --- Passwords ---
  weak_password:
    'Your password is too weak. Use a longer mix of letters, numbers, and symbols.',
  same_password: 'Please choose a password different from your current one.',

  // --- OTP / magic link / PKCE flow ---
  otp_expired: 'That code has expired. Please request a new one.',
  otp_disabled: 'One-time code sign-in is currently unavailable.',
  flow_state_expired: 'This link has expired. Please start again.',
  flow_state_not_found: 'This link is no longer valid. Please start again.',
  bad_code_verifier: 'Something went wrong verifying this link. Please try again.',
  invite_not_found: 'This invite has expired or already been used.',

  // --- Rate limiting ---
  over_request_rate_limit: 'Too many attempts. Please wait a moment and try again.',
  over_email_send_rate_limit:
    'Too many emails sent. Please wait a while before trying again.',
  over_sms_send_rate_limit:
    'Too many messages sent. Please wait a while before trying again.',
  request_timeout: 'The request took too long. Please try again.',

  // --- CAPTCHA ---
  captcha_failed: 'CAPTCHA verification failed. Please try again.',

  // --- OAuth / social providers ---
  provider_disabled: 'This sign-in option is currently unavailable.',
  oauth_provider_not_supported: 'This sign-in option is currently unavailable.',
  bad_oauth_callback: 'Something went wrong signing in. Please try again.',
  bad_oauth_state: 'Something went wrong signing in. Please try again.',

  // --- Identity linking ---
  identity_already_exists: 'This account is already linked.',
  identity_not_found: 'We couldn’t find that linked account.',
  manual_linking_disabled: 'Linking accounts is currently unavailable.',
  single_identity_not_deletable:
    'You can’t remove your only sign-in method.',
  email_conflict_identity_not_deletable:
    'This email is already used by another account.',
  user_sso_managed:
    'This information is managed by your organization and can’t be changed here.',

  // --- Multi-factor authentication (MFA) ---
  insufficient_aal: 'Please complete an additional verification step to continue.',
  mfa_challenge_expired: 'Your verification expired. Please try again.',
  mfa_verification_failed: 'That code is incorrect. Please try again.',
  mfa_verification_rejected: 'Verification was rejected. Please try again.',
  mfa_factor_not_found: 'That verification method no longer exists.',
  mfa_factor_name_conflict: 'You already have a method with that name.',
  mfa_ip_address_mismatch:
    'Please complete verification from the same network you started on.',
  mfa_verified_factor_exists:
    'A verified phone is already set up. Remove it before adding another.',
  too_many_enrolled_mfa_factors:
    'You’ve reached the maximum number of verification methods.',
  mfa_phone_enroll_not_enabled: 'Phone verification is currently unavailable.',
  mfa_phone_verify_not_enabled: 'Phone verification is currently unavailable.',
  mfa_totp_enroll_not_enabled: 'Authenticator app setup is currently unavailable.',
  mfa_totp_verify_not_enabled: 'Authenticator app verification is currently unavailable.',
  mfa_web_authn_enroll_not_enabled: 'Security key setup is currently unavailable.',
  mfa_web_authn_verify_not_enabled: 'Security key verification is currently unavailable.',

  // --- SMS ---
  sms_send_failed: 'We couldn’t send the text message. Please try again later.',

  // --- Validation ---
  validation_failed: 'Please check your details and try again.',
  bad_json: 'Something went wrong. Please try again.',
  conflict: 'Something went wrong due to a conflict. Please try again.',

  // --- SSO / SAML (enterprise) ---
  sso_provider_not_found: 'We couldn’t find that organization sign-in.',
  sso_domain_already_exists: 'That sign-in domain is already registered.',
  saml_provider_disabled: 'Organization sign-in is currently unavailable.',
  saml_relay_state_expired: 'Sign-in took too long. Please try again.',
  saml_relay_state_not_found: 'Sign-in session expired. Please try again.',
  saml_idp_not_found: 'We couldn’t find that organization sign-in.',
  saml_assertion_no_email: 'Your organization didn’t share an email. Contact your admin.',
  saml_assertion_no_user_id: 'Your organization didn’t share an ID. Contact your admin.',
  saml_metadata_fetch_failed: 'Something went wrong. Please try again.',
  saml_idp_already_exists: 'Something went wrong. Please try again.',
  saml_entity_id_mismatch: 'Something went wrong. Please try again.',

  // --- Server / hooks / admin (developer-facing; show generic to the user) ---
  not_admin: 'You don’t have permission to do that.',
  unexpected_audience: 'Something went wrong. Please try again.',
  unexpected_failure: 'Something went wrong on our end. Please try again later.',
  hook_timeout: 'Something went wrong. Please try again.',
  hook_timeout_after_retry: 'Something went wrong. Please try again.',
  hook_payload_invalid_content_type: 'Something went wrong. Please try again.',
  hook_payload_over_size_limit: 'Something went wrong. Please try again.',
};

/** Shown when the error has no recognised code, or no error code at all. */
export const DEFAULT_AUTH_ERROR_MESSAGE = 'Something went wrong. Please try again.';

/**
 * Resolves a Supabase auth error to a friendly message for a Toastiva toast.
 *
 * Use in place of `error.message`:
 *   const { error } = await signInWithEmail(email, password);
 *   if (error) toastiva.error(authErrorMessage(error));
 */
export const authErrorMessage = (
  error: AuthError | { code?: string | null } | null | undefined
): string => {
  const code = error?.code ?? undefined;
  if (code && code in AUTH_ERROR_MESSAGES) {
    return AUTH_ERROR_MESSAGES[code];
  }
  return DEFAULT_AUTH_ERROR_MESSAGE;
};
