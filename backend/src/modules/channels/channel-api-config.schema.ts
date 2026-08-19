import { Channel } from '../../common/channel.enum';

export interface ChannelApiField {
  key: string;
  label: string;
  secret: boolean;
  required: boolean;
  placeholder?: string;
}

/**
 * Field kredensial aplikasi per channel. Dipakai buat validasi di
 * ChannelApiConfigService dan sebagai sumber kebenaran untuk form dinamis
 * di frontend (lihat frontend/src/lib/channel-api-fields.ts - salinan yang
 * sengaja diduplikasi karena frontend & backend adalah package terpisah).
 * Website tidak ada di sini karena tidak butuh OAuth ke marketplace luar.
 */
export const CHANNEL_API_FIELDS: Partial<Record<Channel, ChannelApiField[]>> = {
  [Channel.TOKOPEDIA]: [
    { key: 'clientId', label: 'Client ID', secret: false, required: true },
    {
      key: 'clientSecret',
      label: 'Client Secret',
      secret: true,
      required: true,
    },
    {
      key: 'authorizeUrl',
      label: 'Authorize URL',
      secret: false,
      required: false,
      placeholder: 'https://accounts.tokopedia.com/oauth/authorize',
    },
    {
      key: 'tokenUrl',
      label: 'Token URL',
      secret: false,
      required: false,
      placeholder: 'https://fs.tokopedia.net/token',
    },
  ],
  [Channel.SHOPEE]: [
    { key: 'partnerId', label: 'Partner ID', secret: false, required: true },
    { key: 'partnerKey', label: 'Partner Key', secret: true, required: true },
    {
      key: 'baseUrl',
      label: 'Base URL',
      secret: false,
      required: false,
      placeholder: 'https://partner.shopeemobile.com',
    },
  ],
  [Channel.TIKTOKSHOP]: [
    { key: 'appKey', label: 'App Key', secret: false, required: true },
    { key: 'appSecret', label: 'App Secret', secret: true, required: true },
    {
      key: 'authorizeUrl',
      label: 'Authorize URL',
      secret: false,
      required: false,
      placeholder: 'https://services.tiktokshop.com/open/authorize',
    },
    {
      key: 'baseUrl',
      label: 'Base URL',
      secret: false,
      required: false,
      placeholder: 'https://auth.tiktok-shops.com',
    },
  ],
};
