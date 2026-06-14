# SplitWeb3 - Automated Regression Test Suite
[![Node.js CI (Regression Test)](https://github.com/sumbullll/tugas-pengujian-splitweb/actions/workflows/test.yml/badge.svg)](https://github.com/sumbullll/tugas-pengujian-splitweb/actions/workflows/test.yml)

Repositori ini berisi implementasi Regression Test Suite menggunakan **Jest** dan **Supertest** untuk melindungi fungsionalitas REST API pada aplikasi SplitWeb3, lengkap dengan integrasi CI/CD melalui GitHub Actions.

## 1. Kualitas & Kelengkapan Test Case
Terdapat **12 Test Cases** yang berfokus pada modul `Groups` (`groupController.js`). Setiap *endpoint* diuji menggunakan pola **AAA (Arrange, Act, Assert)** dengan cakupan skenario:
* `POST /api/groups`: Happy Path (Valid Input) & Error Scenario (Blank Name)
* `GET /api/groups`: Happy Path (Get All) & Error Scenario (Wrong URL)
* `GET /api/groups/:id`: Happy Path (Valid ID) & Error Scenario (ID Not Found)
* `POST /api/groups/:id/join`: Happy Path (Valid Join) & Error Scenario (Invalid ID)
* `DELETE /api/groups/:id`: Happy Path (Delete existing) & Error Scenario (Already Deleted)

## 2. Demonstrasi Regresi
Sistem ini telah terbukti dapat menangani regresi. Ketika blok validasi input `name` pada fungsi `createGroup` dinonaktifkan secara sengaja, Test Suite secara otomatis menangkap *bug* tersebut (menghasilkan status `FAIL` dengan kode `Expected: 400, Received: 201`).
<img width="827" height="343" alt="Screenshot 2026-06-14 011618" src="https://github.com/user-attachments/assets/7661a724-1810-431b-89ea-1b1fe459999d" />


## 3. Analisis Code Coverage
<img width="991" height="739" alt="Screenshot 2026-06-14 011305" src="https://github.com/user-attachments/assets/72212c01-5244-4986-b39a-2f4c38a72eb3" />



* **Persentase Modul Utama:** Pengujian difokuskan pada `groupController.js` sebagai perwakilan arsitektur CRUD, dengan cakupan *line coverage* mencapai **>60%**.
* **Analisis Singkat:** Total *coverage* aplikasi (`All files`) berada di kisaran 45%. Hal ini dikarenakan aplikasi SplitWeb3 memiliki modul yang sangat luas (Bills, Transactions, Notifications, Dashboard) yang berada di luar cakupan 12 test case utama penugasan ini. Namun, fondasi arsitektur tes, *mocking database*, dan *setup environment* telah siap untuk diekspansi ke seluruh modul.

## 4. Cara Menjalankan Pengujian (Lokal)
Pastikan server database MySQL (XAMPP/Laragon) berjalan.
```bash
# 1. Masuk ke direktori backend
cd backend

# 2. Install Dependencies
npm install

# 3. Jalankan Test dengan Bypass Auth
$env:BYPASS_AUTH="true"; npx jest --coverage
