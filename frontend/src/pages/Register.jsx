import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, ArrowRight, Star, ShieldCheck, CheckCircle2, Lock } from 'lucide-react';
import metamaskLogo from '../assets/metamask.svg';

const Register = () => {
  // State Management
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Handler Perubahan Input
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handler Registrasi Biasa
  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    // Validasi Front-end
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      return setError('Semua kolom wajib diisi.');
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      return setError('Format email tidak valid.');
    }
    if (formData.password.length < 6) {
      return setError('Password minimal 6 karakter.');
    }
    if (formData.password !== formData.confirmPassword) {
      return setError('Password dan Konfirmasi Password tidak cocok.');
    }
    if (!agreeTerms) {
      return setError('Anda harus menyetujui Syarat dan Ketentuan.');
    }

    setLoading(true);
    try {
      // 👉 FOKUS KE SINI: Kita tembak ke localhost dulu untuk testing backend!
      await axios.post('https://splitweb3-backend.vercel.app/api/auth/register', { 
        name: formData.name,
        email: formData.email, 
        password: formData.password 
      });

      alert('Registrasi berhasil! Silakan masuk dengan akun baru Anda.');
      navigate('/login');
    } catch (err) {
      // Menangkap error spesifik dari backend jika ada
      const errorMsg = err.response?.data?.message || 'Gagal mendaftar. Pastikan server berjalan.';
      setError(errorMsg);
      console.error("Detail Error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Handler Registrasi MetaMask
  const handleMetaMask = async () => {
    setError('');
    if (!window.ethereum) {
      setError('MetaMask tidak terinstall. Download ekstensi di metamask.io');
      return;
    }

    try {
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });
      const walletAddress = accounts[0];
      
      alert(`Berhasil membaca dompet: ${walletAddress.substring(0,6)}... \n(Sistem registrasi Web3 sedang disiapkan)`);
      
    } catch (err) {
      setError('Akses MetaMask ditolak oleh pengguna.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#FAFAF9] font-sans selection:bg-[#C9A84C] selection:text-white">
      
      {/* ================= PANEL KIRI (HERO) ================= */}
      <div className="relative w-full md:w-[55%] bg-[#1A1916] flex flex-col justify-between overflow-hidden
                      [clip-path:polygon(0_0,100%_0,100%_98%,0_100%)] md:[clip-path:polygon(0_0,100%_0,88%_100%,0_100%)]
                      pb-12 md:pb-0 z-10 shadow-2xl min-h-[40vh] md:min-h-screen">
        
        {/* Dekorasi Background */}
        <div className="absolute inset-0 z-0 opacity-20 pointer-events-none" 
             style={{ backgroundImage: 'radial-gradient(#C9A84C 1px, transparent 1px)', backgroundSize: '32px 32px' }}>
        </div>
        <div className="absolute top-[-10%] left-[-10%] w-[300px] h-[300px] bg-[#C9A84C]/20 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-[20%] right-[-10%] w-[250px] h-[250px] bg-[#E8C96A]/10 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute top-[40%] left-[20%] w-[200px] h-[200px] bg-blue-900/20 rounded-full blur-[80px] pointer-events-none"></div>

        {/* Konten Hero */}
        <div className="relative z-10 p-6 sm:p-10 md:p-16 flex flex-col h-full justify-center">
          
          <div className="flex items-center gap-2 mb-8 md:mb-12">
            <div className="w-8 h-8 bg-gradient-to-br from-[#C9A84C] to-[#8B6914] flex items-center justify-center rounded-lg shadow-lg shadow-[#C9A84C]/20">
              <Star fill="white" className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-bold tracking-wide">
              <span className="text-white">Split</span>
              <span className="text-[#C9A84C]">Web3</span>
            </span>
          </div>

          <div className="max-w-md md:max-w-lg mb-10">
            <h1 className="text-[26px] md:text-[38px] leading-[1.2] font-semibold text-white mb-4 tracking-tight">
              Mulai langkah <span className="text-[#C9A84C]">cerdas</span> kelola keuangan grup.
            </h1>
            <p className="text-[#A09E97] text-sm md:text-base leading-relaxed">
              Bergabunglah dengan ekosistem patungan modern. Buat grup, tambah tagihan, dan selesaikan pembayaran secara transparan menggunakan smart contract Ethereum.
            </p>
          </div>

          <div className="flex overflow-x-auto md:flex-wrap gap-3 pb-4 md:pb-0 scrollbar-hide -mx-6 px-6 md:mx-0 md:px-0">
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/5 border border-[#C9A84C]/30 text-white text-xs md:text-sm whitespace-nowrap backdrop-blur-sm">
              <CheckCircle2 className="w-4 h-4 text-[#C9A84C]" /> Desentralisasi
            </div>
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/5 border border-[#C9A84C]/30 text-white text-xs md:text-sm whitespace-nowrap backdrop-blur-sm">
              <CheckCircle2 className="w-4 h-4 text-[#C9A84C]" /> 100% Transparan
            </div>
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/5 border border-[#C9A84C]/30 text-white text-xs md:text-sm whitespace-nowrap backdrop-blur-sm">
              <CheckCircle2 className="w-4 h-4 text-[#C9A84C]" /> Tanpa Pihak Ketiga
            </div>
          </div>

        </div>

        <div className="hidden md:flex items-center gap-2 relative z-10 px-16 pb-12">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#C9A84C] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#C9A84C]"></span>
          </span>
          <span className="text-[#A09E97] text-xs tracking-wider uppercase font-medium">Jaringan Ethereum Sepolia</span>
        </div>
      </div>

      {/* ================= PANEL KANAN (FORM) ================= */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12 bg-[#FAFAF9] -mt-10 md:mt-0 relative z-0">
        
        <div className="w-full max-w-[360px] flex flex-col pt-10 md:pt-0 pb-8 md:pb-0">
          
          <div className="mb-6 text-center md:text-left">
            <h2 className="text-2xl font-bold text-[#1A1916] mb-1">Buat akun baru</h2>
            <p className="text-[#A09E97] text-sm">
              Sudah punya akun? <Link to="/login" className="text-[#8B6914] font-semibold hover:text-[#C9A84C] transition-colors">Masuk di sini</Link>
            </p>
          </div>

          <form onSubmit={handleRegister} className="flex flex-col gap-4">
            
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-[#A09E97] uppercase tracking-wider ml-1">Nama Lengkap</label>
              <input 
                type="text" 
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Masukkan nama Anda" 
                className="w-full px-4 py-3 bg-white border border-[#E8E6E0] rounded-xl text-sm text-[#1A1916] outline-none focus:ring-2 focus:ring-[#C9A84C]/50 focus:border-[#C9A84C] transition-all placeholder:text-[#A09E97]/60"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-[#A09E97] uppercase tracking-wider ml-1">Email</label>
              <input 
                type="email" 
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="nama@email.com" 
                className="w-full px-4 py-3 bg-white border border-[#E8E6E0] rounded-xl text-sm text-[#1A1916] outline-none focus:ring-2 focus:ring-[#C9A84C]/50 focus:border-[#C9A84C] transition-all placeholder:text-[#A09E97]/60"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-[#A09E97] uppercase tracking-wider ml-1">Password</label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Minimal 6 karakter" 
                  className="w-full pl-4 pr-12 py-3 bg-white border border-[#E8E6E0] rounded-xl text-sm text-[#1A1916] outline-none focus:ring-2 focus:ring-[#C9A84C]/50 focus:border-[#C9A84C] transition-all placeholder:text-[#A09E97]/60"
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#A09E97] hover:text-[#1A1916] transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-[#A09E97] uppercase tracking-wider ml-1">Konfirmasi Password</label>
              <div className="relative">
                <input 
                  type={showConfirmPassword ? "text" : "password"} 
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Ulangi password" 
                  className="w-full pl-4 pr-12 py-3 bg-white border border-[#E8E6E0] rounded-xl text-sm text-[#1A1916] outline-none focus:ring-2 focus:ring-[#C9A84C]/50 focus:border-[#C9A84C] transition-all placeholder:text-[#A09E97]/60"
                />
                <button 
                  type="button" 
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#A09E97] hover:text-[#1A1916] transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-start gap-2 mt-1">
              <input 
                type="checkbox" 
                id="terms"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="w-4 h-4 mt-0.5 rounded border-[#E8E6E0] text-[#C9A84C] focus:ring-[#C9A84C] bg-white cursor-pointer accent-[#C9A84C]"
              />
              <label htmlFor="terms" className="text-xs text-[#1A1916] cursor-pointer font-medium leading-relaxed">
                Saya menyetujui <span className="text-[#8B6914] hover:underline">Syarat Layanan</span> dan <span className="text-[#8B6914] hover:underline">Kebijakan Privasi</span> SplitWeb3.
              </label>
            </div>

            {error && (
              <p className="text-red-500 text-xs font-medium mt-1 animate-pulse">{error}</p>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className={`mt-2 w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#C9A84C] to-[#E8C96A] text-[#1A1916] py-3.5 rounded-xl font-bold text-sm hover:opacity-90 active:scale-[0.98] transition-all shadow-lg shadow-[#C9A84C]/20 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {loading ? 'Memproses...' : 'Daftar Sekarang'}
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-[#E8E6E0]"></span></div>
            <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-widest text-[#A09E97]">
              <span className="bg-[#FAFAF9] px-3">Atau</span>
            </div>
          </div>

          <button 
            onClick={handleMetaMask}
            type="button"
            className="w-full flex items-center justify-center gap-3 bg-white border border-[#E8E6E0] py-3.5 rounded-xl font-bold text-[#1A1916] hover:border-[#C9A84C] hover:bg-[#FBF5E6] transition-all active:scale-[0.98] shadow-sm group"
          >
            <img 
              src={metamaskLogo} 
              alt="MetaMask" 
              className="w-6 h-6 group-hover:scale-110 transition-transform" 
            />
            <span className="text-sm tracking-tight">Daftar dengan MetaMask</span>
          </button>

          <div className="mt-8 pt-6 border-t border-[#E8E6E0] flex justify-center gap-4">
            <div className="flex flex-col items-center gap-1 opacity-70 hover:opacity-100 transition-opacity cursor-default">
              <ShieldCheck className="w-4 h-4 text-[#A09E97]" />
              <span className="text-[9px] font-bold text-[#A09E97] uppercase tracking-wider">Web3 Verified</span>
            </div>
            <div className="flex flex-col items-center gap-1 opacity-70 hover:opacity-100 transition-opacity cursor-default">
              <Lock className="w-4 h-4 text-[#A09E97]" />
              <span className="text-[9px] font-bold text-[#A09E97] uppercase tracking-wider">JWT Secured</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Register;