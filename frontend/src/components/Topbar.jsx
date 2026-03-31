import React, { useContext, useState, useEffect } from 'react';
import { Bell, Search, Menu, Wallet, LogOut } from 'lucide-react';
import { Web3Context } from '../context/Web3Context'; 
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Topbar = ({ onMenuClick, onSearch }) => { 
  const navigate = useNavigate();
  const { account, balance, connectWallet, disconnectWallet, isConnecting } = useContext(Web3Context);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [hasUnread, setHasUnread] = useState(false);

  // Fungsi untuk menangkap teks pencarian
  const handleSearch = (e) => {
    const text = e.target.value;
    setSearchQuery(text);
    if (onSearch) onSearch(text); 
  };

  // Cek notifikasi agar lonceng ada titik merahnya jika ada pesan baru
  useEffect(() => {
    const checkNotifications = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const response = await axios.get('https://splitweb3-backend.vercel.app/api/notifications', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const unread = response.data.some(notif => notif.is_read === false);
        setHasUnread(unread);
      } catch (error) {
        console.error("Gagal cek status notifikasi:", error);
      }
    };

    checkNotifications();
    const interval = setInterval(checkNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 shadow-[0_4px_30px_rgb(0,0,0,0.02)] flex flex-col md:flex-row md:items-center justify-between px-4 py-3 md:h-20 md:py-0 transition-all gap-3 md:gap-4">
      
      {/* 1. Baris Atas Mobile / Kiri Desktop */}
      <div className="flex items-center justify-between w-full md:w-auto">
        <div className="flex items-center gap-3">
          <button 
            onClick={onMenuClick} 
            className="md:hidden p-2 text-slate-600 hover:text-[#0F172A] hover:bg-slate-100 rounded-xl transition-colors border border-slate-200 bg-slate-50 shadow-sm"
          >
            <Menu size={20} />
          </button>
          
          {/* Logo Mobile Mewah & Bisa Diklik */}
          <div 
            className="md:hidden flex items-center cursor-pointer"
            onClick={() => navigate('/dashboard')}
          >
            <h2 className="text-xl font-black tracking-tighter text-[#0F172A]">
              Split<span className="text-[#C9A84C]">Web3</span>
            </h2>
          </div>
        </div>

        {/* Notifikasi Khusus Layar HP (Berfungsi & Elegan) */}
        <button 
          onClick={() => navigate('/notifications')}
          className="md:hidden w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-600 hover:text-[#C9A84C] relative shadow-sm transition-colors"
        >
          <Bell size={18} />
          {hasUnread && (
            <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-white animate-pulse shadow-[0_0_5px_rgba(239,68,68,0.5)]"></span>
          )}
        </button>
      </div>

      {/* 2. Search Bar (Proporsi Diperbaiki agar tidak terlalu besar) */}
      <div className="flex-1 w-full max-w-xl mx-auto md:ml-4">
        <div className="flex items-center gap-3 bg-slate-50 px-4 py-2.5 rounded-[1rem] border border-slate-200 shadow-sm w-full focus-within:ring-4 focus-within:ring-[#C9A84C]/10 focus-within:border-[#C9A84C] focus-within:bg-white transition-all group">
          <Search size={18} className="text-slate-400 group-focus-within:text-[#C9A84C] transition-colors" />
          <input 
            type="text" 
            value={searchQuery}
            onChange={handleSearch}
            placeholder="Cari grup atau tagihan..." 
            className="bg-transparent border-none outline-none text-sm font-medium w-full text-[#0F172A] placeholder:text-slate-400" 
          />
        </div>
      </div>

      {/* 3. Bagian Kanan Desktop (Notifikasi & Wallet) */}
      <div className="hidden md:flex items-center gap-3">
        {/* Notifikasi Desktop */}
        <button 
          onClick={() => navigate('/notifications')}
          className="w-11 h-11 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100 hover:text-[#C9A84C] transition-colors relative shadow-sm group"
          title="Notifikasi"
        >
          <Bell size={18} className="group-hover:animate-wiggle" />
          {hasUnread && (
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-white animate-pulse shadow-[0_0_5px_rgba(239,68,68,0.5)]"></span>
          )}
        </button>

        {/* Grup Tombol Wallet Desktop */}
        <div className="flex items-center gap-2">
          <button 
            onClick={account ? null : connectWallet} 
            disabled={isConnecting}
            className={`flex items-center gap-3 pl-2 pr-5 py-1.5 ${account ? 'bg-white border border-slate-200 shadow-sm cursor-default' : 'bg-gradient-to-r from-[#0F172A] to-[#1E293B] hover:-translate-y-0.5 shadow-[0_8px_20px_rgba(15,23,42,0.15)] hover:shadow-[0_8px_25px_rgba(15,23,42,0.25)] border border-slate-700/50 cursor-pointer'} rounded-xl text-sm font-bold transition-all disabled:opacity-70 disabled:cursor-not-allowed`}
          >
            <div className={`w-8 h-8 rounded-[0.6rem] flex items-center justify-center shadow-sm ${account ? 'bg-gradient-to-br from-[#C9A84C] to-[#A68A3D] text-white' : 'bg-white/10 text-[#C9A84C]'}`}>
              <Wallet size={14} />
            </div>
            {isConnecting ? (
              <span className="text-white">Loading...</span>
            ) : account ? (
              <div className="flex flex-col text-left py-0.5">
                <span className="text-[#0F172A] text-[11px] font-black leading-none mb-0.5 tracking-tight">{balance} ETH</span>
                <span className="text-[10px] leading-none text-slate-400 font-bold tracking-wider">{account.substring(0, 5)}...{account.substring(38)}</span>
              </div>
            ) : (
              <span className="text-white tracking-wide">Connect Wallet</span>
            )}
          </button>

          {/* Tombol Disconnect Khusus Desktop */}
          {account && (
            <button 
              onClick={disconnectWallet}
              title="Putuskan Dompet"
              className="w-11 h-11 rounded-xl bg-red-50 text-red-500 border border-red-100 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-sm"
            >
              <LogOut size={16} />
            </button>
          )}
        </div>
      </div>

      {/* 4. Tombol Wallet Khusus HP (Muncul di bawah Search Bar, Dibuat Lebih Ramping) */}
      <div className="md:hidden w-full flex gap-2">
        <button 
          onClick={account ? null : connectWallet}
          disabled={isConnecting}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 ${account ? 'bg-white border border-slate-200 text-[#0F172A]' : 'bg-gradient-to-r from-[#0F172A] to-[#1E293B] text-white hover:opacity-90 active:scale-95 border border-slate-700/50'} rounded-xl text-xs sm:text-sm font-bold transition-all shadow-sm disabled:opacity-70 disabled:cursor-not-allowed`}
        >
          <Wallet size={16} className={account ? 'text-[#C9A84C]' : 'text-[#C9A84C]'} />
          {isConnecting 
            ? "Menghubungkan..." 
            : account 
              ? <span className="tracking-tight">{parseFloat(balance).toFixed(3)} ETH <span className="text-slate-300 font-normal mx-1">|</span> {account.substring(0, 4)}...{account.substring(38)}</span>
              : "Connect Wallet"}
        </button>

        {/* Tombol Disconnect Khusus HP */}
        {account && (
          <button 
            onClick={disconnectWallet}
            className="w-11 flex items-center justify-center bg-red-50 text-red-500 border border-red-100 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm active:scale-95"
          >
            <LogOut size={16} />
          </button>
        )}
      </div>

    </header>
  );
};

export default Topbar;