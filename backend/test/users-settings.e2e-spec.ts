import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import request from 'supertest';
import { App } from 'supertest/types';
import { Repository } from 'typeorm';
import { Role } from '../src/common/role.enum';
import { buildTypeOrmOptions } from '../src/database/typeorm.config';
import { User } from '../src/database/entities/user.entity';
import { AuthModule } from '../src/modules/auth/auth.module';
import { SettingsModule } from '../src/modules/settings/settings.module';
import { UsersModule } from '../src/modules/users/users.module';

const TEST_DATABASE_URL =
  process.env.TEST_DATABASE_URL ??
  'postgres://rekap_user:rekap_pass@localhost:5432/rekap_db_test';

jest.setTimeout(30000);

interface UserResponseBody {
  id: string;
  email: string;
  nama: string;
  role: Role;
}

interface AuthResponseBody {
  accessToken: string;
  user: { sub: string; email: string; nama: string; role: Role };
}

interface BusinessSettingsResponseBody {
  namaBisnis: string;
  telepon: string | null;
}

describe('Users & Settings (e2e)', () => {
  let app: INestApplication<App>;
  let userRepo: Repository<User>;
  let adminToken: string;
  let staffToken: string;
  let adminId: string;

  beforeAll(async () => {
    process.env.DATABASE_URL = TEST_DATABASE_URL;

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        TypeOrmModule.forRootAsync({
          inject: [ConfigService],
          useFactory: (config: ConfigService) => ({
            ...buildTypeOrmOptions(config),
            dropSchema: true,
          }),
        }),
        AuthModule,
        UsersModule,
        SettingsModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    await app.init();

    userRepo = moduleFixture.get<Repository<User>>(getRepositoryToken(User));

    const admin = await userRepo.save(
      userRepo.create({
        email: 'admin@e2e.local',
        nama: 'Admin E2E',
        passwordHash: await bcrypt.hash('admin12345', 10),
        role: Role.ADMIN,
      }),
    );
    adminId = admin.id;

    await userRepo.save(
      userRepo.create({
        email: 'staff@e2e.local',
        nama: 'Staff E2E',
        passwordHash: await bcrypt.hash('staff12345', 10),
        role: Role.STAFF,
      }),
    );

    const adminLogin = (await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'admin@e2e.local', password: 'admin12345' })) as {
      body: AuthResponseBody;
    };
    adminToken = adminLogin.body.accessToken;

    const staffLogin = (await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'staff@e2e.local', password: 'staff12345' })) as {
      body: AuthResponseBody;
    };
    staffToken = staffLogin.body.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /users', () => {
    it('lets admin list users without leaking password hashes', async () => {
      const res = await request(app.getHttpServer())
        .get('/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const users = res.body as UserResponseBody[];
      expect(users).toHaveLength(2);
      expect(users[0]).not.toHaveProperty('passwordHash');
    });

    it('forbids staff from listing users', async () => {
      await request(app.getHttpServer())
        .get('/users')
        .set('Authorization', `Bearer ${staffToken}`)
        .expect(403);
    });

    it('rejects unauthenticated requests', async () => {
      await request(app.getHttpServer()).get('/users').expect(401);
    });
  });

  describe('POST /users', () => {
    it('lets admin create a new user', async () => {
      const res = await request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          nama: 'Gudang E2E',
          email: 'gudang@e2e.local',
          password: 'gudang12345',
          role: Role.GUDANG,
        })
        .expect(201);

      const created = res.body as UserResponseBody;
      expect(created.email).toBe('gudang@e2e.local');
      expect(created).not.toHaveProperty('passwordHash');
      expect(created).not.toHaveProperty('password');
    });

    it('rejects a duplicate email with 409', async () => {
      await request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          nama: 'Duplikat',
          email: 'gudang@e2e.local',
          password: 'whatever12',
          role: Role.STAFF,
        })
        .expect(409);
    });

    it('rejects an invalid payload with 400', async () => {
      await request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          nama: 'X',
          email: 'not-an-email',
          password: '123',
          role: 'superuser',
        })
        .expect(400);
    });

    it('forbids staff from creating users', async () => {
      await request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${staffToken}`)
        .send({
          nama: 'Nope',
          email: 'nope@e2e.local',
          password: 'whatever12',
          role: Role.STAFF,
        })
        .expect(403);
    });
  });

  describe('PATCH /users/:id', () => {
    it('lets admin update another user, including role', async () => {
      const createRes = await request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          nama: 'Untuk Diubah',
          email: 'diubah@e2e.local',
          password: 'whatever12',
          role: Role.STAFF,
        });
      const created = createRes.body as UserResponseBody;

      const res = await request(app.getHttpServer())
        .patch(`/users/${created.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ role: Role.GUDANG, nama: 'Sudah Diubah' })
        .expect(200);

      const updated = res.body as UserResponseBody;
      expect(updated.role).toBe(Role.GUDANG);
      expect(updated.nama).toBe('Sudah Diubah');
    });

    it('blocks an admin from demoting their own role', async () => {
      await request(app.getHttpServer())
        .patch(`/users/${adminId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ role: Role.STAFF })
        .expect(403);
    });
  });

  describe('DELETE /users/:id', () => {
    it('blocks deleting your own account', async () => {
      await request(app.getHttpServer())
        .delete(`/users/${adminId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(403);
    });

    it('lets admin delete another user', async () => {
      const createRes = await request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          nama: 'Untuk Dihapus',
          email: 'dihapus@e2e.local',
          password: 'whatever12',
          role: Role.STAFF,
        });
      const created = createRes.body as UserResponseBody;

      await request(app.getHttpServer())
        .delete(`/users/${created.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const listRes = await request(app.getHttpServer())
        .get('/users')
        .set('Authorization', `Bearer ${adminToken}`);
      const list = listRes.body as UserResponseBody[];
      expect(list.find((u) => u.id === created.id)).toBeUndefined();
    });
  });

  describe('GET/PATCH /settings/business', () => {
    it('auto-creates and returns the single settings row for any authenticated user', async () => {
      const res = await request(app.getHttpServer())
        .get('/settings/business')
        .set('Authorization', `Bearer ${staffToken}`)
        .expect(200);

      const settings = res.body as BusinessSettingsResponseBody;
      expect(settings.namaBisnis).toBeTruthy();
    });

    it('forbids non-admin from updating business settings', async () => {
      await request(app.getHttpServer())
        .patch('/settings/business')
        .set('Authorization', `Bearer ${staffToken}`)
        .send({ namaBisnis: 'Harusnya Ditolak' })
        .expect(403);
    });

    it('lets admin update business settings', async () => {
      const res = await request(app.getHttpServer())
        .patch('/settings/business')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ namaBisnis: 'Toko E2E', telepon: '08123456789' })
        .expect(200);

      const settings = res.body as BusinessSettingsResponseBody;
      expect(settings.namaBisnis).toBe('Toko E2E');
      expect(settings.telepon).toBe('08123456789');
    });
  });

  describe('PATCH /users/me', () => {
    it('updates own profile and returns a fresh token', async () => {
      const res = await request(app.getHttpServer())
        .patch('/users/me')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ nama: 'Admin Diganti Nama' })
        .expect(200);

      const body = res.body as AuthResponseBody;
      expect(body.user.nama).toBe('Admin Diganti Nama');
      expect(body.accessToken).toBeTruthy();
    });
  });

  describe('PATCH /users/me/password', () => {
    it('rejects the wrong current password', async () => {
      await request(app.getHttpServer())
        .patch('/users/me/password')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ currentPassword: 'salah-password', newPassword: 'newpass123' })
        .expect(401);
    });

    it('changes the password and allows login with the new one', async () => {
      await request(app.getHttpServer())
        .patch('/users/me/password')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ currentPassword: 'admin12345', newPassword: 'newpass123' })
        .expect(200);

      const login = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'admin@e2e.local', password: 'newpass123' })
        .expect(201);

      const body = login.body as AuthResponseBody;
      expect(body.accessToken).toBeTruthy();
    });
  });
});
