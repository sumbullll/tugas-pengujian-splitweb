import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import PageTransition from '../components/PageTransition';
// 👉 PERBAIKAN 1: Kita gunakan useWallet persis seperti di GroupDetail
import { useWallet } from '../hooks/useWallet'; 
import { User, Mail, Wallet, LogOut, ShieldCheck, Copy, CheckCircle } from 'lucide-react';

const Profile = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [userData, setUserData] = useState({ name: 'Loading...', email: 'loading...' });
  const [copied, setCopied] = useState(false);
  
  // 👉 PERBAIKAN 2: Gunakan variabel 'account' (bukan currentAccount)
  const { account, connectWallet, disconnectWallet } = useWallet();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUserData(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    if (disconnectWallet) disconnectWallet();
    navigate('/login');
  };

  const copyToClipboard = () => {
    if (account) {
      navigator.clipboard.writeText(account);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); 
    }
  };

  return (
    <div className="flex h-screen bg-[#FAFAF9] overflow-hidden font-sans relative">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <div className="flex-1 flex flex-col h-screen overflow-hidden md:ml-72 relative z-0">
        <Topbar onMenuClick={() => setIsSidebarOpen(true)} />

        <main className="flex-1 overflow-y-auto p-4 md:p-8 relative z-10 pb-24">
          <PageTransition key="profile">
            
            <div className="mb-8">
              <h1 className="text-2xl md:text-3xl font-black text-[#1A1916] flex items-center gap-3">
                Profil Saya <User size={28} className="text-[#C9A84C]" />
              </h1>
              <p className="text-sm text-[#A09E97] mt-1">Kelola informasi akun dan koneksi dompet Web3 kamu.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* ================= KARTU INFORMASI AKUN ================= */}
              <div className="bg-white rounded-[1.5rem] border border-[#E8E6E0] p-6 md:p-8 shadow-sm h-fit">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#C9A84C] to-[#E8C96A] flex items-center justify-center shadow-lg text-white font-black text-2xl uppercase">
                    {userData.name.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-[#1A1916]">{userData.name}</h2>
                    <span className="flex items-center gap-1 text-xs font-bold text-emerald-500 bg-emerald-50 px-2 py-1 rounded-md mt-1 w-fit">
                      <ShieldCheck size={12} /> Akun Aktif
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex flex-col">
                    <label className="text-[11px] font-bold text-[#A09E97] uppercase tracking-wider mb-1">Nama Lengkap</label>
                    <div className="flex items-center gap-3 bg-[#FAFAF9] px-4 py-3 rounded-xl border border-[#E8E6E0]">
                      <User size={18} className="text-[#A09E97]" />
                      <span className="text-[#1A1916] font-semibold">{userData.name}</span>
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <label className="text-[11px] font-bold text-[#A09E97] uppercase tracking-wider mb-1">Email Terdaftar</label>
                    <div className="flex items-center gap-3 bg-[#FAFAF9] px-4 py-3 rounded-xl border border-[#E8E6E0]">
                      <Mail size={18} className="text-[#A09E97]" />
                      <span className="text-[#1A1916] font-semibold">{userData.email}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* ================= KARTU KONEKSI WEB3 ================= */}
              <div className="flex flex-col gap-6">
                <div className="bg-[#1A1916] rounded-[1.5rem] p-6 md:p-8 shadow-xl relative overflow-hidden group">
                  <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top_right,#C9A84C_0%,transparent_50%)]"></div>
                  
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-6">
                      <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md text-[#C9A84C] flex items-center justify-center">
                        <Wallet size={24} />
                      </div>
                      
                      {/* 👉 PERBAIKAN 3: Cek menggunakan variabel 'account' */}
                      {account ? (
                        <span className="text-xs font-bold text-emerald-400 bg-emerald-400/10 px-3 py-1.5 rounded-lg border border-emerald-400/20 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> Terhubung
                        </span>
                      ) : (
                        <span className="text-xs font-bold text-red-400 bg-red-400/10 px-3 py-1.5 rounded-lg border border-red-400/20">
                          Tidak Terhubung
                        </span>
                      )}
                    </div>

                    <h3 className="text-white font-bold text-lg mb-1">Dompet MetaMask</h3>
                    
                    {account ? (
                      <div className="mt-4">
                        <p className="text-[#A09E97] text-xs mb-2">Wallet Address (Jaringan Sepolia)</p>
                        <div 
                          onClick={copyToClipboard}
                          className="flex items-center justify-between bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-3 rounded-xl cursor-pointer transition-colors"
                          title="Klik untuk menyalin"
                        >
                          <span className="text-white font-mono text-sm truncate mr-4">
                            {account.substring(0, 8)}...{account.substring(account.length - 8)}
                          </span>
                          {copied ? <CheckCircle size={16} className="text-emerald-400" /> : <Copy size={16} className="text-[#A09E97]" />}
                        </div>
                      </div>
                    ) : (
                      <div className="mt-4">
                        <p className="text-[#A09E97] text-xs mb-4">Hubungkan dompetmu untuk membayar via Smart Contract.</p>
                        <button 
                          onClick={connectWallet}
                          className="w-full bg-gradient-to-r from-[#C9A84C] to-[#E8C96A] text-[#1A1916] font-black py-3 rounded-xl shadow-lg hover:opacity-90 transition-opacity"
                        >
                          Hubungkan MetaMask
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <button 
                  onClick={handleLogout}
                  className="flex items-center justify-center gap-2 w-full bg-red-50 hover:bg-red-100 text-red-500 font-bold py-4 rounded-[1.5rem] border border-red-100 transition-colors"
                >
                  <LogOut size={20} /> Keluar dari Aplikasi
                </button>

              </div>
            </div>

          </PageTransition>
        </main>
      </div>
    </div>
  );
};

export default Profile;