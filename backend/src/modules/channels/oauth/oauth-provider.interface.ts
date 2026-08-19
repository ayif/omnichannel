export interface OAuthTokenResult {
  shopId: string;
  namaToko: string;
  accessToken: string;
  refreshToken?: string;
  expiresAt?: Date;
}

export interface ChannelOAuthProvider {
  getAuthorizationUrl(state: string): Promise<string>;
  exchangeCode(params: {
    code: string;
    shopId?: string;
  }): Promise<OAuthTokenResult>;
}
