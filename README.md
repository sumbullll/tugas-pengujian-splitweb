# SplitWeb3 - Automated Regression Testing

## Kriteria Penilaian
1. **Kelengkapan Test Case:** Telah dibuat 12 Test Case untuk CRUD `/api/groups`.
2. **Pola AAA:** Semua test menggunakan pola Arrange, Act, Assert.
3. **Demonstrasi Regresi:** <img width="827" height="343" alt="Screenshot 2026-06-14 011618" src="https://github.com/user-attachments/assets/63718d0a-9b71-4143-bcb1-742479e3c6d6" />

4. **Code Coverage:**
   <img width="991" height="739" alt="Screenshot 2026-06-14 011305" src="https://github.com/user-attachments/assets/e1d37e47-0077-403c-b8fb-78945ab28645" />

5. **GitHub Actions CI/CD:** Workflow `.github/workflows/test.yml` telah diaktifkan.

## Cara Menjalankan Test Secara Lokal
```bash
cd backend
$env:BYPASS_AUTH="true"; npx jest --coverage
