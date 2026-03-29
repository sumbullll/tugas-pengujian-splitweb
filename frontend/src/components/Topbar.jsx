import React, { useContext, useState } from 'react';
import { Bell, Search, Menu, Wallet, LogOut } from 'lucide-react';
import { Web3Context } from '../context/Web3Context'; 

// Tambahkan prop onSearch agar halaman bisa menerima teks pencarian
const Topbar = ({ onMenuClick, onSearch }) => { 
  const { account, balance, connectWallet, disconnectWallet, isConnecting } = useContext(Web3Context);
  const [searchQuery, setSearchQuery] = useState('');

  // Fungsi untuk menangkap teks pencarian
  const handleSearch = (e) => {
    const text = e.target.value;
    setSearchQuery(text);
    if (onSearch) onSearch(text); // Kirim teks ke halaman yang memanggil Topbar
  };

  return (
    <header className="bg-white md:bg-transparent flex flex-col md:flex-row md:items-center justify-between px-4 py-4 md:h-20 md:py-0 relative z-20 gap-4 border-b border-[#E8E6E0] md:border-none">
      
      {/* 1. Baris Atas Mobile / Kiri Desktop */}
      <div className="flex items-center justify-between w-full md:w-auto">
        <div className="flex items-center gap-4">
          <button 
            onClick={onMenuClick} 
            className="md:hidden p-2 text-[#1A1916] hover:bg-gray-100 rounded-xl transition-colors border border-[#E8E6E0] bg-[#FAFAF9]"
          >
            <Menu size={20} />
          </button>
          <h2 className="text-xl font-black text-[#1A1916] md:hidden">SplitWeb3</h2>
        </div>

        {/* Notifikasi Khusus Layar HP */}
        <button className="md:hidden w-10 h-10 rounded-full bg-[#FAFAF9] border border-[#E8E6E0] flex items-center justify-center text-[#1A1916] relative shadow-sm">
          <Bell size={18} />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>
      </div>

      {/* 2. Search Bar (Sekarang selalu muncul di Desktop & HP) */}
      <div className="flex-1 w-full max-w-xl mx-auto md:ml-4">
        <div className="flex items-center gap-3 bg-[#FAFAF9] md:bg-white px-4 py-3 md:py-2.5 rounded-2xl border border-[#E8E6E0] shadow-sm w-full focus-within:ring-2 focus-within:ring-[#C9A84C]/50 focus-within:border-[#C9A84C] transition-all">
          <Search size={18} className="text-[#A09E97]" />
          <input 
            type="text" 
            value={searchQuery}
            onChange={handleSearch}
            placeholder="Cari grup atau tagihan..." 
            className="bg-transparent border-none outline-none text-sm w-full text-[#1A1916] placeholder:text-[#A09E97]" 
          />
        </div>
      </div>

      {/* 3. Bagian Kanan Desktop (Notifikasi & Wallet) */}
      <div className="hidden md:flex items-center gap-4">
        <button className="w-10 h-10 rounded-full bg-white border border-[#E8E6E0] flex items-center justify-center text-[#1A1916] hover:bg-[#FAFAF9] transition-colors relative shadow-sm">
          <Bell size={18} />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>

        <div className="flex items-center gap-2">
          <button 
            onClick={account ? null : connectWallet} // Disable klik jika sudah konek (karena kita punya tombol disconnect terpisah)
            disabled={isConnecting}
            className={`flex items-center gap-3 pl-3 pr-5 py-2 ${account ? 'bg-[#1A1916] cursor-default' : 'bg-[#1A1916] hover:bg-[#C9A84C] active:scale-95 cursor-pointer'} text-white rounded-2xl text-sm font-bold transition-colors shadow-lg disabled:opacity-70 disabled:cursor-not-allowed`}
          >
            <div className="w-7 h-7 bg-white/20 rounded-full flex items-center justify-center text-[#C9A84C]">
              <Wallet size={14} />
            </div>
            {isConnecting 
              ? "Loading..." 
              : account 
                ? <div className="flex flex-col text-left">
                    <span className="text-[#E8C96A] text-xs leading-none mb-0.5">{balance} ETH</span>
                    <span className="text-[10px] leading-none text-gray-400 font-medium tracking-wider">{account.substring(0, 5)}...{account.substring(38)}</span>
                  </div>
                : "Connect Wallet"}
          </button>

          {/* Tombol Disconnect Khusus Desktop (Hanya muncul jika account ada) */}
          {account && (
            <button 
              onClick={disconnectWallet}
              title="Putuskan Dompet"
              className="w-10 h-10 rounded-xl bg-red-50 text-red-500 border border-red-100 flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors shadow-sm"
            >
              <LogOut size={16} />
            </button>
          )}
        </div>
      </div>

      {/* 4. Tombol Wallet Khusus HP (Muncul di bawah Search Bar) */}
      <div className="md:hidden w-full flex gap-2">
        <button 
          onClick={account ? null : connectWallet}
          disabled={isConnecting}
          className={`flex-1 flex items-center justify-center gap-2 px-5 py-3.5 ${account ? 'bg-[#1A1916]' : 'bg-[#1A1916] hover:bg-[#C9A84C] active:scale-95'} text-white rounded-xl text-sm font-bold transition-colors shadow-lg disabled:opacity-70 disabled:cursor-not-allowed`}
        >
          <Wallet size={18} className="text-[#C9A84C]" />
          {isConnecting 
            ? "Menghubungkan..." 
            : account 
              ? <span>{balance} ETH | {account.substring(0, 4)}...{account.substring(38)}</span>
              : "Connect Wallet"}
        </button>

        {/* Tombol Disconnect Khusus HP */}
        {account && (
          <button 
            onClick={disconnectWallet}
            className="w-12 flex items-center justify-center bg-red-50 text-red-500 border border-red-100 rounded-xl hover:bg-red-500 hover:text-white transition-colors shadow-sm active:scale-95"
          >
            <LogOut size={18} />
          </button>
        )}
      </div>

    </header>
  );
};

export default Topbar;