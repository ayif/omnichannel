import { Column, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('business_settings')
export class BusinessSettings {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'nama_bisnis', default: 'Rekap Omnichannel' })
  namaBisnis: string;

  @Column({ type: 'text', nullable: true })
  alamat: string | null;

  @Column({ type: 'varchar', nullable: true })
  telepon: string | null;

  @Column({ type: 'varchar', nullable: true })
  email: string | null;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
