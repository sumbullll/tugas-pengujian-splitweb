# SplitWeb3 - Automated Regression Testing

## Kriteria Penilaian
1. **Kelengkapan Test Case:** Telah dibuat 12 Test Case untuk CRUD `/api/groups`.
2. **Pola AAA:** Semua test menggunakan pola Arrange, Act, Assert.
3. **Demonstrasi Regresi:** *(Masukkan Screenshot Terminal Merah di sini)*
4. **Code Coverage:**
   *(Masukkan Screenshot Tabel Terminal di sini)*
5. **GitHub Actions CI/CD:** Workflow `.github/workflows/test.yml` telah diaktifkan.

## Cara Menjalankan Test Secara Lokal
```bash
cd backend
$env:BYPASS_AUTH="true"; npx jest --coverage