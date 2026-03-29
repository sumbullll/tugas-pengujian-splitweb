import React, { useContext, useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  LayoutDashboard, Users, History, 
  Bell, User, LogOut, Star, X 
} from 'lucide-react'; // Ikon Receipt sudah dihapus
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

      const response = await axios.get('http://127.0.0.1:5000/api/notifications', {
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

  // 👉 MENU SUDAH DIBERSIHKAN: "Buat Tagihan" dihilangkan
  const menuItems = [
    { path: '/dashboard', name: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { path: '/groups', name: 'Grup Saya', icon: <Users size={20} /> },
    { path: '/transactions', name: 'Riwayat', icon: <History size={20} /> },
    { path: '/notifications', name: 'Notifikasi', icon: <Bell size={20} /> },
    { path: '/profile', name: 'Profil', icon: <User size={20} /> },
  ];

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm transition-opacity" onClick={onClose}></div>
      )}

      <aside className={`fixed top-0 left-0 h-screen w-72 bg-[#1A1916] text-white flex flex-col z-50 transition-transform duration-300 ease-in-out shadow-2xl ${
        isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}>
        
        <div className="absolute inset-0 z-0 opacity-[0.05]" 
             style={{ backgroundImage: 'radial-gradient(#C9A84C 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
        </div>

        <div className="relative z-10 h-24 flex items-center justify-between px-8 border-b border-white/5 bg-gradient-to-b from-white/5 to-transparent">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 bg-gradient-to-br from-[#C9A84C] to-[#8B6914] flex items-center justify-center rounded-xl shadow-lg border border-white/10 animate-spin-slow">
              <Star fill="white" className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-black tracking-tight">
              <span>Split</span><span className="text-[#C9A84C]">Web3</span>
            </span>
          </div>
          <button onClick={onClose} className="md:hidden text-[#A09E97] p-2 rounded-lg bg-white/5">
            <X size={24} />
          </button>
        </div>

        <nav className="relative z-10 flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {menuItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-4 px-4 py-3.5 rounded-2xl font-bold transition-all group border border-transparent ${
                  isActive
                    ? 'bg-white/10 text-[#C9A84C] border-white/5 shadow-inner'
                    : 'text-[#A09E97] hover:bg-white/5 hover:text-white'
                }`
              }
            >
              <div className="relative">
                <div className={`${item.path === '/dashboard' ? 'text-[#C9A84C]' : 'group-hover:text-[#C9A84C] transition-colors'}`}>
                  {item.icon}
                </div>
                
                {/* 👉 LOGIKA TITIK MERAH NOTIFIKASI */}
                {item.path === '/notifications' && hasUnread && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 border-2 border-[#1A1916] rounded-full animate-pulse"></span>
                )}
              </div>

              <span className="tracking-wide">{item.name}</span>
            </NavLink>
          ))}
        </nav>

        <div className="relative z-10 p-6 border-t border-white/5">
          <button onClick={handleLogout} className="flex items-center gap-4 w-full px-4 py-3.5 text-[#A09E97] font-semibold rounded-2xl hover:bg-red-500/10 hover:text-red-400 transition-colors border border-transparent hover:border-red-500/20">
            <LogOut size={20} />
            <span className="tracking-wide">Keluar Akun</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;