import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, ArrowRight, Star, ShieldCheck, CheckCircle2, Lock } from 'lucide-react';
import metamaskLogo from '../assets/metamask.svg';

const LoginPage = () => {
  // State Management
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Handler Login Biasa (Email & Password)
  const handleLogin = async (e) => {
    e.preventDefault();
    setError(''); // Reset error

    // Validasi Front-end
    if (!email) return setError('Email tidak boleh kosong.');
    if (!/\S+@\S+\.\S+/.test(email)) return setError('Format email tidak valid.');
    if (password.length < 6) return setError('Password minimal 6 karakter.');

    setLoading(true);
    try {
      // POST request ke endpoint login (Sudah diarahkan ke Vercel)
      const response = await axios.post('https://splitweb3-backend.vercel.app/api/auth/login', { 
        email, 
        password 
      });

      // Simpan data ke localStorage
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      // Simpan ID user agar GroupDetail bisa membacanya!
      localStorage.setItem('userId', response.data.user.id);

      // Redirect ke dashboard
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal terhubung ke server. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  // Handler Login MetaMask
  const handleMetaMask = async () => {
    setError('');
    if (!window.ethereum) {
      setError('MetaMask tidak terinstall. Download ekstensi di metamask.io');
      return;
    }

    try {
      // Request akses ke wallet
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });
      
      const walletAddress = accounts[0];
      
      // Implementasi lanjutan: Kirim wallet address ke backend
      /*
      const response = await axios.post('https://splitweb3-backend.vercel.app/api/auth/wallet-login', { walletAddress });
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      navigate('/dashboard');
      */
      
      alert(`Berhasil terhubung dengan dompet: ${walletAddress.substring(0,6)}... \n(Integrasi backend untuk Web3 sedang disiapkan)`);
      
    } catch (err) {
      setError('Akses MetaMask ditolak oleh pengguna.');
    }
  };

  return (
    // Container Utama
    <div className="min-h-screen flex flex-col md:flex-row bg-[#FAFAF9] font-sans selection:bg-[#C9A84C] selection:text-white">
      
      {/* ================= PANEL KIRI (HERO) ================= */}
      <div className="relative w-full md:w-[55%] bg-[#1A1916] flex flex-col justify-between overflow-hidden
                      [clip-path:polygon(0_0,100%_0,100%_96%,0_100%)] md:[clip-path:polygon(0_0,100%_0,88%_100%,0_100%)]
                      pb-12 md:pb-0 z-10 shadow-2xl">
        
        {/* Dekorasi Background */}
        <div className="absolute inset-0 z-0 opacity-20 pointer-events-none" 
             style={{ backgroundImage: 'radial-gradient(#C9A84C 1px, transparent 1px)', backgroundSize: '32px 32px' }}>
        </div>
        <div className="absolute top-[-10%] left-[-10%] w-[300px] h-[300px] bg-[#C9A84C]/20 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-[20%] right-[-10%] w-[250px] h-[250px] bg-[#E8C96A]/10 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute top-[40%] left-[20%] w-[200px] h-[200px] bg-blue-900/20 rounded-full blur-[80px] pointer-events-none"></div>

        {/* Konten Hero */}
        <div className="relative z-10 p-6 sm:p-10 md:p-16 flex flex-col h-full justify-center">
          
          {/* Logo */}
          <div className="flex items-center gap-2 mb-12 md:mb-16">
            <div className="w-8 h-8 bg-gradient-to-br from-[#C9A84C] to-[#8B6914] flex items-center justify-center rounded-lg shadow-lg shadow-[#C9A84C]/20">
              <Star fill="white" className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-bold tracking-wide">
              <span className="text-white">Split</span>
              <span className="text-[#C9A84C]">Web3</span>
            </span>
          </div>

          {/* Tagline & Deskripsi */}
          <div className="max-w-md md:max-w-lg mb-10">
            <h1 className="text-[26px] md:text-[38px] leading-[1.2] font-semibold text-white mb-4 tracking-tight">
              Patungan cerdas, bukti <span className="text-[#C9A84C]">transparan</span> di blockchain.
            </h1>
            <p className="text-[#A09E97] text-sm md:text-base leading-relaxed">
              Platform modern untuk mengelola pengeluaran grup. Hitung otomatis, bayar via Crypto, dan simpan riwayat tak terhapuskan di Sepolia Ethereum.
            </p>
          </div>

          {/* Feature Pills (Horizontal scroll di mobile) */}
          <div className="flex overflow-x-auto md:flex-wrap gap-3 pb-4 md:pb-0 scrollbar-hide -mx-6 px-6 md:mx-0 md:px-0">
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/5 border border-[#C9A84C]/30 text-white text-xs md:text-sm whitespace-nowrap backdrop-blur-sm">
              <CheckCircle2 className="w-4 h-4 text-[#C9A84C]" /> Split bill otomatis
            </div>
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/5 border border-[#C9A84C]/30 text-white text-xs md:text-sm whitespace-nowrap backdrop-blur-sm">
              <CheckCircle2 className="w-4 h-4 text-[#C9A84C]" /> Bayar via MetaMask
            </div>
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/5 border border-[#C9A84C]/30 text-white text-xs md:text-sm whitespace-nowrap backdrop-blur-sm">
              <CheckCircle2 className="w-4 h-4 text-[#C9A84C]" /> Bukti on-chain
            </div>
          </div>

        </div>

        {/* Badge Bawah (Sembunyi di Mobile) */}
        <div className="hidden md:flex items-center gap-2 relative z-10 px-16 pb-12">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#C9A84C] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#C9A84C]"></span>
          </span>
          <span className="text-[#A09E97] text-xs tracking-wider uppercase font-medium">Berjalan di Sepolia Testnet</span>
        </div>
      </div>


      {/* ================= PANEL KANAN (FORM) ================= */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12 bg-[#FAFAF9] -mt-10 md:mt-0 relative z-0">
        
        <div className="w-full max-w-[360px] flex flex-col pt-10 md:pt-0">
          
          {/* Header Form */}
          <div className="mb-8 text-center md:text-left">
            <h2 className="text-2xl font-bold text-[#1A1916] mb-1">Masuk ke akun</h2>
            <p className="text-[#A09E97] text-sm">
              Belum punya akun? <Link to="/register" className="text-[#8B6914] font-semibold hover:text-[#C9A84C] transition-colors">Daftar sekarang</Link>
            </p>
          </div>

          {/* Tombol MetaMask */}
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
  <span className="text-sm tracking-tight font-bold">Lanjutkan dengan MetaMask</span>
</button>

          {/* Divider ATAU */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-[#E8E6E0]"></span></div>
            <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-widest text-[#A09E97]">
              <span className="bg-[#FAFAF9] px-3">Atau</span>
            </div>
          </div>

          {/* Form Login Utama */}
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            
            {/* Input Email */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-[#A09E97] uppercase tracking-wider ml-1">Email</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com" 
                className="w-full px-4 py-3 bg-white border border-[#E8E6E0] rounded-xl text-sm text-[#1A1916] outline-none focus:ring-2 focus:ring-[#C9A84C]/50 focus:border-[#C9A84C] transition-all placeholder:text-[#A09E97]/60"
              />
            </div>

            {/* Input Password */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center ml-1 pr-1">
                <label className="text-[11px] font-bold text-[#A09E97] uppercase tracking-wider">Password</label>
                <Link to="/forgot" className="text-[11px] font-semibold text-[#8B6914] hover:text-[#C9A84C] transition-colors">Lupa sandi?</Link>
              </div>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" 
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

            {/* Checkbox Ingat Saya */}
            <div className="flex items-center gap-2 mt-1">
              <input 
                type="checkbox" 
                id="remember"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-[#E8E6E0] text-[#C9A84C] focus:ring-[#C9A84C] bg-white cursor-pointer accent-[#C9A84C]"
              />
              <label htmlFor="remember" className="text-xs text-[#1A1916] cursor-pointer font-medium">Ingat saya di perangkat ini</label>
            </div>

            {/* Pesan Error */}
            {error && (
              <p className="text-red-500 text-xs font-medium mt-1 animate-pulse">{error}</p>
            )}

            {/* Tombol Submit Gradient Emas */}
            <button 
              type="submit" 
              disabled={loading}
              className={`mt-4 w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#C9A84C] to-[#E8C96A] text-[#1A1916] py-3.5 rounded-xl font-bold text-sm hover:opacity-90 active:scale-[0.98] transition-all shadow-lg shadow-[#C9A84C]/20 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {loading ? 'Memproses...' : 'Masuk ke SplitWeb3'}
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>

            {/* Link Daftar (Mobile only - optional tapi bagus untuk UX) */}
            <div className="mt-4 text-center md:hidden">
               <span className="text-xs text-[#A09E97]">Belum punya akun?</span> <Link to="/register" className="text-xs font-bold text-[#8B6914]">Daftar gratis</Link>
            </div>
          </form>

          {/* Trust Badges */}
          <div className="mt-12 pt-6 border-t border-[#E8E6E0] flex justify-center gap-4">
            <div className="flex flex-col items-center gap-1 opacity-70 hover:opacity-100 transition-opacity cursor-default">
              <ShieldCheck className="w-4 h-4 text-[#A09E97]" />
              <span className="text-[9px] font-bold text-[#A09E97] uppercase tracking-wider">Web3 Verified</span>
            </div>
            <div className="flex flex-col items-center gap-1 opacity-70 hover:opacity-100 transition-opacity cursor-default">
              <Lock className="w-4 h-4 text-[#A09E97]" />
              <span className="text-[9px] font-bold text-[#A09E97] uppercase tracking-wider">JWT Secured</span>
            </div>
            <div className="flex flex-col items-center gap-1 opacity-70 hover:opacity-100 transition-opacity cursor-default">
              <div className="w-4 h-4 rounded-full border border-[#A09E97] flex items-center justify-center">
                 <div className="w-2 h-2 bg-[#A09E97] rounded-full"></div>
              </div>
              <span className="text-[9px] font-bold text-[#A09E97] uppercase tracking-wider">Sepolia Testnet</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default LoginPage;