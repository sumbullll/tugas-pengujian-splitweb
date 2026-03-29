import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import PageTransition from '../components/PageTransition';
// 👉 TAMBAHAN IMPORT: Trash2 untuk ikon hapus
import { 
  ArrowDown, ArrowUp, Clock, CheckCircle, 
  ExternalLink, Image as ImageIcon, Wallet, Receipt, Trash2
} from 'lucide-react';

const History = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  
  // 👉 STATE BARU: Untuk kontrol modal pop-up konfirmasi
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const fetchHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://127.0.0.1:5000/api/transactions/history', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (Array.isArray(response.data)) {
        setTransactions(response.data);
      } else {
        setTransactions([]);
      }
    } catch (error) {
      console.error("Gagal memuat riwayat transaksi:", error);
      setErrorMsg('Gagal memuat data dari server.');
    } finally {
      setLoading(false);
    }
  };

  // 👉 FUNGSI BARU: Eksekusi hapus semua riwayat transaksi
  const executeClearAll = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete('http://127.0.0.1:5000/api/transactions/history', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setTransactions([]); // Langsung kosongkan tampilan UI
      setIsConfirmOpen(false); // Tutup pop-up
    } catch (error) {
      console.error("Gagal membersihkan riwayat:", error);
      alert("Terjadi kesalahan saat membersihkan riwayat transaksi.");
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  if (loading) return <div className="h-screen flex items-center justify-center bg-[#FAFAF9] text-[#C9A84C] font-bold">Memuat riwayat...</div>;

  return (
    <div className="flex h-screen bg-[#FAFAF9] overflow-hidden font-sans relative">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <div className="flex-1 flex flex-col h-screen overflow-hidden md:ml-72 relative z-0">
        <Topbar onMenuClick={() => setIsSidebarOpen(true)} />

        <main className="flex-1 overflow-y-auto p-4 md:p-8 relative z-10 pb-24">
          <PageTransition key="history">
            
            {/* 👉 BAGIAN HEADER DIUBAH: Ditambah tombol Bersihkan Riwayat */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <div>
                <h1 className="text-2xl md:text-3xl font-black text-[#1A1916]">Riwayat Transaksi</h1>
                <p className="text-sm text-[#A09E97] mt-1">Pantau semua arus kas keluar dan masuk dari akunmu.</p>
              </div>
              
              {/* Tombol hanya muncul jika ada transaksi */}
              {transactions.length > 0 && (
                <button 
                  onClick={() => setIsConfirmOpen(true)}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-600 border border-red-100 rounded-xl font-bold text-sm hover:bg-red-500 hover:text-white transition-colors shadow-sm w-fit"
                >
                  <Trash2 size={16} /> <span className="hidden sm:inline">Bersihkan Riwayat</span>
                </button>
              )}
            </div>

            <div className="bg-white rounded-[1.5rem] border border-[#E8E6E0] p-6 shadow-sm min-h-[400px]">
              {errorMsg ? (
                <div className="text-center py-10 text-rose-500 font-bold">{errorMsg}</div>
              ) : transactions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <Clock className="w-16 h-16 text-[#A09E97] mb-4 opacity-30" />
                  <p className="text-[#1A1916] font-bold text-lg">Belum ada transaksi</p>
                  <p className="text-[#A09E97] text-sm mt-1">Kamu belum pernah melakukan atau menerima pembayaran patungan.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {transactions.map((tx) => {
                    const nominalIDR = tx.amount || tx.amount_idr || 0; 
                    const nominalETH = tx.amount_eth || (nominalIDR / 55000000).toFixed(5);

                    return (
                      <div key={tx.id} className="p-5 border border-[#E8E6E0] rounded-2xl hover:border-[#C9A84C] transition-all bg-[#FAFAF9] flex flex-col md:flex-row md:items-center justify-between gap-4">
                        
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-sm border ${tx.is_income ? 'bg-emerald-50 border-emerald-100 text-emerald-500' : 'bg-rose-50 border-rose-100 text-rose-500'}`}>
                            {tx.is_income ? <ArrowDown size={24} /> : <ArrowUp size={24} />}
                          </div>
                          <div>
                            <h4 className="font-extrabold text-[#1A1916] text-base">
                              {tx.is_income ? `Terima dari ${tx.from_name}` : `Bayar ke ${tx.to_name}`}
                            </h4>
                            <div className="flex items-center gap-2 mt-1 text-xs text-[#A09E97]">
                              <span>{new Date(tx.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                {tx.status === 'confirmed' ? <CheckCircle size={12} className="text-emerald-500"/> : <Clock size={12} className="text-amber-500"/>}
                                {tx.status === 'confirmed' ? 'Berhasil' : 'Pending'}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 md:justify-center">
                          {tx.type === 'onchain' ? (
                              <span className="flex items-center gap-1.5 text-[10px] font-bold text-[#1A1916] bg-gradient-to-r from-[#C9A84C] to-[#E8C96A] px-2.5 py-1 rounded-lg shadow-sm">
                                  <Wallet size={12} /> Crypto (Web3)
                              </span>
                          ) : (
                              <span className="flex items-center gap-1.5 text-[10px] font-bold text-[#A09E97] bg-white border border-[#E8E6E0] px-2.5 py-1 rounded-lg shadow-sm">
                                  <Receipt size={12} /> Tunai / TF
                              </span>
                          )}

                          {tx.type === 'cash' && tx.bukti_foto && (
                              <a href={`http://127.0.0.1:5000/uploads/${tx.bukti_foto}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[10px] font-bold text-blue-600 bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-lg hover:bg-blue-100 transition-colors" title="Lihat Bukti Foto">
                                  <ImageIcon size={12} /> Bukti
                              </a>
                          )}
                        </div>

                        <div className="text-left md:text-right flex flex-col md:items-end">
                          {tx.type === 'onchain' ? (
                            <>
                              <h3 className={`text-lg font-black ${tx.is_income ? 'text-emerald-500' : 'text-[#1A1916]'}`}>
                                {tx.is_income ? '+' : '-'} {nominalETH} ETH
                              </h3>
                              <p className="text-[10px] text-[#A09E97] font-bold mt-0.5">
                                Setara Rp {parseInt(nominalIDR).toLocaleString('id-ID')}
                              </p>
                              
                              {tx.tx_hash && (
                                <a 
                                  href={`https://sepolia.etherscan.io/tx/${tx.tx_hash}`} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1 text-[10px] font-bold text-[#C9A84C] mt-2 hover:text-[#8B6914] transition-colors bg-[#FBF5E6] px-2 py-1 rounded-md"
                                >
                                  Cek TxHash Etherscan <ExternalLink size={10} />
                                </a>
                              )}
                            </>
                          ) : (
                            <>
                              <h3 className={`text-lg font-black ${tx.is_income ? 'text-emerald-500' : 'text-[#1A1916]'}`}>
                                {tx.is_income ? '+' : '-'} Rp {parseInt(nominalIDR).toLocaleString('id-ID')}
                              </h3>
                            </>
                          )}
                        </div>

                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </PageTransition>
        </main>
      </div>

      {/* 👉 MODAL POP-UP KONFIRMASI HAPUS RIWAYAT */}
      {isConfirmOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsConfirmOpen(false)}></div>
          <div className="bg-white w-full max-w-sm rounded-[2rem] p-6 relative z-10 shadow-2xl animate-appear text-center">
            
            <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4 bg-red-50 text-red-500">
              <Trash2 size={32} />
            </div>
            
            <h2 className="text-xl font-black text-[#1A1916] mb-2">Bersihkan Riwayat?</h2>
            <p className="text-sm text-[#A09E97] mb-6 leading-relaxed">
              Apakah kamu yakin ingin menghapus seluruh riwayat transaksi ini? Data yang sudah dihapus tidak bisa dikembalikan.
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

export default History;