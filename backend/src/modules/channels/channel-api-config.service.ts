import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Channel } from '../../common/channel.enum';
import { decryptSecret, encryptSecret } from '../../common/crypto.util';
import { ChannelApiConfig } from '../../database/entities/channel-api-config.entity';
import { CHANNEL_API_FIELDS } from './channel-api-config.schema';

export interface ChannelApiFieldStatus {
  key: string;
  label: string;
  secret: boolean;
  required: boolean;
  placeholder?: string;
  /** Nilai plain - hanya diisi untuk field non-secret. */
  value: string | null;
  /** true kalau field sudah punya nilai tersimpan (dipakai UI buat field secret). */
  isSet: boolean;
}

export interface ChannelApiConfigSummary {
  channel: Channel;
  fields: ChannelApiFieldStatus[];
  updatedAt: string | null;
}

@Injectable()
export class ChannelApiConfigService {
  constructor(
    @InjectRepository(ChannelApiConfig)
    private readonly repo: Repository<ChannelApiConfig>,
  ) {}

  private fieldsFor(channel: Channel) {
    const fields = CHANNEL_API_FIELDS[channel];
    if (!fields) {
      throw new BadRequestException(
        `Channel "${channel}" tidak punya konfigurasi API`,
      );
    }
    return fields;
  }

  /** Dipakai OAuth provider - kembalikan config plain (bisa kosong kalau belum pernah disimpan). */
  async getDecrypted(channel: Channel): Promise<Record<string, string>> {
    const row = await this.repo.findOne({ where: { channel } });
    if (!row) return {};
    try {
      return JSON.parse(decryptSecret(row.configEnc)) as Record<string, string>;
    } catch {
      return {};
    }
  }

  async findAllMasked(): Promise<ChannelApiConfigSummary[]> {
    const channels = Object.keys(CHANNEL_API_FIELDS) as Channel[];
    const rows = await this.repo.find({
      where: channels.map((channel) => ({ channel })),
    });
    const rowByChannel = new Map(rows.map((row) => [row.channel, row]));

    return channels.map((channel) => {
      const row = rowByChannel.get(channel);
      let decrypted: Record<string, string> = {};
      if (row) {
        try {
          decrypted = JSON.parse(decryptSecret(row.configEnc)) as Record<
            string,
            string
          >;
        } catch {
          decrypted = {};
        }
      }

      const fields = this.fieldsFor(channel).map((field) => {
        const raw = decrypted[field.key];
        return {
          ...field,
          value: field.secret ? null : (raw ?? null),
          isSet: Boolean(raw),
        };
      });

      return {
        channel,
        fields,
        updatedAt: row?.updatedAt.toISOString() ?? null,
      };
    });
  }

  /**
   * String kosong berarti "jangan ubah" untuk field secret (supaya UI bisa
   * kirim ulang seluruh form tanpa harus tahu client secret yang lama), dan
   * berarti "hapus, pakai default" untuk field non-secret.
   */
  async upsert(
    channel: Channel,
    values: Record<string, unknown>,
  ): Promise<ChannelApiConfigSummary> {
    const fields = this.fieldsFor(channel);
    const current = await this.getDecrypted(channel);
    const next: Record<string, string> = { ...current };

    for (const field of fields) {
      const incoming = values[field.key];
      if (incoming === undefined || incoming === null) continue;
      if (typeof incoming !== 'string') {
        throw new BadRequestException(`${field.label} harus berupa teks`);
      }
      const strValue = incoming.trim();

      if (field.secret && strValue === '') {
        continue; // pertahankan secret lama
      }
      if (strValue === '') {
        delete next[field.key];
        continue;
      }
      next[field.key] = strValue;
    }

    for (const field of fields) {
      if (field.required && !next[field.key]) {
        throw new BadRequestException(`${field.label} wajib diisi`);
      }
    }

    let row = await this.repo.findOne({ where: { channel } });
    if (!row) {
      row = this.repo.create({ channel });
    }
    row.configEnc = encryptSecret(JSON.stringify(next));
    await this.repo.save(row);

    const summaries = await this.findAllMasked();
    return summaries.find((s) => s.channel === channel)!;
  }
}
