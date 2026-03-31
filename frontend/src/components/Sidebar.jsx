import React, { useContext, useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  LayoutDashboard, Users, History, 
  Bell, User, LogOut, Star, X
} from 'lucide-react';
import { Web3Context } from '../context/Web3Context';

const Sidebar = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { disconnectWallet } = useContext(Web3Context);
  const [hasUnread, setHasUnread] = useState(false);

  // Fungsi untuk mengecek notifikasi dari server
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

  useEffect(() => {
    checkNotifications();
    const interval = setInterval(checkNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    if (disconnectWallet) disconnectWallet();
    navigate('/login');
  };

  const menuItems = [
    { path: '/dashboard', name: 'Dashboard', icon: <LayoutDashboard size={22} /> },
    { path: '/groups', name: 'Grup Saya', icon: <Users size={22} /> },
    { path: '/transactions', name: 'Riwayat', icon: <History size={22} /> },
    { path: '/notifications', name: 'Notifikasi', icon: <Bell size={22} /> },
    { path: '/profile', name: 'Profil', icon: <User size={22} /> },
  ];

  return (
    <>
      {/* CSS Khusus Animasi Bintang Jeda & Efek Enterprise */}
      <style>
        {`
          @keyframes spinPause {
            0% { transform: rotate(0deg); }
            9% { transform: rotate(360deg); } /* ~0.3 detik putaran cepat */
            100% { transform: rotate(360deg); } /* Jeda persis 3 detik */
          }
          .animate-spin-pause {
            animation: spinPause 3.3s ease-in-out infinite;
          }
          .enterprise-bg {
            background-color: #0F0E0C;
            background-image: 
              radial-gradient(circle at 50% 0%, rgba(201,168,76,0.15) 0%, transparent 40%),
              url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cpath d='M30 0L60 30 30 60 0 30z' stroke='rgba(201,168,76,0.03)' stroke-width='1'/%3E%3C/g%3E%3C/svg%3E"),
              radial-gradient(rgba(255,255,255,0.02) 1px, transparent 1px);
            background-size: 100% 100%, 60px 60px, 20px 20px;
          }
        `}
      </style>

      {isOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-md transition-opacity" onClick={onClose}></div>
      )}

      <aside className={`fixed top-0 left-0 h-screen w-[280px] text-white flex flex-col z-50 transition-all duration-300 ease-in-out overflow-hidden enterprise-bg ${
        isOpen 
          ? 'translate-x-0 shadow-[10px_0_30px_rgba(0,0,0,0.5)]' 
          : '-translate-x-full shadow-none md:translate-x-0 md:shadow-[10px_0_30px_rgba(0,0,0,0.5)]'
      }`}>
        
        {/* 👉 CAHAYA BIAS (GLOWING ORBS) UNTUK KESAN PREMIUM */}
        <div className="absolute -top-32 -left-32 w-80 h-80 bg-[#C9A84C] opacity-10 blur-[100px] rounded-full z-0 pointer-events-none"></div>
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-[#8B6914] opacity-[0.08] blur-[120px] rounded-full z-0 pointer-events-none"></div>

        {/* HEADER BRANDING (Kesan Proyek Besar) */}
        <div className="relative z-10 pt-10 pb-8 px-8 border-b border-white/5 bg-gradient-to-b from-black/40 to-transparent">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-4">
              {/* Bintang Berputar dengan Border Transparan */}
              <div className="relative flex items-center justify-center w-12 h-12">
                <div className="absolute inset-0 bg-gradient-to-br from-[#C9A84C]/20 to-transparent rounded-xl border border-[#C9A84C]/30 shadow-[0_0_20px_rgba(201,168,76,0.15)]"></div>
                <div className="animate-spin-pause relative z-10">
                  <Star fill="url(#gold-gradient)" className="w-6 h-6 text-[#C9A84C] drop-shadow-[0_0_8px_rgba(201,168,76,0.8)]" />
                  <svg width="0" height="0">
                    <linearGradient id="gold-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop stopColor="#FDE68A" offset="0%" />
                      <stop stopColor="#C9A84C" offset="50%" />
                      <stop stopColor="#8B6914" offset="100%" />
                    </linearGradient>
                  </svg>
                </div>
              </div>
              <div className="flex flex-col justify-center">
                <span className="text-[26px] font-black tracking-tighter drop-shadow-lg leading-none">
                  <span>Split</span><span className="text-[#C9A84C]">Web3</span>
                </span>
              </div>
            </div>
            <button onClick={onClose} className="md:hidden text-[#A09E97] p-2 rounded-lg hover:bg-white/10 transition-colors">
              <X size={24} />
            </button>
          </div>
        </div>

        {/* MENU NAVIGASI */}
        <nav className="relative z-10 flex-1 px-5 py-8 space-y-2 overflow-y-auto scrollbar-hide">
          <div className="text-[10px] font-bold text-[#A09E97]/50 uppercase tracking-widest px-4 mb-4">Main Menu</div>
          
          {menuItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-4 px-4 py-3.5 rounded-2xl font-bold transition-all duration-300 group relative overflow-hidden ${
                  isActive
                    ? 'text-[#FDE68A]'
                    : 'text-[#A09E97] hover:text-white'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {/* Background Highlight Transparan untuk Menu Aktif */}
                  {isActive && (
                    <div className="absolute inset-0 bg-gradient-to-r from-[#C9A84C]/15 to-transparent border border-[#C9A84C]/20 shadow-[inset_3px_0_0_#C9A84C] rounded-2xl"></div>
                  )}
                  
                  {/* Background Hover Element */}
                  <div className="absolute inset-0 bg-white/5 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-300 rounded-2xl"></div>

                  <div className="relative z-10 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                    <div className={`${isActive ? 'text-[#C9A84C] drop-shadow-[0_0_8px_rgba(201,168,76,0.5)]' : 'group-hover:text-[#C9A84C] transition-colors'}`}>
                      {item.icon}
                    </div>
                    
                    {/* LOGIKA TITIK MERAH NOTIFIKASI */}
                    {item.path === '/notifications' && hasUnread && (
                      <span className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-red-500 border-2 border-[#0F0E0C] rounded-full animate-pulse shadow-[0_0_12px_rgba(239,68,68,0.8)]"></span>
                    )}
                  </div>

                  <span className={`relative z-10 tracking-wide transition-all duration-300 ${isActive ? 'translate-x-1' : 'group-hover:translate-x-2'}`}>
                    {item.name}
                  </span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* LOGOUT BUTTON */}
        <div className="relative z-10 p-6 border-t border-white/5 bg-gradient-to-t from-black/40 to-transparent flex flex-col gap-4">
          <button onClick={handleLogout} className="flex items-center justify-center gap-3 w-full px-4 py-3.5 text-[#A09E97] font-bold rounded-xl hover:bg-red-500/10 hover:text-red-400 transition-all duration-300 border border-transparent hover:border-red-500/20 hover:shadow-[0_0_20px_rgba(239,68,68,0.15)] group">
            <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span className="tracking-wide">Keluar Sesi</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;