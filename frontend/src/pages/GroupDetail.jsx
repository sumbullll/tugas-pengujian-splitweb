import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { QRCodeCanvas } from 'qrcode.react';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import PageTransition from '../components/PageTransition';
import { 
  ArrowLeft, Users, QrCode, X, Receipt, Wallet, Plus, 
  Check, CheckCircle, ExternalLink, Clock, CheckSquare, 
  Banknote, Coins, AlertCircle, Image as ImageIcon, UploadCloud,
  Trash2, LogOut
} from 'lucide-react';
import { useWallet } from '../hooks/useWallet';

const GroupDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const { payViaMetaMask, isProcessing, account } = useWallet(); 
  
  const userStr = localStorage.getItem('user');
  const currentUserId = userStr ? JSON.parse(userStr).id : 0; 

  const [groupData, setGroupData] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showQR, setShowQR] = useState(false);

  const [bills, setBills] = useState([]);
  const [isBillModalOpen, setIsBillModalOpen] = useState(false);
  const [billData, setBillData] = useState({ title: '', amount: '' });
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [isSubmittingBill, setIsSubmittingBill] = useState(false);
  
  const [receiptFile, setReceiptFile] = useState(null);

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedBillDetail, setSelectedBillDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [successTxHash, setSuccessTxHash] = useState('');

  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, title: '', message: '', type: '', data: null, image: null });
  const [actionToast, setActionToast] = useState({ isOpen: false, title: '', message: '', type: '' });
  
  const [transferProofFile, setTransferProofFile] = useState(null);

  const openBillDetail = async (billId) => {
    setIsDetailModalOpen(true);
    setLoadingDetail(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`https://splitweb3-backend.vercel.app/api/bills/${billId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSelectedBillDetail(response.data);
    } catch (error) {
      console.error("Gagal mengambil detail tagihan", error);
    } finally {
      setLoadingDetail(false);
    }
  };

  const openRequestDialog = (splitId, billId) => {
    setTransferProofFile(null); 
    setConfirmDialog({
      isOpen: true,
      title: 'Konfirmasi Transfer',
      message: 'Silakan unggah foto/screenshot bukti transfer (Opsional tapi disarankan).',
      type: 'request',
      image: null,
      data: { splitId, billId } 
    });
  };

  const openApproveDialog = (splitId, billId, buktiTransfer) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Terima Dana Cash?',
      message: 'Pastikan uangnya BENAR-BENAR sudah masuk ke rekening/wallet kamu sebelum menekan tombol setuju.',
      type: 'approve',
      image: buktiTransfer, 
      data: { splitId, billId }
    });
  };

  // 👉 FUNGSI BARU: Buka pop-up kustom untuk hapus/keluar grup
  const handleLeaveOrDelete = () => {
    const isAdmin = groupData.admin_id === currentUserId;
    
    setConfirmDialog({
      isOpen: true,
      title: isAdmin ? 'Hapus Permanen Grup?' : 'Keluar dari Grup?',
      message: isAdmin 
        ? 'Apakah kamu yakin ingin membubarkan grup ini? Seluruh data tagihan dan riwayat di dalamnya akan terhapus permanen dan tidak bisa dikembalikan.' 
        : 'Apakah kamu yakin ingin keluar dari grup ini? Kamu tidak akan bisa lagi melihat tagihan grup ini.',
      type: isAdmin ? 'delete_group' : 'leave_group',
      image: null,
      data: { groupId: id }
    });
  };

  const executeConfirmAction = async () => {
    const { type, data } = confirmDialog;
    if (!data) return;
    
    setConfirmDialog(prev => ({ ...prev, isOpen: false })); 

    // 👉 LOGIKA EKSEKUSI HAPUS/KELUAR GRUP
    if (type === 'delete_group' || type === 'leave_group') {
      try {
        const token = localStorage.getItem('token');
        if (type === 'delete_group') {
          await axios.delete(`https://splitweb3-backend.vercel.app/api/groups/${data.groupId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
        } else {
          await axios.delete(`https://splitweb3-backend.vercel.app/api/groups/${data.groupId}/leave`, {
            headers: { Authorization: `Bearer ${token}` }
          });
        }
        navigate('/dashboard'); 
      } catch (error) {
        console.error("Gagal keluar/hapus grup:", error);
        alert(error.response?.data?.message || "Terjadi kesalahan pada server.");
      }
      return; // Stop eksekusi untuk fungsi ini saja
    }

    const { splitId, billId } = data;

    if (type === 'request') {
      try {
        const token = localStorage.getItem('token');
        const formData = new FormData();
        
        if (transferProofFile) {
            formData.append('bukti_transfer', transferProofFile);
        }

        await axios.post(`https://splitweb3-backend.vercel.app/api/bills/${splitId}/request-confirm`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setActionToast({
          isOpen: true, title: 'Pengajuan Berhasil!', message: 'Tunggu konfirmasi dari penerima dana ya.', type: 'request_success'
        });
        openBillDetail(billId); 
      } catch (error) {
        alert(error.response?.data?.message || "Gagal memproses pengajuan");
      }
    } 
    else if (type === 'approve') {
      try {
        const token = localStorage.getItem('token');
        await axios.post(`https://splitweb3-backend.vercel.app/api/bills/${splitId}/approve`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setActionToast({
          isOpen: true, title: 'Dana Diterima!', message: 'Pembayaran telah disahkan dan hutang dinyatakan LUNAS.', type: 'approve_success'
        });
        openBillDetail(billId); 
      } catch (error) {
        alert(error.response?.data?.message || "Gagal memproses persetujuan");
      }
    }
  };

  const handlePayWithCrypto = async (split, bill) => {
    if (!account) return alert("Koneksikan dompet MetaMask-mu di Topbar terlebih dahulu!");

    const receiver = members.find(m => m.name === bill.payer_name);
    const receiverWallet = receiver?.wallet_address;

    if (!receiverWallet) {
      return alert(`Gagal: ${bill.payer_name} belum menghubungkan dompet MetaMask-nya di aplikasi ini!`);
    }

    if (account.toLowerCase() === receiverWallet.toLowerCase()) {
      return alert("Kamu tidak bisa membayar tagihan ke dompetmu sendiri!\n\nPastikan kamu login menggunakan akun teman yang BERHUTANG, bukan akun yang menalangi.");
    }

    const keterangan = `Bayar: ${bill.title}`;
    const result = await payViaMetaMask(receiverWallet, split.amount, keterangan);

    if (result.success) {
      try {
        const token = localStorage.getItem('token');
        await axios.put(`https://splitweb3-backend.vercel.app/api/bills/split/${split.id}/pay-onchain`, {
          tx_hash: result.hash
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setSuccessTxHash(result.hash);
        setIsSuccessModalOpen(true);
        openBillDetail(bill.id); 
      } catch (error) {
        console.error("Pembayaran crypto berhasil, tapi gagal update database:", error);
        alert("Pembayaran berhasil di blockchain, tapi gagal memperbarui database backend.");
      }
    }
  };

  const fetchGroupDetail = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`https://splitweb3-backend.vercel.app/api/groups/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setGroupData(response.data.group);
      setMembers(response.data.members);
    } catch (error) {
      console.error("Gagal memuat detail grup", error);
      alert("Grup tidak ditemukan!");
      navigate('/dashboard');
    }
  };

  const fetchBills = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`https://splitweb3-backend.vercel.app/api/bills/group/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBills(response.data);
    } catch (error) {
      console.error("Gagal memuat tagihan grup", error);
    }
  };

  useEffect(() => {
    const loadAllData = async () => {
      setLoading(true);
      await fetchGroupDetail();
      await fetchBills();
      setLoading(false);
    };
    loadAllData();
  }, [id, navigate]);

  useEffect(() => {
    if (isBillModalOpen) {
      setSelectedMembers(members.map(m => m.id));
      setReceiptFile(null); 
    }
  }, [isBillModalOpen, members]);

  const toggleMember = (memberId) => {
    setSelectedMembers(prev => 
      prev.includes(memberId) ? prev.filter(id => id !== memberId) : [...prev, memberId]
    );
  };

  const handleCreateBill = async (e) => {
    e.preventDefault();
    if (!billData.title || !billData.amount) return alert("Judul dan Nominal wajib diisi!");
    if (selectedMembers.length === 0) return alert("Pilih minimal 1 orang untuk patungan!");

    setIsSubmittingBill(true);
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('group_id', id);
      formData.append('title', billData.title);
      formData.append('amount', parseInt(billData.amount, 10));
      formData.append('split_members', JSON.stringify(selectedMembers)); 
      
      if (receiptFile) {
          formData.append('struk_foto', receiptFile);
      }

      await axios.post('https://splitweb3-backend.vercel.app/api/bills', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setBillData({ title: '', amount: '' });
      setReceiptFile(null);
      setIsBillModalOpen(false);
      fetchBills(); 
    } catch (error) {
      console.error("Gagal membuat tagihan:", error);
      alert("Terjadi kesalahan saat membuat tagihan.");
    } finally {
      setIsSubmittingBill(false);
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center bg-[#FAFAF9] text-[#C9A84C] font-bold">Memuat data grup...</div>;

  const inviteLink = `http://localhost:5173/join/${groupData.id}`;

  return (
    <div className="flex h-screen bg-[#FAFAF9] overflow-hidden font-sans relative">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <div className="flex-1 flex flex-col h-screen overflow-hidden md:ml-72 relative z-0">
        <Topbar onMenuClick={() => setIsSidebarOpen(true)} />

        <main className="flex-1 overflow-y-auto p-4 md:p-8 relative z-10 pb-24">
          <PageTransition key="detail">
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <div className="flex items-center gap-4">
                <button onClick={() => navigate('/groups')} className="p-2 bg-white border border-[#E8E6E0] rounded-xl hover:bg-gray-50 transition-colors">
                  <ArrowLeft size={20} className="text-[#1A1916]" />
                </button>
                <div>
                  <h1 className="text-2xl md:text-3xl font-black text-[#1A1916]">{groupData.name}</h1>
                  <p className="text-sm text-[#A09E97] mt-1">{groupData.description || 'Grup Patungan SplitWeb3'}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button 
                  onClick={handleLeaveOrDelete}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 bg-red-50 text-red-600 border border-red-100 rounded-xl font-bold text-sm hover:bg-red-500 hover:text-white transition-colors shadow-sm"
                  title={groupData.admin_id === currentUserId ? "Hapus Permanen Grup Ini" : "Keluar dari Grup"}
                >
                  {groupData.admin_id === currentUserId ? <Trash2 size={18} /> : <LogOut size={18} />} 
                  <span className="hidden sm:inline">{groupData.admin_id === currentUserId ? 'Hapus Grup' : 'Keluar'}</span>
                </button>

                <button 
                  onClick={() => setShowQR(true)}
                  className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#1A1916] text-white rounded-xl font-bold text-sm hover:bg-[#C9A84C] transition-colors shadow-lg"
                >
                  <QrCode size={18} /> Undang Teman
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1 space-y-6">
                <div className="bg-white rounded-[1.5rem] border border-[#E8E6E0] p-6 shadow-sm">
                  <h3 className="text-lg font-bold text-[#1A1916] mb-4 flex items-center gap-2">
                    <Users size={20} className="text-[#C9A84C]" /> Anggota ({members.length})
                  </h3>
                  
                  <div className="space-y-3">
                    {members.map((member) => (
                      <div key={member.id} className="flex items-center gap-3 p-3 bg-[#FAFAF9] rounded-xl border border-[#E8E6E0]">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#C9A84C] to-[#E8C96A] flex items-center justify-center text-white font-bold text-lg shadow-inner">
                          {member.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 overflow-hidden">
                          <p className="font-bold text-sm text-[#1A1916] truncate">
                            {member.name} 
                            {member.id === groupData.admin_id && <span className="ml-2 text-[10px] bg-amber-100 text-amber-600 px-2 py-0.5 rounded uppercase">Admin</span>}
                          </p>
                          <p className="text-xs text-[#A09E97] truncate flex items-center gap-1">
                            <Wallet size={12}/> {member.wallet_address ? `${member.wallet_address.substring(0,6)}...${member.wallet_address.substring(38)}` : 'Belum Konek Wallet'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-[1.5rem] border border-[#E8E6E0] p-6 shadow-sm min-h-[400px] flex flex-col">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-[#1A1916] flex items-center gap-2">
                      <Receipt size={20} className="text-[#C9A84C]" /> Tagihan Grup
                    </h3>
                    <button 
                      onClick={() => setIsBillModalOpen(true)}
                      className="flex items-center gap-2 text-sm font-bold text-[#1A1916] bg-[#FBF5E6] hover:bg-[#E8C96A] px-4 py-2 rounded-xl transition-colors shadow-sm cursor-pointer z-20 relative"
                    >
                      <Plus size={16}/> Buat Tagihan
                    </button>
                  </div>
                  
                  {bills.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-[#E8E6E0] rounded-2xl bg-[#FAFAF9]/50 p-8 text-center">
                      <Receipt className="w-12 h-12 text-[#A09E97] mb-3 opacity-50" />
                      <p className="text-[#A09E97] font-medium mb-4">Belum ada tagihan di grup ini.</p>
                      <button 
                        onClick={() => setIsBillModalOpen(true)}
                        className="px-5 py-2.5 bg-[#1A1916] text-white rounded-xl text-sm font-bold hover:bg-[#C9A84C] transition-colors"
                      >
                        + Catat Pengeluaran Pertama
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {bills.map((bill) => (
                        <div 
                            key={bill.id} 
                            onClick={() => openBillDetail(bill.id)}
                            className="p-5 border border-[#E8E6E0] rounded-2xl hover:border-[#C9A84C] transition-all bg-[#FAFAF9] group cursor-pointer flex justify-between items-center relative overflow-hidden"
                        >
                          {bill.struk_foto && (
                              <div className="absolute top-0 right-0 bg-[#C9A84C] text-white p-1.5 rounded-bl-xl shadow-sm" title="Ada Foto Struk">
                                  <ImageIcon size={14} />
                              </div>
                          )}

                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-white rounded-xl border border-[#E8E6E0] flex items-center justify-center text-[#C9A84C] shadow-sm group-hover:scale-110 transition-transform">
                              <Receipt size={24} />
                            </div>
                            <div>
                              <h4 className="font-extrabold text-[#1A1916] text-lg group-hover:text-[#8B6914]">{bill.title}</h4>
                              <p className="text-xs text-[#A09E97] mt-1">
                                Ditambahkan pada {new Date(bill.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xs font-bold text-[#A09E97] uppercase tracking-wider mb-1">Total</p>
                            <h3 className="text-xl font-black text-[#1A1916]">
                              Rp {parseInt(bill.amount).toLocaleString('id-ID')}
                            </h3>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </PageTransition>
        </main>
      </div>

      {/* ================= MODAL QR CODE ================= */}
      {showQR && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowQR(false)}></div>
          <div className="bg-white rounded-[2rem] p-8 relative z-10 shadow-2xl animate-appear max-w-sm w-full text-center">
            <button onClick={() => setShowQR(false)} className="absolute top-4 right-4 text-[#A09E97] hover:text-[#1A1916] p-2 bg-gray-100 rounded-full transition-colors"><X size={20} /></button>
            <h2 className="text-xl font-black text-[#1A1916] mb-2">Scan untuk Bergabung!</h2>
            <p className="text-sm text-[#A09E97] mb-6">Suruh temanmu scan QR ini untuk masuk ke grup <b>{groupData.name}</b></p>
            <div className="flex justify-center p-4 bg-white border-2 border-[#E8E6E0] rounded-2xl mb-6 shadow-sm">
              <QRCodeCanvas value={inviteLink} size={200} fgColor="#1A1916" />
            </div>
            <button onClick={() => { navigator.clipboard.writeText(inviteLink); alert("Link disalin!"); }} className="w-full py-3 rounded-xl font-bold text-sm text-[#1A1916] bg-[#FAFAF9] border border-[#E8E6E0] hover:bg-gray-100 transition-colors">
              Copy Link Invitation
            </button>
          </div>
        </div>
      )}

      {/* ================= MODAL BUAT TAGIHAN ================= */}
      {isBillModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsBillModalOpen(false)}></div>
          <div className="bg-white w-full max-w-md rounded-[2rem] p-6 md:p-8 relative z-10 shadow-2xl animate-appear max-h-[90vh] flex flex-col">
            
            <button onClick={() => setIsBillModalOpen(false)} className="absolute top-6 right-6 text-[#A09E97] hover:text-[#1A1916] p-2 rounded-full hover:bg-gray-100 transition-colors">
              <X size={20} />
            </button>
            <h2 className="text-2xl font-black text-[#1A1916] mb-2">Buat Tagihan</h2>
            <p className="text-sm text-[#A09E97] mb-6">Catat pengeluaran dan aplikasi akan membaginya otomatis ke anggota yang dipilih.</p>
            
            <form onSubmit={handleCreateBill} className="flex flex-col gap-5 overflow-y-auto pr-2 custom-scrollbar">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-[#A09E97] uppercase tracking-wider ml-1">Untuk Beli Apa?</label>
                <input 
                  type="text" 
                  value={billData.title}
                  onChange={(e) => setBillData({ ...billData, title: e.target.value })}
                  placeholder="Contoh: Makan Malam KFC, Tiket Masuk..." 
                  className="w-full px-4 py-3.5 bg-[#FAFAF9] border border-[#E8E6E0] rounded-xl text-sm text-[#1A1916] outline-none focus:ring-2 focus:ring-[#C9A84C]/50 focus:border-[#C9A84C] transition-all"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-[#A09E97] uppercase tracking-wider ml-1">Total Harga (Rupiah)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="text-[#A09E97] font-bold">Rp</span>
                  </div>
                  <input 
                    type="text" 
                    value={billData.amount ? parseInt(billData.amount, 10).toLocaleString('id-ID') : ''}
                    onChange={(e) => {
                      const rawValue = e.target.value.replace(/[^0-9]/g, ''); 
                      setBillData({ ...billData, amount: rawValue });
                    }}
                    placeholder="100.000" 
                    className="w-full pl-12 pr-4 py-3.5 bg-[#FAFAF9] border border-[#E8E6E0] rounded-xl text-sm text-[#1A1916] font-bold outline-none focus:ring-2 focus:ring-[#C9A84C]/50 focus:border-[#C9A84C] transition-all"
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-[#A09E97] uppercase tracking-wider ml-1">Foto Struk (Opsional)</label>
                <label className="w-full flex items-center gap-3 px-4 py-3.5 bg-[#FAFAF9] border border-[#E8E6E0] rounded-xl text-sm text-[#A09E97] cursor-pointer hover:bg-gray-50 transition-colors border-dashed">
                  <UploadCloud size={18} className="text-[#C9A84C]" />
                  <span className="flex-1 truncate">{receiptFile ? receiptFile.name : 'Upload gambar struk/nota...'}</span>
                  <input 
                    type="file" 
                    accept="image/*"
                    className="hidden" 
                    onChange={(e) => setReceiptFile(e.target.files[0])}
                  />
                </label>
              </div>

              <div className="flex flex-col gap-2 mt-2">
                <div className="flex items-center justify-between ml-1">
                  <label className="text-[11px] font-bold text-[#A09E97] uppercase tracking-wider">Patungan Sama Siapa?</label>
                  <span className="text-[11px] font-bold text-[#C9A84C] bg-[#FBF5E6] px-2 py-0.5 rounded-md">
                    {selectedMembers.length} Terpilih
                  </span>
                </div>
                
                <div className="border border-[#E8E6E0] rounded-xl overflow-hidden bg-[#FAFAF9] max-h-40 overflow-y-auto">
                  {members.map(member => (
                    <div 
                      key={member.id}
                      onClick={() => toggleMember(member.id)}
                      className="flex items-center justify-between p-3 border-b border-[#E8E6E0] last:border-b-0 cursor-pointer hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#C9A84C] to-[#E8C96A] flex items-center justify-center text-white font-bold text-xs">
                          {member.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm font-bold text-[#1A1916]">{member.name}</span>
                      </div>
                      <div className={`w-5 h-5 rounded flex items-center justify-center transition-colors ${selectedMembers.includes(member.id) ? 'bg-[#1A1916] text-white' : 'border-2 border-[#A09E97] bg-white'}`}>
                        {selectedMembers.includes(member.id) && <Check size={14} strokeWidth={4} />}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 mt-4 pt-4 border-t border-[#E8E6E0]">
                <button type="button" onClick={() => setIsBillModalOpen(false)} className="flex-1 py-3.5 rounded-xl font-bold text-sm text-[#1A1916] bg-[#FAFAF9] border border-[#E8E6E0] hover:bg-gray-100 transition-colors">
                  Batal
                </button>
                <button type="submit" disabled={isSubmittingBill} className={`flex-1 py-3.5 rounded-xl font-bold text-sm text-[#1A1916] bg-gradient-to-r from-[#C9A84C] to-[#E8C96A] hover:opacity-90 shadow-lg shadow-[#C9A84C]/20 transition-all ${isSubmittingBill ? 'opacity-70 cursor-not-allowed' : ''}`}>
                  {isSubmittingBill ? 'Memproses...' : 'Split Bill!'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL DETAIL RINCIAN TAGIHAN ================= */}
      {isDetailModalOpen && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsDetailModalOpen(false)}></div>
          <div className="bg-white w-full max-w-md rounded-[2rem] p-6 md:p-8 relative z-10 shadow-2xl animate-appear flex flex-col max-h-[90vh]">
            
            <button onClick={() => setIsDetailModalOpen(false)} className="absolute top-6 right-6 text-[#A09E97] hover:text-[#1A1916] p-2 rounded-full hover:bg-gray-100 transition-colors z-20">
              <X size={20} />
            </button>
            
            {loadingDetail || !selectedBillDetail ? (
              <div className="text-center py-10 font-bold text-[#C9A84C]">Memuat Rincian...</div>
            ) : (
              <div className="overflow-y-auto pr-2 custom-scrollbar">
                <div className="mb-6 pr-8">
                  <h2 className="text-2xl font-black text-[#1A1916]">{selectedBillDetail.bill.title}</h2>
                  <p className="text-sm text-[#A09E97] mt-1">Ditalangi oleh <b className="text-[#1A1916]">{selectedBillDetail.bill.payer_name}</b></p>
                </div>
                
                {selectedBillDetail.bill.struk_foto && (
                    <div className="mb-6 rounded-2xl overflow-hidden border border-[#E8E6E0] shadow-sm relative group">
                        <div className="absolute top-2 left-2 bg-black/50 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded-lg flex items-center gap-1 z-10">
                            <ImageIcon size={12}/> Foto Struk
                        </div>
                        <img 
                            src={`https://splitweb3-backend.vercel.app/uploads/${selectedBillDetail.bill.struk_foto}`} 
                            alt="Struk Tagihan" 
                            className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-500"
                            onClick={() => window.open(`https://splitweb3-backend.vercel.app/uploads/${selectedBillDetail.bill.struk_foto}`, '_blank')}
                            style={{ cursor: 'zoom-in' }}
                        />
                    </div>
                )}

                <div className="bg-[#FAFAF9] rounded-2xl p-5 border border-[#E8E6E0] mb-6 flex justify-between items-center shadow-inner">
                  <span className="text-sm font-bold text-[#A09E97] uppercase tracking-wider">Total Tagihan</span>
                  <span className="text-2xl font-black text-[#1A1916]">Rp {parseInt(selectedBillDetail.bill.amount).toLocaleString('id-ID')}</span>
                </div>

                <h3 className="text-[11px] font-bold text-[#A09E97] uppercase tracking-wider mb-3 ml-1">Rincian Patungan:</h3>
                
                <div className="space-y-3">
                  {selectedBillDetail.splits.map(split => (
                    <div key={split.id} className="flex flex-col p-3 bg-white border border-[#E8E6E0] rounded-xl gap-3">
                      
                      <div className="flex justify-between items-center flex-wrap gap-2">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-[#FAFAF9] border border-[#E8E6E0] flex items-center justify-center text-[#1A1916] font-bold text-xs">
                              {split.user_name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-bold text-sm text-[#1A1916]">{split.user_name}</p>
                              <p className="text-xs font-black text-[#1A1916]">
                                Rp {parseInt(split.amount).toLocaleString('id-ID')}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            {split.is_paid || split.status === 'PAID' ? (
                              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100">LUNAS</span>
                            ) : split.status === 'PENDING' ? (
                                (currentUserId && Number(currentUserId) === Number(selectedBillDetail.bill.payer_id)) ? (
                                    <button 
                                        onClick={() => openApproveDialog(split.id, selectedBillDetail.bill.id, split.bukti_transfer)}
                                        className="flex items-center gap-1 text-[10px] font-bold text-white bg-emerald-500 hover:bg-emerald-600 px-3 py-1.5 rounded-lg shadow-sm transition-colors animate-pulse"
                                        title="Terima Pembayaran"
                                    >
                                        <CheckSquare size={12} /> Terima Dana
                                    </button>
                                ) : (
                                    <span className="flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg">
                                        <Clock size={12} /> Menunggu Konfirmasi
                                    </span>
                                )
                            ) : (
                              <div className="flex items-center gap-1.5">
                                <button 
                                    onClick={() => openRequestDialog(split.id, selectedBillDetail.bill.id)}
                                    className="text-[10px] font-bold text-[#A09E97] bg-white border border-[#E8E6E0] hover:bg-gray-50 hover:text-[#1A1916] px-2 py-1.5 rounded-lg transition-colors shadow-sm"
                                >
                                    Cash / TF
                                </button>
                                <button 
                                    onClick={() => handlePayWithCrypto(split, selectedBillDetail.bill)}
                                    disabled={isProcessing}
                                    className="flex items-center gap-1.5 text-[10px] font-bold text-[#1A1916] bg-gradient-to-r from-[#C9A84C] to-[#E8C96A] hover:opacity-90 px-3 py-1.5 rounded-lg transition-all shadow-sm shadow-[#C9A84C]/20 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Wallet size={12} />
                                    {isProcessing ? 'Proses...' : 'Bayar ETH'}
                                </button>
                              </div>
                            )}
                          </div>
                      </div>

                      {/* 👉 TAMPILKAN BUKTI TRANSFER DI RINCIAN JIKA ADA */}
                      {split.bukti_transfer && (
                          <div className="mt-1 pt-3 border-t border-[#E8E6E0] flex justify-between items-center bg-gray-50/50 -mx-3 -mb-3 p-3 rounded-b-xl">
                              <span className="text-[10px] font-bold text-[#A09E97] uppercase flex items-center gap-1">
                                  <ImageIcon size={12}/> Bukti Transfer Dikirim
                              </span>
                              <a 
                                  href={`https://splitweb3-backend.vercel.app/uploads/${split.bukti_transfer}`} 
                                  target="_blank" rel="noopener noreferrer"
                                  className="text-[10px] font-bold text-[#C9A84C] hover:text-[#8B6914] bg-[#FBF5E6] px-2 py-1 rounded transition-colors flex items-center gap-1"
                              >
                                  Lihat Foto Penuh <ExternalLink size={10}/>
                              </a>
                          </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 👉 MODAL CUSTOM CONFIRMATION UNTUK SEMUA AKSI */}
      {confirmDialog.isOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setConfirmDialog({ isOpen: false })}></div>
          <div className="bg-white w-full max-w-sm rounded-[2rem] p-6 relative z-10 shadow-2xl animate-appear text-center">
            
            {/* 👉 WARNA ICON DINAMIS BERDASARKAN TIPE AKSI */}
            <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4 ${
              confirmDialog.type === 'approve' ? 'bg-emerald-50 text-emerald-500' : 
              (confirmDialog.type === 'delete_group' || confirmDialog.type === 'leave_group') ? 'bg-red-50 text-red-500' :
              'bg-amber-50 text-amber-500'
            }`}>
              {confirmDialog.type === 'approve' ? <Banknote size={32} /> : 
               (confirmDialog.type === 'delete_group' || confirmDialog.type === 'leave_group') ? (confirmDialog.type === 'delete_group' ? <Trash2 size={32} /> : <LogOut size={32} />) : 
               <AlertCircle size={32} />}
            </div>
            
            <h2 className="text-xl font-black text-[#1A1916] mb-2">{confirmDialog.title}</h2>
            <p className="text-sm text-[#A09E97] mb-6 leading-relaxed">{confirmDialog.message}</p>
            
            {/* TAMPILAN PREVIEW FOTO ATAU PESAN FALLBACK UNTUK ADMIN */}
            {confirmDialog.type === 'approve' && (
                confirmDialog.image ? (
                    <div className="mb-6 rounded-xl overflow-hidden border border-[#E8E6E0] shadow-sm">
                        <div className="bg-gray-100 py-2 text-[10px] font-bold text-[#A09E97] uppercase tracking-wider text-center border-b border-[#E8E6E0]">
                            Bukti Transfer dari Temanmu
                        </div>
                        <img 
                            src={`https://splitweb3-backend.vercel.app/uploads/${confirmDialog.image}`} 
                            alt="Bukti Transfer" 
                            className="w-full max-h-48 object-contain bg-gray-50"
                            onClick={() => window.open(`https://splitweb3-backend.vercel.app/uploads/${confirmDialog.image}`, '_blank')}
                            style={{ cursor: 'zoom-in' }}
                        />
                    </div>
                ) : (
                    <div className="mb-6 p-4 rounded-xl bg-gray-50 border border-dashed border-[#E8E6E0] text-center">
                        <ImageIcon size={24} className="text-[#A09E97] mx-auto mb-2 opacity-50" />
                        <p className="text-xs font-medium text-[#A09E97]">Temanmu tidak melampirkan foto bukti transfer.</p>
                    </div>
                )
            )}
            
            {/* INPUT UPLOAD FOTO UNTUK PENGUTANG */}
            {confirmDialog.type === 'request' && (
                <div className="mb-8 text-left">
                    <label className="w-full flex flex-col items-center justify-center gap-2 p-4 bg-[#FAFAF9] border-2 border-dashed border-[#E8E6E0] rounded-xl text-sm text-[#A09E97] cursor-pointer hover:bg-gray-50 hover:border-[#C9A84C] transition-all">
                        <UploadCloud size={24} className="text-[#C9A84C]" />
                        <span className="text-xs text-center font-medium px-2 truncate w-full">
                            {transferProofFile ? transferProofFile.name : 'Klik untuk upload bukti transfer'}
                        </span>
                        <input 
                            type="file" 
                            accept="image/*"
                            className="hidden" 
                            onChange={(e) => setTransferProofFile(e.target.files[0])}
                        />
                    </label>
                </div>
            )}
            
            <div className="flex gap-3">
              <button 
                onClick={() => setConfirmDialog({ isOpen: false })}
                className="flex-1 py-3 rounded-xl font-bold text-sm text-[#1A1916] bg-[#FAFAF9] border border-[#E8E6E0] hover:bg-gray-100 transition-colors"
              >
                Batal
              </button>
              {/* 👉 WARNA TOMBOL DINAMIS */}
              <button 
                onClick={executeConfirmAction}
                className={`flex-1 py-3 rounded-xl font-bold text-sm text-white shadow-lg transition-all hover:opacity-90 ${
                  confirmDialog.type === 'approve' ? 'bg-emerald-500 shadow-emerald-500/20' : 
                  (confirmDialog.type === 'delete_group' || confirmDialog.type === 'leave_group') ? 'bg-red-500 shadow-red-500/20' : 
                  'bg-[#1A1916] shadow-black/20'
                }`}
              >
                {confirmDialog.type === 'delete_group' ? 'Ya, Hapus Grup' : confirmDialog.type === 'leave_group' ? 'Ya, Keluar' : 'Ya, Lanjutkan'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 👉 MODAL SUCCESS ANIMATION */}
      {actionToast.isOpen && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setActionToast({ isOpen: false })}></div>
          <div className="bg-white w-full max-w-sm rounded-[2rem] p-8 relative z-10 shadow-2xl animate-appear text-center flex flex-col items-center">
            
            {actionToast.type === 'approve_success' ? (
              <div className="relative w-24 h-24 mb-6">
                <div className="absolute inset-0 bg-emerald-100 rounded-full animate-ping opacity-50"></div>
                <div className="relative w-full h-full bg-emerald-50 rounded-full flex items-center justify-center border-4 border-emerald-100 shadow-inner overflow-hidden">
                  <Wallet size={40} className="text-emerald-500 relative z-10 mt-4" />
                  <Coins size={28} className="text-yellow-400 absolute top-2 animate-bounce drop-shadow-md" />
                </div>
              </div>
            ) : (
              <div className="w-20 h-20 rounded-full bg-amber-50 flex items-center justify-center mb-6 border border-amber-100 shadow-inner">
                <CheckCircle size={40} className="text-amber-500" />
              </div>
            )}
            
            <h2 className="text-2xl font-black text-[#1A1916] mb-2">{actionToast.title}</h2>
            <p className="text-sm text-[#A09E97] mb-8">{actionToast.message}</p>

            <button 
              onClick={() => setActionToast({ isOpen: false })}
              className="w-full py-3.5 rounded-xl font-bold text-sm text-[#1A1916] bg-[#FBF5E6] hover:bg-[#E8C96A] border border-[#C9A84C]/30 transition-colors shadow-sm"
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      {/* ================= MODAL SUKSES TRANSAKSI WEB3 ================= */}
      {isSuccessModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsSuccessModalOpen(false)}></div>
          <div className="bg-white w-full max-w-sm rounded-[2rem] p-8 relative z-10 shadow-2xl animate-appear text-center flex flex-col items-center">
            
            <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center mb-6 border border-emerald-100 shadow-inner">
              <CheckCircle size={40} className="text-emerald-500" />
            </div>
            
            <h2 className="text-2xl font-black text-[#1A1916] mb-2">Pembayaran Berhasil!</h2>
            <p className="text-sm text-[#A09E97] mb-6">Uang patunganmu telah dikirim dengan aman melalui jaringan Ethereum (Sepolia).</p>

            <div className="w-full bg-[#FAFAF9] border border-[#E8E6E0] rounded-xl p-4 mb-6 text-left shadow-sm">
              <p className="text-[10px] font-bold text-[#A09E97] uppercase tracking-wider mb-1">Transaction Hash</p>
              <p className="text-xs font-mono text-[#1A1916] break-all">{successTxHash}</p>
              
              <a 
                href={`https://sepolia.etherscan.io/tx/${successTxHash}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs font-bold text-[#C9A84C] mt-3 hover:text-[#8B6914] transition-colors w-fit"
              >
                <ExternalLink size={14} /> Lihat di Etherscan
              </a>
            </div>

            <button 
              onClick={() => setIsSuccessModalOpen(false)}
              className="w-full py-3.5 rounded-xl font-bold text-sm text-[#1A1916] bg-[#FBF5E6] hover:bg-[#E8C96A] border border-[#C9A84C]/30 transition-colors shadow-sm"
            >
              Tutup & Kembali
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupDetail;