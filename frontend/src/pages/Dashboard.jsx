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

  // State BARU: Untuk Data Summary Dashboard (Hutang, Piutang, OnChain)
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

      // 1. Ambil Data Grup
      const groupRes = await axios.get('https://splitweb3-backend.vercel.app/api/groups', { headers });
      setGroups(groupRes.data);

      // 2. Ambil Data Summary (Hutang, Piutang, Tx)
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

  // Jalankan fetch saat halaman pertama kali dibuka
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    } else {
      fetchDashboardData();
    }
  }, [navigate]);

  // Fungsi untuk submit pembuatan grup baru
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
      
      // Refresh semua data
      fetchDashboardData();
    } catch (error) {
      console.error("Gagal membuat grup:", error);
      alert("Terjadi kesalahan saat membuat grup.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#FAFAF9] overflow-hidden font-sans selection:bg-[#C9A84C] selection:text-white relative">
      
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <div className="flex-1 flex flex-col h-screen overflow-hidden md:ml-72 relative">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#E8C96A]/5 rounded-full blur-[120px] pointer-events-none z-0"></div>

        <Topbar onMenuClick={() => setIsSidebarOpen(true)} />

        <main className="flex-1 overflow-y-auto p-4 md:p-8 relative z-10 pb-24 md:pb-8">
          <PageTransition key="dashboard">
            
            {/* ================= METRIC CARDS ================= */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
              <div className="bg-white p-6 rounded-[1.5rem] border border-[#E8E6E0] shadow-sm relative overflow-hidden group hover:border-red-200 transition-colors">
                <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <ArrowUpRight size={24} />
                </div>
                <p className="text-[#A09E97] text-xs font-bold uppercase tracking-widest mb-1">Total Hutang</p>
                <h3 className="text-2xl md:text-3xl font-black text-[#1A1916]">
                  {loading ? '...' : formatIDR(summary.totalHutang)}
                </h3>
              </div>

              <div className="bg-white p-6 rounded-[1.5rem] border border-[#E8E6E0] shadow-sm relative overflow-hidden group hover:border-emerald-200 transition-colors">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <ArrowDownLeft size={24} />
                </div>
                <p className="text-[#A09E97] text-xs font-bold uppercase tracking-widest mb-1">Total Piutang</p>
                <h3 className="text-2xl md:text-3xl font-black text-[#1A1916]">
                  {loading ? '...' : formatIDR(summary.totalPiutang)}
                </h3>
              </div>

              {/* KARTU JUMLAH GRUP */}
              <div className="bg-gradient-to-br from-[#C9A84C] to-[#E8C96A] p-6 rounded-[1.5rem] shadow-lg shadow-[#C9A84C]/20 relative overflow-hidden group">
                <div className="absolute -right-6 -top-6 text-white/20 group-hover:rotate-12 transition-transform duration-500">
                  <Users size={120} />
                </div>
                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md text-[#1A1916] flex items-center justify-center mb-4">
                    <Users size={24} />
                  </div>
                  <p className="text-[#1A1916]/80 text-xs font-bold uppercase tracking-widest mb-1">Grup Aktif</p>
                  <h3 className="text-2xl md:text-3xl font-black text-[#1A1916]">
                    {loading ? '...' : `${groups.length} Grup`}
                  </h3>
                </div>
              </div>

              <div className="bg-[#1A1916] p-6 rounded-[1.5rem] shadow-xl relative overflow-hidden group">
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top_right,#C9A84C_0%,transparent_50%)]"></div>
                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md text-white flex items-center justify-center mb-4">
                    <Activity size={24} />
                  </div>
                  <p className="text-[#A09E97] text-xs font-bold uppercase tracking-widest mb-1">On-Chain Tx</p>
                  <h3 className="text-2xl md:text-3xl font-black text-white">
                    {loading ? '...' : `${summary.onChainCount} Tx`}
                  </h3>
                </div>
              </div>
            </div>

            {/* ================= BAGIAN BAWAH DASHBOARD ================= */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
              
              {/* DAFTAR GRUP AKTIF */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-[1.5rem] border border-[#E8E6E0] p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-[#1A1916]">Grup Aktif Kamu</h3>
                    <button 
                      onClick={() => setIsModalOpen(true)}
                      className="text-sm font-bold text-[#1A1916] bg-[#FBF5E6] hover:bg-[#E8C96A] px-4 py-2 rounded-xl transition-colors flex items-center gap-2"
                    >
                      <Plus size={16} /> Buat Grup
                    </button>
                  </div>

                  {loading ? (
                    <p className="text-center text-[#A09E97] py-8">Memuat grup...</p>
                  ) : groups.length === 0 ? (
                    <div className="py-12 flex flex-col items-center justify-center text-center border-2 border-dashed border-[#E8E6E0] rounded-2xl bg-[#FAFAF9]/50">
                      <Users className="w-12 h-12 text-[#A09E97] mb-3 opacity-50" />
                      <p className="text-[#A09E97] font-medium">Belum ada grup yang dibuat.</p>
                      <button 
                        onClick={() => setIsModalOpen(true)}
                        className="mt-4 bg-[#1A1916] text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-[#C9A84C] transition-colors"
                      >
                        + Buat Grup Baru
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {groups.map((group) => (
                        <div 
                          key={group.id} 
                          onClick={() => navigate(`/groups/${group.id}`)}
                          className="p-4 border border-[#E8E6E0] rounded-2xl hover:border-[#C9A84C] transition-colors cursor-pointer group"
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-extrabold text-[#1A1916] text-lg group-hover:text-[#8B6914]">{group.name}</h4>
                              <p className="text-xs text-[#A09E97] mt-1 line-clamp-1">{group.description || 'Tidak ada deskripsi'}</p>
                            </div>
                            <div className="w-8 h-8 rounded-full bg-[#FAFAF9] flex items-center justify-center text-[#A09E97] group-hover:bg-[#C9A84C] group-hover:text-white transition-colors">
                              <ChevronRight size={16} />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* HUTANG MENDESAK */}
              <div className="bg-white rounded-[1.5rem] border border-[#E8E6E0] p-6 shadow-sm h-fit">
                <h3 className="text-lg font-bold text-[#1A1916] mb-6">Hutang Mendesak</h3>
                
                {loading ? (
                  <p className="text-sm text-[#A09E97] text-center py-6">Mengecek hutang...</p>
                ) : urgentDebts.length === 0 ? (
                  <p className="text-sm text-[#A09E97] text-center py-6">Yeay! Tidak ada tagihan mendesak.</p>
                ) : (
                  <div className="flex flex-col gap-3">
                    {urgentDebts.map((debt, index) => (
                      <div key={index} className="flex justify-between items-center p-3 border border-red-100 bg-red-50/50 rounded-xl">
                        <div>
                          <p className="text-xs font-bold text-[#1A1916] truncate w-32">{debt.bill_title}</p>
                          <p className="text-[10px] text-red-500">Ke: {debt.payer_name}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-black text-[#1A1916]">{formatIDR(debt.amount)}</p>
                          <button 
                            onClick={() => navigate(`/groups/${debt.group_id}`)}
                            className="text-[10px] text-white bg-[#1A1916] hover:bg-[#C9A84C] px-2 py-1 rounded transition-colors mt-1"
                          >
                            Bayar
                          </button>
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

      {/* ================= MODAL BUAT GRUP ================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsModalOpen(false)}
          ></div>
          
          <div className="bg-white w-full max-w-md rounded-[2rem] p-6 md:p-8 relative z-10 shadow-2xl animate-appear">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-6 right-6 text-[#A09E97] hover:text-[#1A1916] p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X size={20} />
            </button>
            
            <h2 className="text-2xl font-black text-[#1A1916] mb-2">Buat Grup Baru</h2>
            <p className="text-sm text-[#A09E97] mb-6">Grup ini akan digunakan untuk mencatat semua patungan kamu bersama teman-teman.</p>
            
            <form onSubmit={handleCreateGroup} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-[#A09E97] uppercase tracking-wider ml-1">Nama Grup</label>
                <input 
                  type="text" 
                  value={newGroup.name}
                  onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                  placeholder="Contoh: Kontrakan Mawar, Liburan Bali..." 
                  className="w-full px-4 py-3.5 bg-[#FAFAF9] border border-[#E8E6E0] rounded-xl text-sm text-[#1A1916] outline-none focus:ring-2 focus:ring-[#C9A84C]/50 focus:border-[#C9A84C] transition-all"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-[#A09E97] uppercase tracking-wider ml-1">Deskripsi Singkat (Opsional)</label>
                <textarea 
                  value={newGroup.description}
                  onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
                  placeholder="Untuk apa grup ini dibuat?" 
                  rows="3"
                  className="w-full px-4 py-3.5 bg-[#FAFAF9] border border-[#E8E6E0] rounded-xl text-sm text-[#1A1916] outline-none focus:ring-2 focus:ring-[#C9A84C]/50 focus:border-[#C9A84C] transition-all resize-none"
                ></textarea>
              </div>

              <div className="flex gap-3 mt-4">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3.5 rounded-xl font-bold text-sm text-[#1A1916] bg-[#FAFAF9] border border-[#E8E6E0] hover:bg-gray-100 transition-colors"
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className={`flex-1 py-3.5 rounded-xl font-bold text-sm text-[#1A1916] bg-gradient-to-r from-[#C9A84C] to-[#E8C96A] hover:opacity-90 shadow-lg shadow-[#C9A84C]/20 transition-all ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
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

export default Dashboard;