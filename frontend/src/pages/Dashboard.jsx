import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import { ArrowUpRight, ArrowDownLeft, Users, Activity, ChevronRight, X, Plus } from 'lucide-react';
import PageTransition from '../components/PageTransition';

// Helper untuk format Rupiah
const formatIDR = (amount) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(amount || 0);
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // State untuk Data Grup
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  // State BARU: Untuk Data Summary Dashboard
  const [summary, setSummary] = useState({
    totalHutang: 0,
    totalPiutang: 0,
    onChainCount: 0
  });

  // State BARU: Untuk Hutang Mendesak
  const [urgentDebts, setUrgentDebts] = useState([]);

  // State untuk Modal Buat Grup
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newGroup, setNewGroup] = useState({ name: '', description: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fungsi untuk mengambil SEMUA data dashboard
  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const groupRes = await axios.get('https://splitweb3-backend.vercel.app/api/groups', { headers });
      setGroups(groupRes.data);

      try {
        const summaryRes = await axios.get('https://splitweb3-backend.vercel.app/api/dashboard/summary', { headers });
        setSummary({
          totalHutang: summaryRes.data.totalHutang || 0,
          totalPiutang: summaryRes.data.totalPiutang || 0,
          onChainCount: summaryRes.data.onChainCount || 0
        });
        setUrgentDebts(summaryRes.data.urgentDebts || []);
      } catch (summaryErr) {
        console.warn("API Summary belum siap, menggunakan data 0 sementara.");
      }
    } catch (error) {
      console.error("Gagal mengambil data dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    } else {
      fetchDashboardData();
    }
  }, [navigate]);

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
      fetchDashboardData();
    } catch (error) {
      console.error("Gagal membuat grup:", error);
      alert("Terjadi kesalahan saat membuat grup.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#F4F5F7] overflow-hidden font-sans selection:bg-[#C9A84C] selection:text-white relative">
      
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <div className="flex-1 flex flex-col h-screen overflow-hidden md:ml-[280px] relative">
        
        {/* 👉 DEKORASI BACKGROUND MODERN */}
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-blue-400/5 rounded-full blur-[120px] pointer-events-none z-0"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-[#C9A84C]/10 rounded-full blur-[120px] pointer-events-none z-0"></div>

        <Topbar onMenuClick={() => setIsSidebarOpen(true)} />

        <main className="flex-1 overflow-y-auto p-4 md:p-8 relative z-10 pb-24 md:pb-8 scrollbar-hide">
          <PageTransition key="dashboard">
            
            {/* ================= METRIC CARDS (BENTO STYLE) ================= */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6 mb-10">
              
              {/* CARD HUTANG */}
              <div className="bg-white/80 backdrop-blur-xl p-6 rounded-[1.5rem] border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden group hover:-translate-y-1 transition-all duration-300">
                <div className="absolute top-0 right-0 w-24 h-24 bg-red-100/50 rounded-bl-full -z-10 group-hover:scale-110 transition-transform duration-500"></div>
                <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center mb-5 border border-red-100 group-hover:bg-red-500 group-hover:text-white transition-colors duration-300 shadow-sm">
                  <ArrowUpRight size={24} />
                </div>
                <p className="text-[#64748B] text-xs font-bold uppercase tracking-widest mb-1">Total Hutang</p>
                <h3 className="text-2xl md:text-3xl font-black text-[#0F172A] tracking-tight">
                  {loading ? '...' : formatIDR(summary.totalHutang)}
                </h3>
              </div>

              {/* CARD PIUTANG */}
              <div className="bg-white/80 backdrop-blur-xl p-6 rounded-[1.5rem] border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden group hover:-translate-y-1 transition-all duration-300">
                <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-100/50 rounded-bl-full -z-10 group-hover:scale-110 transition-transform duration-500"></div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-5 border border-emerald-100 group-hover:bg-emerald-500 group-hover:text-white transition-colors duration-300 shadow-sm">
                  <ArrowDownLeft size={24} />
                </div>
                <p className="text-[#64748B] text-xs font-bold uppercase tracking-widest mb-1">Total Piutang</p>
                <h3 className="text-2xl md:text-3xl font-black text-[#0F172A] tracking-tight">
                  {loading ? '...' : formatIDR(summary.totalPiutang)}
                </h3>
              </div>

              {/* CARD GRUP AKTIF (PREMIUM DARK) */}
              <div className="bg-gradient-to-br from-[#0F172A] to-[#1E293B] p-6 rounded-[1.5rem] shadow-[0_10px_40px_rgba(15,23,42,0.2)] relative overflow-hidden group hover:-translate-y-1 transition-all duration-300 border border-slate-700/50">
                <div className="absolute -right-6 -top-6 text-white/5 group-hover:rotate-12 group-hover:scale-110 transition-all duration-500 pointer-events-none">
                  <Users size={120} />
                </div>
                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-2xl bg-[#C9A84C]/20 text-[#C9A84C] border border-[#C9A84C]/30 flex items-center justify-center mb-5 shadow-[0_0_15px_rgba(201,168,76,0.2)]">
                    <Users size={24} />
                  </div>
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Grup Aktif</p>
                  <h3 className="text-2xl md:text-3xl font-black text-white tracking-tight">
                    {loading ? '...' : `${groups.length} Grup`}
                  </h3>
                </div>
              </div>

              {/* CARD ON-CHAIN (GOLD) */}
              <div className="bg-gradient-to-br from-[#C9A84C] to-[#A68A3D] p-6 rounded-[1.5rem] shadow-[0_10px_40px_rgba(201,168,76,0.3)] relative overflow-hidden group hover:-translate-y-1 transition-all duration-300">
                <div className="absolute inset-0 opacity-20 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9IiNmZmYiLz48L3N2Zz4=')]"></div>
                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md text-white border border-white/30 flex items-center justify-center mb-5">
                    <Activity size={24} />
                  </div>
                  <p className="text-white/80 text-xs font-bold uppercase tracking-widest mb-1">On-Chain Tx</p>
                  <h3 className="text-2xl md:text-3xl font-black text-white tracking-tight">
                    {loading ? '...' : `${summary.onChainCount} Tx`}
                  </h3>
                </div>
              </div>
            </div>

            {/* ================= BAGIAN BAWAH DASHBOARD ================= */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
              
              {/* DAFTAR GRUP AKTIF */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white/80 backdrop-blur-xl rounded-[1.5rem] border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 md:p-8">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xl font-black text-[#0F172A]">Grup Berbagi</h3>
                    <button 
                      onClick={() => setIsModalOpen(true)}
                      className="text-sm font-bold text-white bg-[#0F172A] hover:bg-[#C9A84C] px-5 py-2.5 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center gap-2"
                    >
                      <Plus size={18} /> Buat Grup
                    </button>
                  </div>

                  {loading ? (
                    <div className="flex justify-center py-10">
                      <div className="w-8 h-8 border-4 border-[#C9A84C]/30 border-t-[#C9A84C] rounded-full animate-spin"></div>
                    </div>
                  ) : groups.length === 0 ? (
                    <div className="py-16 flex flex-col items-center justify-center text-center border-2 border-dashed border-slate-200 rounded-[1.5rem] bg-slate-50/50">
                      <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-4">
                        <Users className="w-8 h-8 text-slate-300" />
                      </div>
                      <p className="text-slate-500 font-semibold mb-1">Belum ada Grup berbagi</p>
                      <p className="text-xs text-slate-400 mb-5 max-w-xs">Buat Grup baru untuk mulai mencatat dan membagi tagihan bersama teman.</p>
                      <button 
                        onClick={() => setIsModalOpen(true)}
                        className="bg-white text-[#0F172A] border border-slate-200 px-6 py-2.5 rounded-xl font-bold text-sm hover:border-[#C9A84C] hover:text-[#C9A84C] transition-all shadow-sm"
                      >
                        Mulai Buat Grup
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {groups.map((group) => (
                        <div 
                          key={group.id} 
                          onClick={() => navigate(`/groups/${group.id}`)}
                          className="p-5 bg-white border border-slate-100 rounded-[1.25rem] hover:border-[#C9A84C]/50 hover:shadow-[0_8px_25px_rgba(201,168,76,0.1)] transition-all cursor-pointer group flex items-center justify-between"
                        >
                          <div className="flex-1 pr-4">
                            <h4 className="font-extrabold text-[#0F172A] text-lg mb-1 group-hover:text-[#C9A84C] transition-colors">{group.name}</h4>
                            <p className="text-xs font-medium text-slate-400 line-clamp-1">{group.description || 'Tidak ada deskripsi'}</p>
                          </div>
                          <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-[#C9A84C] group-hover:text-white transition-all duration-300 group-hover:scale-110">
                            <ChevronRight size={18} />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* HUTANG MENDESAK */}
              <div className="bg-white/80 backdrop-blur-xl rounded-[1.5rem] border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 md:p-8 h-fit">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-2 h-6 bg-red-500 rounded-full"></div>
                  <h3 className="text-lg font-black text-[#0F172A]">Perlu Perhatian</h3>
                </div>
                
                {loading ? (
                  <p className="text-sm text-slate-400 text-center py-8 font-medium">Memeriksa tagihan...</p>
                ) : urgentDebts.length === 0 ? (
                  <div className="py-10 flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mb-3">
                      <span className="text-2xl">🎉</span>
                    </div>
                    <p className="text-sm font-bold text-slate-600">Semua Tagihan Aman!</p>
                    <p className="text-xs text-slate-400 mt-1">Kamu tidak punya tagihan mendesak.</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    {urgentDebts.map((debt, index) => (
                      <div key={index} className="flex flex-col p-4 border border-red-100 bg-red-50/30 rounded-2xl hover:bg-red-50/80 transition-colors">
                        <div className="flex justify-between items-start mb-2">
                          <p className="text-sm font-bold text-[#0F172A] line-clamp-1 flex-1 pr-2">{debt.bill_title}</p>
                          <span className="text-[10px] font-bold text-red-600 bg-red-100 px-2 py-1 rounded-md">Mendesak</span>
                        </div>
                        <div className="flex justify-between items-end mt-1">
                          <p className="text-xs font-medium text-slate-500">Ke: <span className="font-bold text-slate-700">{debt.payer_name}</span></p>
                          <div className="text-right">
                            <p className="text-base font-black text-[#0F172A] mb-1">{formatIDR(debt.amount)}</p>
                            <button 
                              onClick={() => navigate(`/groups/${debt.group_id}`)}
                              className="text-[11px] font-bold text-white bg-[#0F172A] hover:bg-[#C9A84C] px-3 py-1.5 rounded-lg transition-colors"
                            >
                              Selesaikan
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
            
          </PageTransition>
        </main>
      </div>

      {/* ================= MODAL BUAT GRUP (ELEGANT) ================= */}
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
            <p className="text-sm text-slate-500 mb-8 font-medium">Beri nama Grup ini untuk mulai membagi tagihan dengan lebih terorganisir.</p>
            
            <form onSubmit={handleCreateGroup} className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-1">Nama Grup</label>
                <input 
                  type="text" 
                  value={newGroup.name}
                  onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                  placeholder="Contoh: Liburan Bali 2026..." 
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium text-[#0F172A] outline-none focus:ring-4 focus:ring-[#C9A84C]/10 focus:border-[#C9A84C] focus:bg-white transition-all"
                  required
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-1">Deskripsi Singkat <span className="text-slate-400 font-normal lowercase">(Opsional)</span></label>
                <textarea 
                  value={newGroup.description}
                  onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
                  placeholder="Ceritakan sedikit tentang Grup ini..." 
                  rows="3"
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium text-[#0F172A] outline-none focus:ring-4 focus:ring-[#C9A84C]/10 focus:border-[#C9A84C] focus:bg-white transition-all resize-none"
                ></textarea>
              </div>

              <div className="flex gap-3 mt-4">
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
                  {isSubmitting ? 'Memproses...' : 'Buat Grup Sekarang'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Dashboard;