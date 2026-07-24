import { CLERK_EVENT } from '../enums/clerk_event.enum';

export interface ClerkWebhookEvent {
  data: ClerkUserData;
  event_attributes: {
    http_request: {
      client_ip: string;
      user_agent: string;
    };
  };
  instance_id: string;
  object: string;
  timestamp: number;
  type: CLERK_EVENT;
}

export interface ClerkUserData {
  backup_code_enabled: boolean;
  banned: boolean;
  create_organization_enabled: boolean;
  create_organizations_limit: number | null;
  created_at: number;
  delete_self_enabled: boolean;
  email_addresses: ClerkEmailAddress[];
  enterprise_accounts: unknown[];
  external_accounts: unknown[];
  external_id: string | null;
  first_name: string | null;
  has_image: boolean;
  id: string;
  image_url: string | null;
  last_active_at: number | null;
  last_name: string | null;
  last_sign_in_at: number | null;
  legal_accepted_at: number | null;
  locked: boolean;
  lockout_expires_in_seconds: number | null;
  mfa_disabled_at: number | null;
  mfa_enabled_at: number | null;
  object: string;
  passkeys: unknown[];
  password_enabled: boolean;
  phone_numbers: ClerkPhoneNumber[];
  primary_email_address_id: string | null;
  primary_phone_number_id: string | null;
  primary_web3_wallet_id: string | null;
  private_metadata: Record<string, unknown> | null;
  profile_image_url: string | null;
  public_metadata: Record<string, unknown>;
  saml_accounts: unknown[];
  totp_enabled: boolean;
  two_factor_enabled: boolean;
  unsafe_metadata: Record<string, unknown>;
  updated_at: number;
  username: string | null;
  verification_attempts_remaining: number | null;
  web3_wallets: unknown[];
}

export interface ClerkEmailAddress {
  email_address: string;
  id: string;
  [key: string]: unknown;
}

export interface ClerkPhoneNumber {
  phone_number: string;
  id: string;
  [key: string]: unknown;
}
