import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BusinessSettings } from '../../database/entities/business-settings.entity';
import { UpdateBusinessSettingsDto } from './dto/update-business-settings.dto';

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(BusinessSettings)
    private readonly settingsRepo: Repository<BusinessSettings>,
  ) {}

  /** Tabel ini cuma punya satu baris konfigurasi untuk seluruh bisnis. */
  async getBusiness(): Promise<BusinessSettings> {
    const [existing] = await this.settingsRepo.find({ take: 1 });
    if (existing) return existing;
    return this.settingsRepo.save(this.settingsRepo.create({}));
  }

  async updateBusiness(dto: UpdateBusinessSettingsDto): Promise<BusinessSettings> {
    const current = await this.getBusiness();
    Object.assign(current, dto);
    return this.settingsRepo.save(current);
  }
}
