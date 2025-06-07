export interface DecodedIdToken {
  uid: string;
  name?: string;
  email?: string;
  email_verified?: boolean;
  phone_number?: string;
  picture?: string;
  iss: string;
  sub: string;
  aud: string;
  iat: number;
  exp: number;
  auth_time: number;
  firebase: {
    identities: {
      [key: string]: any;
    };
    sign_in_provider: string;
  };
}