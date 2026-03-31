import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import { Users, Plus, ChevronRight, X, ArrowRight } from 'lucide-react';
import PageTransition from '../components/PageTransition'; 

const Groups = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. STATE BARU: Untuk menyimpan teks ketikan dari Topbar
  const [searchTerm, setSearchTerm] = useState('');

  // State untuk Modal Buat Grup
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newGroup, setNewGroup] = useState({ name: '', description: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchGroups = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('https://splitweb3-backend.vercel.app/api/groups', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setGroups(response.data);
    } catch (error) {
      console.error("Gagal mengambil data grup:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    if (!newGroup.name) return alert("Nama grup wajib diisi!");

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post('https://splitweb3-backend.vercel.app/api/groups', newGroup, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNewGroup({ name: '', description: '' });
      setIsModalOpen(false);
      fetchGroups(); // Refresh data
    } catch (error) {
      console.error("Gagal membuat grup:", error);
      alert("Terjadi kesalahan saat membuat grup.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 2. LOGIKA SEARCH: Saring grup berdasarkan nama (menggunakan teks dari Topbar)
  const filteredGroups = groups.filter(group => {
    const searchLower = searchTerm.toLowerCase();
    return (
      group.name.toLowerCase().includes(searchLower) ||
      (group.description && group.description.toLowerCase().includes(searchLower))
    );
  });

  return (
    <div className="flex h-screen bg-[#F1F3F6] overflow-hidden font-sans selection:bg-[#C9A84C] selection:text-white relative">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <div className="flex-1 flex flex-col h-screen overflow-hidden md:ml-[280px] relative">
        
        {/* 👉 DEKORASI BACKGROUND MODERN (Harmonis namun Berbeda) */}
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-blue-400/5 rounded-full blur-[120px] pointer-events-none z-0"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-[#C9A84C]/10 rounded-full blur-[120px] pointer-events-none z-0"></div>

        {/* 3. TERIMA KETIKAN DARI TOPBAR: Masukkan onSearch ke sini */}
        <Topbar 
          onMenuClick={() => setIsSidebarOpen(true)} 
          onSearch={(text) => setSearchTerm(text)} 
        />

        <main className="flex-1 overflow-y-auto p-4 md:p-8 relative z-10 pb-24 md:pb-8 scrollbar-hide">
          <PageTransition key="groups">
            
            {/* Header Halaman (Modern, Megah, Profesional) */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 mb-10">
              <div>
                <h1 className="text-3xl md:text-4xl font-black text-[#0F172A] tracking-tight mb-2">Grup Saya</h1>
                <p className="text-sm font-medium text-slate-500">Kelola semua grup patungan Web3 kamu di satu tempat.</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(true)}
                className="flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-[#0F172A] to-[#1E293B] text-white rounded-xl font-bold text-sm hover:-translate-y-0.5 transition-all shadow-[0_8px_20px_rgba(15,23,42,0.2)] hover:shadow-[0_8px_25px_rgba(15,23,42,0.3)] border border-slate-700/50"
              >
                <Plus size={18} className="text-[#C9A84C]" /> Buat Grup Baru
              </button>
            </div>

            {/* Area Daftar Grup */}
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="w-10 h-10 border-4 border-[#C9A84C]/30 border-t-[#C9A84C] rounded-full animate-spin"></div>
              </div>
            ) : groups.length === 0 ? (
              <div className="py-24 flex flex-col items-center justify-center text-center border-2 border-dashed border-slate-200 rounded-[2rem] bg-white/50 backdrop-blur-sm shadow-sm relative overflow-hidden">
                <div className="w-20 h-20 bg-white rounded-3xl shadow-sm flex items-center justify-center mb-6 relative z-10">
                  <Users className="w-10 h-10 text-slate-300" />
                </div>
                <h3 className="text-2xl font-black text-[#0F172A] mb-3 relative z-10">Belum ada grup</h3>
                <p className="text-slate-500 font-medium mb-8 max-w-md relative z-10 leading-relaxed">Mulai petualangan patungan Web3 kamu dengan membuat grup pertama sekarang!</p>
                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="bg-white text-[#0F172A] border border-slate-200 px-8 py-3.5 rounded-xl font-bold text-sm hover:border-[#C9A84C] hover:text-[#C9A84C] transition-all shadow-sm relative z-10 flex items-center gap-2"
                >
                  <Plus size={18} /> Mulai Buat Grup
                </button>
                
                {/* Elemen Dekoratif di dalam Empty State */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full blur-3xl -z-0"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#C9A84C]/5 rounded-full blur-3xl -z-0"></div>
              </div>
            ) : filteredGroups.length === 0 ? (
              /* Tampilan Jika Hasil Pencarian Tidak Ditemukan */
              <div className="py-24 flex flex-col items-center justify-center text-center bg-white/50 backdrop-blur-sm rounded-[2rem] border border-white shadow-sm">
                <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
                  <span className="text-2xl">🔍</span>
                </div>
                <p className="text-slate-500 font-bold text-lg mb-1">Tidak ada grup yang cocok</p>
                <p className="text-sm text-slate-400">Pencarian "{searchTerm}" tidak membuahkan hasil.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                
                {/* 4. RENDER GRUP YANG SUDAH DISARING DENGAN DESAIN BENTO/GLASSMORPHISM */}
                {filteredGroups.map((group) => (
                  <div 
                    key={group.id} 
                    onClick={() => navigate(`/groups/${group.id}`)}
                    className="bg-white/80 backdrop-blur-xl p-6 md:p-8 rounded-[1.5rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.03)] hover:-translate-y-1 hover:shadow-[0_15px_40px_rgba(201,168,76,0.08)] hover:border-[#C9A84C]/30 transition-all duration-300 cursor-pointer group flex flex-col h-full relative overflow-hidden"
                  >
                    {/* 👉 Aksen Latar Hover (Konseptual seperti Bintang) */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#C9A84C]/5 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

                    <div className="flex-1 relative z-10">
                      <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-[#C9A84C] mb-6 group-hover:bg-[#C9A84C] group-hover:text-white transition-all duration-300 shadow-sm">
                        <Users size={26} />
                      </div>
                      <h4 className="font-black text-[#0F172A] text-xl mb-2 group-hover:text-[#C9A84C] transition-colors tracking-tight line-clamp-1">{group.name}</h4>
                      <p className="text-sm font-medium text-slate-500 line-clamp-2 leading-relaxed">{group.description || 'Grup patungan SplitWeb3'}</p>
                    </div>
                    
                    <div className="mt-8 pt-5 border-t border-slate-100 flex justify-between items-center text-sm font-bold text-slate-400 group-hover:text-[#0F172A] transition-colors relative z-10">
                      <span>Lihat Detail</span> 
                      <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-[#0F172A] group-hover:text-white transition-all duration-300 group-hover:scale-110">
                        <ArrowRight size={16} />
                      </div>
                    </div>
                  </div>
                ))}

              </div>
            )}
            
          </PageTransition>
        </main>
      </div>

      {/* ================= MODAL BUAT GRUP (ELEGANT SEPERTI DASHBOARD & CONTEXT) ================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
            onClick={() => setIsModalOpen(false)}
          ></div>
          
          <div className="bg-white w-full max-w-md rounded-[2rem] p-8 relative z-10 shadow-[0_20px_60px_rgba(0,0,0,0.15)] animate-appear border border-white">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-6 right-6 text-slate-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
            
            <div className="w-12 h-12 bg-[#C9A84C]/10 rounded-2xl flex items-center justify-center mb-5 text-[#C9A84C]">
              <Users size={24} />
            </div>
            
            <h2 className="text-2xl font-black text-[#0F172A] mb-2 tracking-tight">Buat Grup Baru</h2>
            <p className="text-sm text-slate-500 mb-8 font-medium leading-relaxed">Grup ini akan digunakan untuk mencatat semua patungan kamu bersama teman-teman.</p>
            
            <form onSubmit={handleCreateGroup} className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-1">Nama Grup</label>
                <input 
                  type="text" 
                  value={newGroup.name}
                  onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                  placeholder="Contoh: Kontrakan Mawar, Liburan Bali..." 
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium text-[#0F172A] outline-none focus:ring-4 focus:ring-[#C9A84C]/10 focus:border-[#C9A84C] focus:bg-white transition-all"
                  required
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-1">Deskripsi Singkat (Opsional)</label>
                <textarea 
                  value={newGroup.description}
                  onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
                  placeholder="Untuk apa grup ini dibuat?" 
                  rows="3"
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium text-[#0F172A] outline-none focus:ring-4 focus:ring-[#C9A84C]/10 focus:border-[#C9A84C] focus:bg-white transition-all resize-none"
                ></textarea>
              </div>

              <div className="flex gap-3 mt-4 pt-4 border-t border-slate-100">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-4 rounded-xl font-bold text-sm text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className={`flex-[1.5] py-4 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-[#C9A84C] to-[#A68A3D] shadow-[0_8px_20px_rgba(201,168,76,0.3)] hover:shadow-[0_8px_25px_rgba(201,168,76,0.4)] hover:-translate-y-0.5 transition-all ${isSubmitting ? 'opacity-70 cursor-not-allowed transform-none' : ''}`}
                >
                  {isSubmitting ? 'Memproses...' : 'Buat Grup'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Groups;