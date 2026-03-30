import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Users, CheckCircle, XCircle } from 'lucide-react';

const JoinGroup = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState('');

  // 1. Cek apakah grupnya valid saat halaman dibuka
  useEffect(() => {
    const fetchGroup = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          alert("Kamu harus login dulu untuk bergabung ke grup!");
          navigate('/login');
          return;
        }

        const response = await axios.get(`https://splitweb3-backend.vercel.app/api/groups/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setGroup(response.data.group);
      } catch (err) {
        setError('Grup tidak ditemukan atau link undangan sudah tidak valid.');
      } finally {
        setLoading(false);
      }
    };
    fetchGroup();
  }, [id, navigate]);

  // 2. Fungsi saat tombol "Gabung Sekarang" diklik
  const handleJoin = async () => {
    setJoining(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(`https://splitweb3-backend.vercel.app/api/groups/${id}/join`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Berhasil bergabung dengan grup!');
      navigate(`/groups/${id}`); // Langsung arahkan ke dalam grup
    } catch (err) {
      if (err.response && err.response.status === 400) {
        alert('Kamu sudah menjadi anggota di grup ini!');
        navigate(`/groups/${id}`);
      } else {
        alert('Gagal bergabung ke grup.');
      }
    } finally {
      setJoining(false);
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center bg-[#FAFAF9] font-bold text-[#C9A84C]">Memuat undangan...</div>;

  if (error) return (
    <div className="h-screen flex flex-col items-center justify-center bg-[#FAFAF9] p-4 text-center">
      <XCircle size={64} className="text-red-500 mb-4" />
      <h1 className="text-2xl font-black text-[#1A1916] mb-2">Oops!</h1>
      <p className="text-[#A09E97] mb-8">{error}</p>
      <button onClick={() => navigate('/dashboard')} className="px-6 py-3 bg-[#1A1916] text-white rounded-xl font-bold hover:bg-[#C9A84C] transition-colors">
        Kembali ke Dashboard
      </button>
    </div>
  );

  return (
    <div className="h-screen flex items-center justify-center bg-[#FAFAF9] p-4 selection:bg-[#C9A84C] selection:text-white relative overflow-hidden">
      {/* Dekorasi Background */}
      <div className="absolute top-[-10%] right-[-5%] w-[300px] h-[300px] bg-[#E8C96A]/20 rounded-full blur-[100px] pointer-events-none z-0"></div>
      
      <div className="bg-white max-w-md w-full p-8 rounded-[2.5rem] shadow-2xl text-center border border-[#E8E6E0] relative z-10">
        
        <div className="w-20 h-20 bg-gradient-to-br from-[#C9A84C] to-[#E8C96A] rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-[#C9A84C]/30 rotate-12">
          <Users size={32} className="text-white -rotate-12" />
        </div>
        
        <h1 className="text-2xl font-black text-[#1A1916] mb-2">Undangan Bergabung</h1>
        <p className="text-[#A09E97] mb-8 text-sm">Kamu diundang untuk patungan bersama di dalam grup:</p>
        
        <div className="bg-[#FAFAF9] p-5 rounded-2xl border border-[#E8E6E0] mb-8 shadow-inner">
          <h2 className="text-xl font-extrabold text-[#1A1916]">{group.name}</h2>
          <p className="text-sm text-[#A09E97] mt-1">{group.description || 'Tidak ada deskripsi'}</p>
        </div>
        
        <div className="flex gap-3">
          <button 
            onClick={() => navigate('/dashboard')} 
            className="flex-1 py-3.5 rounded-xl font-bold text-sm text-[#1A1916] bg-[#FAFAF9] border border-[#E8E6E0] hover:bg-gray-100 transition-colors"
          >
            Nanti Saja
          </button>
          <button 
            onClick={handleJoin} 
            disabled={joining} 
            className="flex-1 py-3.5 rounded-xl font-bold text-sm text-white bg-[#1A1916] hover:bg-[#C9A84C] transition-colors shadow-lg active:scale-95"
          >
            {joining ? 'Memproses...' : 'Gabung Sekarang'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default JoinGroup;