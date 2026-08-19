import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddChannelApiConfigs1787111422897 implements MigrationInterface {
  name = 'AddChannelApiConfigs1787111422897';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "public"."audit_logs_action_enum" ADD VALUE IF NOT EXISTS 'channel_api_config_update'`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."channel_api_configs_channel_enum" AS ENUM('tokopedia', 'shopee', 'website', 'tiktokshop')`,
    );
    await queryRunner.query(
      `CREATE TABLE "channel_api_configs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "channel" "public"."channel_api_configs_channel_enum" NOT NULL, "config_enc" text NOT NULL, "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_channel_api_configs_channel" UNIQUE ("channel"), CONSTRAINT "PK_channel_api_configs_id" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "channel_api_configs"`);
    await queryRunner.query(
      `DROP TYPE "public"."channel_api_configs_channel_enum"`,
    );
    // Postgres tidak bisa DROP VALUE dari enum - 'channel_api_config_update'
    // tertinggal di tipe tapi tidak berbahaya kalau migration ini di-revert.
  }
}
