import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import { Users, Plus, ChevronRight, X } from 'lucide-react';
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
    <div className="flex h-screen bg-[#FAFAF9] overflow-hidden font-sans">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <div className="flex-1 flex flex-col h-screen overflow-hidden md:ml-72 relative">
        
        {/* 3. TERIMA KETIKAN DARI TOPBAR: Masukkan onSearch ke sini */}
        <Topbar 
          onMenuClick={() => setIsSidebarOpen(true)} 
          onSearch={(text) => setSearchTerm(text)} 
        />

        <main className="flex-1 overflow-y-auto p-4 md:p-8 relative z-10 pb-24">
          <PageTransition key="groups">
            
            {/* Header Halaman */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <div>
                <h1 className="text-2xl md:text-3xl font-black text-[#1A1916]">Daftar Grup</h1>
                <p className="text-sm text-[#A09E97] mt-1">Kelola semua grup patunganmu di sini.</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(true)}
                className="flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#C9A84C] to-[#E8C96A] text-[#1A1916] rounded-xl font-bold text-sm hover:opacity-90 transition-opacity shadow-lg shadow-[#C9A84C]/20"
              >
                <Plus size={18} /> Buat Grup Baru
              </button>
            </div>

            {/* Area Daftar Grup */}
            {loading ? (
              <div className="flex justify-center items-center h-64 text-[#C9A84C] font-bold">Memuat daftar grup...</div>
            ) : groups.length === 0 ? (
              <div className="py-20 flex flex-col items-center justify-center text-center border-2 border-dashed border-[#E8E6E0] rounded-3xl bg-white shadow-sm">
                <Users className="w-16 h-16 text-[#A09E97] mb-4 opacity-50" />
                <h3 className="text-xl font-bold text-[#1A1916] mb-2">Belum ada grup</h3>
                <p className="text-[#A09E97] mb-6 max-w-sm">Mulai petualangan patunganmu dengan membuat grup pertama sekarang juga!</p>
                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="bg-[#1A1916] text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-[#C9A84C] transition-colors"
                >
                  + Buat Grup Baru
                </button>
              </div>
            ) : filteredGroups.length === 0 ? (
              /* Tampilan Jika Hasil Pencarian Tidak Ditemukan */
              <div className="py-20 flex flex-col items-center justify-center text-center">
                <p className="text-[#A09E97] font-bold">Tidak ada grup yang cocok dengan "{searchTerm}"</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                
                {/* 4. RENDER GRUP YANG SUDAH DISARING: Ubah groups.map jadi filteredGroups.map */}
                {filteredGroups.map((group) => (
                  <div 
                    key={group.id} 
                    onClick={() => navigate(`/groups/${group.id}`)}
                    className="bg-white p-6 border border-[#E8E6E0] rounded-[1.5rem] shadow-sm hover:shadow-md hover:border-[#C9A84C] transition-all cursor-pointer group flex flex-col h-full"
                  >
                    <div className="flex-1">
                      <div className="w-12 h-12 rounded-2xl bg-[#FAFAF9] flex items-center justify-center text-[#C9A84C] mb-4 group-hover:bg-[#C9A84C] group-hover:text-white transition-colors">
                        <Users size={24} />
                      </div>
                      <h4 className="font-black text-[#1A1916] text-xl mb-2 group-hover:text-[#8B6914] transition-colors">{group.name}</h4>
                      <p className="text-sm text-[#A09E97] line-clamp-2">{group.description || 'Grup patungan SplitWeb3'}</p>
                    </div>
                    <div className="mt-6 pt-4 border-t border-[#E8E6E0] flex justify-between items-center text-sm font-bold text-[#A09E97] group-hover:text-[#1A1916] transition-colors">
                      Lihat Detail <ChevronRight size={18} />
                    </div>
                  </div>
                ))}

              </div>
            )}
            
          </PageTransition>
        </main>
      </div>

      {/* Modal Buat Grup (Sama persis) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="bg-white w-full max-w-md rounded-[2rem] p-6 md:p-8 relative z-10 shadow-2xl animate-appear">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 text-[#A09E97] hover:text-[#1A1916] p-2 rounded-full hover:bg-gray-100 transition-colors">
              <X size={20} />
            </button>
            <h2 className="text-2xl font-black text-[#1A1916] mb-2">Buat Grup Baru</h2>
            <p className="text-sm text-[#A09E97] mb-6">Grup ini akan digunakan untuk mencatat semua patungan kamu.</p>
            <form onSubmit={handleCreateGroup} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-[#A09E97] uppercase tracking-wider ml-1">Nama Grup</label>
                <input type="text" value={newGroup.name} onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })} placeholder="Contoh: Liburan Bali..." className="w-full px-4 py-3.5 bg-[#FAFAF9] border border-[#E8E6E0] rounded-xl text-sm text-[#1A1916] outline-none focus:ring-2 focus:ring-[#C9A84C]/50 focus:border-[#C9A84C] transition-all" required />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-[#A09E97] uppercase tracking-wider ml-1">Deskripsi Singkat</label>
                <textarea value={newGroup.description} onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })} placeholder="Opsional..." rows="3" className="w-full px-4 py-3.5 bg-[#FAFAF9] border border-[#E8E6E0] rounded-xl text-sm text-[#1A1916] outline-none focus:ring-2 focus:ring-[#C9A84C]/50 focus:border-[#C9A84C] transition-all resize-none"></textarea>
              </div>
              <div className="flex gap-3 mt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3.5 rounded-xl font-bold text-sm text-[#1A1916] bg-[#FAFAF9] border border-[#E8E6E0] hover:bg-gray-100 transition-colors">Batal</button>
                <button type="submit" disabled={isSubmitting} className={`flex-1 py-3.5 rounded-xl font-bold text-sm text-[#1A1916] bg-gradient-to-r from-[#C9A84C] to-[#E8C96A] hover:opacity-90 shadow-lg shadow-[#C9A84C]/20 transition-all ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}>
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