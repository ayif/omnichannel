import { Channel } from "./types";

export interface ChannelApiFieldDef {
  key: string;
  label: string;
  secret: boolean;
  required: boolean;
  placeholder?: string;
}

/**
 * Salinan skema field di backend/src/modules/channels/channel-api-config.schema.ts.
 * Sengaja diduplikasi (frontend & backend package terpisah) - kalau backend
 * menambah/mengubah field, field ini juga harus diupdate.
 */
export const CHANNEL_API_FIELDS: Partial<Record<Channel, ChannelApiFieldDef[]>> = {
  [Channel.TOKOPEDIA]: [
    { key: "clientId", label: "Client ID", secret: false, required: true },
    { key: "clientSecret", label: "Client Secret", secret: true, required: true },
    {
      key: "authorizeUrl",
      label: "Authorize URL",
      secret: false,
      required: false,
      placeholder: "https://accounts.tokopedia.com/oauth/authorize",
    },
    {
      key: "tokenUrl",
      label: "Token URL",
      secret: false,
      required: false,
      placeholder: "https://fs.tokopedia.net/token",
    },
  ],
  [Channel.SHOPEE]: [
    { key: "partnerId", label: "Partner ID", secret: false, required: true },
    { key: "partnerKey", label: "Partner Key", secret: true, required: true },
    {
      key: "baseUrl",
      label: "Base URL",
      secret: false,
      required: false,
      placeholder: "https://partner.shopeemobile.com",
    },
  ],
  [Channel.TIKTOKSHOP]: [
    { key: "appKey", label: "App Key", secret: false, required: true },
    { key: "appSecret", label: "App Secret", secret: true, required: true },
    {
      key: "authorizeUrl",
      label: "Authorize URL",
      secret: false,
      required: false,
      placeholder: "https://services.tiktokshop.com/open/authorize",
    },
    {
      key: "baseUrl",
      label: "Base URL",
      secret: false,
      required: false,
      placeholder: "https://auth.tiktok-shops.com",
    },
  ],
};

export const CHANNELS_WITH_API_CONFIG = Object.keys(CHANNEL_API_FIELDS) as Channel[];
