import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import PageTransition from '../components/PageTransition';
// 👉 TAMBAHAN IMPORT: Trash2 untuk icon hapus
import { Bell, CheckCircle, AlertTriangle, Info, Check, Trash2 } from 'lucide-react';

const Notifications = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // 👉 STATE BARU: Untuk pop-up konfirmasi hapus semua
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://127.0.0.1:5000/api/notifications', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(response.data);
    } catch (error) {
      console.error("Gagal memuat notifikasi:", error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://127.0.0.1:5000/api/notifications/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setNotifications(notifications.map(n => 
        n.id === id ? { ...n, is_read: true } : n
      ));
    } catch (error) {
      console.error("Gagal menandai dibaca:", error);
    }
  };

  // 👉 FUNGSI BARU: Eksekusi API hapus semua notifikasi
  const executeClearAll = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete('http://127.0.0.1:5000/api/notifications', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setNotifications([]); // Kosongkan tampilan langsung
      setIsConfirmOpen(false); // Tutup modal
    } catch (error) {
      console.error("Gagal menghapus notifikasi:", error);
      alert("Terjadi kesalahan saat membersihkan notifikasi.");
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const getIcon = (type) => {
    switch (type) {
      case 'success': return <CheckCircle size={24} className="text-emerald-500" />;
      case 'warning': return <AlertTriangle size={24} className="text-amber-500" />;
      default: return <Info size={24} className="text-blue-500" />;
    }
  };

  const getIconBg = (type) => {
    switch (type) {
      case 'success': return 'bg-emerald-50 border-emerald-100';
      case 'warning': return 'bg-amber-50 border-amber-100';
      default: return 'bg-blue-50 border-blue-100';
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center bg-[#FAFAF9] text-[#C9A84C] font-bold">Memuat notifikasi...</div>;

  return (
    <div className="flex h-screen bg-[#FAFAF9] overflow-hidden font-sans relative">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <div className="flex-1 flex flex-col h-screen overflow-hidden md:ml-72 relative z-0">
        <Topbar onMenuClick={() => setIsSidebarOpen(true)} />

        <main className="flex-1 overflow-y-auto p-4 md:p-8 relative z-10 pb-24">
          <PageTransition key="notifications">
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <div>
                <h1 className="text-2xl md:text-3xl font-black text-[#1A1916] flex items-center gap-3">
                  Notifikasi <Bell size={28} className="text-[#C9A84C]" />
                </h1>
                <p className="text-sm text-[#A09E97] mt-1">Pemberitahuan seputar tagihan dan pembayaranmu.</p>
              </div>
              
              {/* 👉 TOMBOL BARU: Muncul kalau ada notifikasi saja */}
              {notifications.length > 0 && (
                <button 
                  onClick={() => setIsConfirmOpen(true)}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-600 border border-red-100 rounded-xl font-bold text-sm hover:bg-red-500 hover:text-white transition-colors shadow-sm w-fit"
                >
                  <Trash2 size={16} /> <span className="hidden sm:inline">Bersihkan Semua</span>
                </button>
              )}
            </div>

            <div className="bg-white rounded-[1.5rem] border border-[#E8E6E0] p-6 shadow-sm min-h-[400px]">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <Bell className="w-16 h-16 text-[#A09E97] mb-4 opacity-30" />
                  <p className="text-[#1A1916] font-bold text-lg">Belum ada pemberitahuan</p>
                  <p className="text-[#A09E97] text-sm mt-1">Saat ini belum ada notifikasi baru untukmu.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {notifications.map((notif) => (
                    <div 
                      key={notif.id} 
                      onClick={() => !notif.is_read && markAsRead(notif.id)}
                      className={`p-5 border rounded-2xl transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer
                        ${notif.is_read 
                          ? 'border-[#E8E6E0] bg-[#FAFAF9] opacity-70 hover:opacity-100' 
                          : 'border-[#C9A84C]/50 bg-[#FBF5E6]/30 shadow-sm hover:border-[#C9A84C]'}
                      `}
                    >
                      <div className="flex items-start md:items-center gap-4">
                        <div className={`w-12 h-12 flex-shrink-0 rounded-xl flex items-center justify-center shadow-sm border ${getIconBg(notif.type)}`}>
                          {getIcon(notif.type)}
                        </div>
                        
                        <div>
                          <h4 className={`text-base ${notif.is_read ? 'font-bold text-[#1A1916]' : 'font-black text-[#1A1916]'}`}>
                            {notif.title}
                          </h4>
                          <p className="text-sm text-[#6A6965] mt-0.5 leading-relaxed">
                            {notif.message}
                          </p>
                          <div className="flex items-center gap-2 mt-2 text-xs text-[#A09E97]">
                            <span>{new Date(notif.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                        </div>
                      </div>

                      {!notif.is_read && (
                        <div className="flex-shrink-0 self-end md:self-center">
                          <span className="flex items-center gap-1.5 text-[10px] font-bold text-[#C9A84C] bg-white border border-[#E8E6E0] px-3 py-1.5 rounded-lg shadow-sm hover:bg-[#FBF5E6] transition-colors">
                            <Check size={12} /> Tandai Dibaca
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

          </PageTransition>
        </main>
      </div>

      {/* 👉 POP-UP KONFIRMASI HAPUS SEMUA */}
      {isConfirmOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsConfirmOpen(false)}></div>
          <div className="bg-white w-full max-w-sm rounded-[2rem] p-6 relative z-10 shadow-2xl animate-appear text-center">
            
            <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4 bg-red-50 text-red-500">
              <Trash2 size={32} />
            </div>
            
            <h2 className="text-xl font-black text-[#1A1916] mb-2">Bersihkan Semua?</h2>
            <p className="text-sm text-[#A09E97] mb-6 leading-relaxed">
              Apakah kamu yakin ingin menghapus seluruh riwayat notifikasi ini? Data yang sudah dihapus tidak bisa dikembalikan.
            </p>
            
            <div className="flex gap-3">
              <button 
                onClick={() => setIsConfirmOpen(false)}
                className="flex-1 py-3 rounded-xl font-bold text-sm text-[#1A1916] bg-[#FAFAF9] border border-[#E8E6E0] hover:bg-gray-100 transition-colors"
              >
                Batal
              </button>
              <button 
                onClick={executeClearAll}
                className="flex-1 py-3 rounded-xl font-bold text-sm text-white shadow-lg transition-all hover:opacity-90 bg-red-500 shadow-red-500/20"
              >
                Ya, Bersihkan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notifications;