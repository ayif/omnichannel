import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1787040984259 implements MigrationInterface {
  name = 'InitialSchema1787040984259';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."audit_logs_action_enum" AS ENUM('login_success', 'login_failed', 'channel_connect', 'channel_disconnect', 'sync_trigger', 'user_create', 'user_update', 'user_delete')`,
    );
    await queryRunner.query(
      `CREATE TABLE "audit_logs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "action" "public"."audit_logs_action_enum" NOT NULL, "entity_type" character varying, "entity_id" character varying, "user_id" uuid, "user_nama" character varying, "user_email" character varying, "description" text NOT NULL, "metadata" jsonb, "ip_address" character varying, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_1bb179d048bbc581caa3b013439" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."channel_accounts_channel_enum" AS ENUM('tokopedia', 'shopee', 'website', 'tiktokshop')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."channel_accounts_status_enum" AS ENUM('connected', 'expired', 'revoked')`,
    );
    await queryRunner.query(
      `CREATE TABLE "channel_accounts" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "channel" "public"."channel_accounts_channel_enum" NOT NULL, "shop_id" character varying NOT NULL, "nama_toko" character varying NOT NULL, "access_token_enc" text NOT NULL, "refresh_token_enc" text, "expires_at" TIMESTAMP WITH TIME ZONE, "status" "public"."channel_accounts_status_enum" NOT NULL DEFAULT 'connected', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_b23fdcb822c5261260a4c88041e" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_df00c50f3bf5a733ea811264eb" ON "channel_accounts"  ("channel", "shop_id") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."notifications_type_enum" AS ENUM('stock_low', 'sync_failed')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."notifications_severity_enum" AS ENUM('warning', 'critical')`,
    );
    await queryRunner.query(
      `CREATE TABLE "notifications" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "type" "public"."notifications_type_enum" NOT NULL, "severity" "public"."notifications_severity_enum" NOT NULL, "entity_type" character varying NOT NULL, "entity_id" character varying NOT NULL, "title" character varying NOT NULL, "message" text NOT NULL, "metadata" jsonb, "is_read" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_6a72c3c0f683f6462415e653c3a" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "stock" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "product_id" uuid NOT NULL, "jumlah_stok" integer NOT NULL DEFAULT '0', "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_375ba760c8cff338fc8c94b416c" UNIQUE ("product_id"), CONSTRAINT "REL_375ba760c8cff338fc8c94b416" UNIQUE ("product_id"), CONSTRAINT "PK_092bc1fc7d860426a1dec5aa8e9" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "products" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "sku" character varying NOT NULL, "nama_produk" character varying NOT NULL, "kategori" character varying, "harga_dasar" numeric(14,2) NOT NULL, "stok_minimum" integer NOT NULL DEFAULT '0', "gambar_url" character varying, CONSTRAINT "UQ_c44ac33a05b144dd0d9ddcf9327" UNIQUE ("sku"), CONSTRAINT "PK_0806c755e0aca124e67c0cf6d7d" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."product_channel_mapping_channel_enum" AS ENUM('tokopedia', 'shopee', 'website', 'tiktokshop')`,
    );
    await queryRunner.query(
      `CREATE TABLE "product_channel_mapping" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "product_id" uuid NOT NULL, "channel" "public"."product_channel_mapping_channel_enum" NOT NULL, "channel_product_id" character varying NOT NULL, "channel_price" numeric(14,2), CONSTRAINT "PK_28086ccedd2534d41501088914e" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_125d31e1bb0d4a4918f432a9ac" ON "product_channel_mapping"  ("channel", "channel_product_id") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."stock_movements_sumber_enum" AS ENUM('transaksi', 'manual', 'restock')`,
    );
    await queryRunner.query(
      `CREATE TABLE "stock_movements" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "product_id" uuid NOT NULL, "jumlah_perubahan" integer NOT NULL, "sumber" "public"."stock_movements_sumber_enum" NOT NULL, "timestamp" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_57a26b190618550d8e65fb860e7" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."sync_logs_channel_enum" AS ENUM('tokopedia', 'shopee', 'website', 'tiktokshop')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."sync_logs_status_enum" AS ENUM('running', 'success', 'failed')`,
    );
    await queryRunner.query(
      `CREATE TABLE "sync_logs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "channel" "public"."sync_logs_channel_enum" NOT NULL, "status" "public"."sync_logs_status_enum" NOT NULL DEFAULT 'running', "waktu_mulai" TIMESTAMP WITH TIME ZONE NOT NULL, "waktu_selesai" TIMESTAMP WITH TIME ZONE, "jumlah_data_ditarik" integer NOT NULL DEFAULT '0', "error_message" text, CONSTRAINT "PK_f441fe15484e077c80ddec89336" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."transactions_channel_enum" AS ENUM('tokopedia', 'shopee', 'website', 'tiktokshop')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."transactions_status_enum" AS ENUM('pending', 'paid', 'shipped', 'completed', 'cancelled', 'refund')`,
    );
    await queryRunner.query(
      `CREATE TABLE "transactions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "channel" "public"."transactions_channel_enum" NOT NULL, "channel_order_id" character varying NOT NULL, "product_id" uuid NOT NULL, "qty" integer NOT NULL, "harga_jual" numeric(14,2) NOT NULL, "ongkos_kirim" numeric(14,2) NOT NULL DEFAULT '0', "status" "public"."transactions_status_enum" NOT NULL DEFAULT 'pending', "tanggal_transaksi" TIMESTAMP WITH TIME ZONE NOT NULL, "raw_payload" jsonb, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_a219afd8dd77ed80f5a862f1db9" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_37f92ad693bfa47bca5a9f485a" ON "transactions"  ("channel", "channel_order_id") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."users_role_enum" AS ENUM('admin', 'staff', 'gudang')`,
    );
    await queryRunner.query(
      `CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying NOT NULL, "password_hash" character varying NOT NULL, "nama" character varying NOT NULL, "role" "public"."users_role_enum" NOT NULL DEFAULT 'staff', "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "business_settings" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "nama_bisnis" character varying NOT NULL DEFAULT 'Rekap Omnichannel', "alamat" text, "telepon" character varying, "email" character varying, "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_be550d64549bda4778cf6f9e0df" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "stock" ADD CONSTRAINT "FK_375ba760c8cff338fc8c94b416c" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_channel_mapping" ADD CONSTRAINT "FK_cd83dac50211c4d9e4140fcfedc" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "stock_movements" ADD CONSTRAINT "FK_2c1bb05b80ddcc562cd28d826c6" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "transactions" ADD CONSTRAINT "FK_8d5b2e87f2129081ebacc894f8f" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "transactions" DROP CONSTRAINT "FK_8d5b2e87f2129081ebacc894f8f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "stock_movements" DROP CONSTRAINT "FK_2c1bb05b80ddcc562cd28d826c6"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_channel_mapping" DROP CONSTRAINT "FK_cd83dac50211c4d9e4140fcfedc"`,
    );
    await queryRunner.query(
      `ALTER TABLE "stock" DROP CONSTRAINT "FK_375ba760c8cff338fc8c94b416c"`,
    );
    await queryRunner.query(`DROP TABLE "business_settings"`);
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_37f92ad693bfa47bca5a9f485a"`,
    );
    await queryRunner.query(`DROP TABLE "transactions"`);
    await queryRunner.query(`DROP TYPE "public"."transactions_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."transactions_channel_enum"`);
    await queryRunner.query(`DROP TABLE "sync_logs"`);
    await queryRunner.query(`DROP TYPE "public"."sync_logs_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."sync_logs_channel_enum"`);
    await queryRunner.query(`DROP TABLE "stock_movements"`);
    await queryRunner.query(`DROP TYPE "public"."stock_movements_sumber_enum"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_125d31e1bb0d4a4918f432a9ac"`,
    );
    await queryRunner.query(`DROP TABLE "product_channel_mapping"`);
    await queryRunner.query(
      `DROP TYPE "public"."product_channel_mapping_channel_enum"`,
    );
    await queryRunner.query(`DROP TABLE "products"`);
    await queryRunner.query(`DROP TABLE "stock"`);
    await queryRunner.query(`DROP TABLE "notifications"`);
    await queryRunner.query(`DROP TYPE "public"."notifications_severity_enum"`);
    await queryRunner.query(`DROP TYPE "public"."notifications_type_enum"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_df00c50f3bf5a733ea811264eb"`,
    );
    await queryRunner.query(`DROP TABLE "channel_accounts"`);
    await queryRunner.query(
      `DROP TYPE "public"."channel_accounts_status_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."channel_accounts_channel_enum"`,
    );
    await queryRunner.query(`DROP TABLE "audit_logs"`);
    await queryRunner.query(`DROP TYPE "public"."audit_logs_action_enum"`);
  }
}
