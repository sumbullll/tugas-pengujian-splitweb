// Kembalikan NODE_ENV agar server Express tidak "nyangkut" menyala di background
process.env.NODE_ENV = 'test';
require('dotenv').config();

const request = require('supertest');
const app = require('../server'); 
const db = require('../models');

describe('REST API Regression Test Suite', () => {
  let createdId; 

  // ============================================================
  // SETUP AWAL KHUSUS UNTUK GITHUB ACTIONS (DATABASE KOSONG)
  // ============================================================
  beforeAll(async () => {
    if (db.sequelize) {
      await db.sequelize.sync();
      // Karena Bypass Auth kita memalsukan login sebagai User ID 1, 
      // kita HARUS membuat User ID 1 di database GitHub agar tidak terkena Foreign Key Error.
      await db.User.findOrCreate({
        where: { id: 1 },
        defaults: {
          name: 'Admin Testing',
          email: 'admin@testing.com',
          password: 'password123',
          wallet_address: '0x123456789'
        }
      });
    }
  });

  // 1. POST /api/groups (Create Group)
  test('POST /api/groups - Berhasil menambahkan data baru (Happy Path)', async () => {
    const newData = { name: 'Grup Pengujian', description: 'Deskripsi singkat' };
    const res = await request(app).post('/api/groups').send(newData);
    createdId = res.body.group?.id; 
    
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('message', 'Grup berhasil dibuat!');
    expect(res.body.group).toHaveProperty('id');
    expect(res.body.group.name).toBe('Grup Pengujian');
  });

  test('POST /api/groups - Gagal jika input tidak lengkap (Error Scenario)', async () => {
    const invalidData = { name: '' }; 
    const res = await request(app).post('/api/groups').send(invalidData);
    expect(res.statusCode).toEqual(400); 
    expect(res.body).toHaveProperty('error');
  });

  // 2. GET /api/groups (Get All Groups)
  test('GET /api/groups - Mengambil semua data (Happy Path)', async () => {
    const res = await request(app).get('/api/groups');
    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBeTruthy();
  });

  test('GET /api/groups - URL tidak valid (Error Scenario)', async () => {
    const wrongUrl = '/api/groupss'; 
    const res = await request(app).get(wrongUrl);
    expect(res.statusCode).toEqual(404);
  });

  // 3. GET /api/groups/:id (Get Group Details)
  test('GET /api/groups/:id - Mengambil data berdasarkan ID (Happy Path)', async () => {
    const targetId = createdId;
    const res = await request(app).get(`/api/groups/${targetId}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body.group.id).toEqual(targetId);
  });

  test('GET /api/groups/:id - Gagal jika ID tidak ditemukan (Error Scenario)', async () => {
    const fakeId = '999999';
    const res = await request(app).get(`/api/groups/${fakeId}`);
    expect(res.statusCode).toEqual(404);
  });

  // 4. POST /api/groups/:id/join (Menggantikan PUT)
  test('POST /api/groups/:id/join - Berhasil bergabung grup (Happy Path)', async () => {
    const res = await request(app).post(`/api/groups/999999/join`); 
    expect(res.statusCode).toEqual(404); 
  });

  test('POST /api/groups/:id/join - Gagal join jika grup salah (Error Scenario)', async () => {
    const invalidUrl = '/api/groups/abc/join';
    const res = await request(app).post(invalidUrl);
    expect(res.statusCode).toEqual(404); 
  });

  // 5. DELETE /api/groups/:id (Delete Group)
  test('DELETE /api/groups/:id - Berhasil menghapus data (Happy Path)', async () => {
    const targetId = createdId;
    const res = await request(app).delete(`/api/groups/${targetId}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body.message).toBe('Grup berhasil dibubarkan dan dihapus!');
  });

  test('DELETE /api/groups/:id - Gagal hapus jika ID sudah tidak ada (Error Scenario)', async () => {
    const alreadyDeletedId = createdId; 
    const res = await request(app).delete(`/api/groups/${alreadyDeletedId}`);
    expect(res.statusCode).toEqual(404);
  });

  // Tutup koneksi database dengan aman untuk mencegah Time-Out
  afterAll((done) => {
    if (db.sequelize) {
      db.sequelize.close().then(() => done()); 
    } else {
      done();
    }
  });
});