import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { ethers } from 'ethers';
import { X, Smartphone, Monitor, Download, ExternalLink } from 'lucide-react';

export const Web3Context = createContext();

export const Web3Provider = ({ children }) => {
  const [account, setAccount] = useState(null);
  const [balance, setBalance] = useState("0.0000");
  const [isConnecting, setIsConnecting] = useState(false);
  
  // 👉 STATE BARU: Untuk menampilkan Pop-up "Belum ada MetaMask"
  const [showNoProviderModal, setShowNoProviderModal] = useState(false);
  const [isMobileDevice, setIsMobileDevice] = useState(false);

  // Deteksi otomatis apakah user pakai HP atau Laptop saat web pertama dimuat
  useEffect(() => {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    setIsMobileDevice(isMobile);
  }, []);

  // ==========================================
  // FUNGSI 1: AMBIL SALDO ETH
  // ==========================================
  const fetchBalance = async (walletAddress) => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const balanceWei = await provider.getBalance(walletAddress);
      const balanceEth = ethers.formatEther(balanceWei);
      setBalance(parseFloat(balanceEth).toFixed(4));
    } catch (error) {
      console.error("Gagal mengambil saldo:", error);
    }
  };

  // ==========================================
  // FUNGSI 2: CONNECT WALLET (KLIK MANUAL = WAJIB POPUP)
  // ==========================================
  const connectWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
      setIsConnecting(true);
      try {
        await window.ethereum.request({
          method: 'wallet_requestPermissions',
          params: [{ eth_accounts: {} }]
        });

        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const walletAddress = accounts[0];
        
        setAccount(walletAddress);
        await fetchBalance(walletAddress);

        localStorage.setItem('isWalletConnected', 'true');

        const token = localStorage.getItem('token');
        if (token) {
          await axios.put('https://splitweb3-backend.vercel.app/api/auth/update-wallet', 
            { wallet_address: walletAddress }, 
            { headers: { Authorization: `Bearer ${token}` } }
          );
        }
      } catch (error) {
        if (error.code === 4001) {
          console.log("Koneksi dibatalkan oleh user.");
        } else {
          console.error("Gagal connect wallet:", error);
        }
      } finally {
        setIsConnecting(false);
      }
    } else {
      // 👉 ALERT DIGANTI JADI POPUP CANTIK
      setShowNoProviderModal(true);
    }
  };

  // ==========================================
  // FUNGSI 3: DISCONNECT WALLET
  // ==========================================
  const disconnectWallet = () => {
    setAccount(null);
    setBalance("0.0000");
    localStorage.removeItem('isWalletConnected'); 
  };

  // ==========================================
  // FUNGSI 4: AUTO-CONNECT (DIAM-DIAM, TANPA POPUP)
  // ==========================================
  useEffect(() => {
    const checkConnection = async () => {
      if (typeof window.ethereum !== 'undefined' && localStorage.getItem('isWalletConnected') === 'true') {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts && accounts.length > 0) {
            setAccount(accounts[0]);
            await fetchBalance(accounts[0]);
          } else {
            disconnectWallet();
          }
        } catch (error) {
          console.error("Gagal auto-reconnect", error);
        }
      }
    };

    checkConnection();

    if (typeof window.ethereum !== 'undefined') {
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length > 0 && localStorage.getItem('isWalletConnected') === 'true') {
          setAccount(accounts[0]);
          fetchBalance(accounts[0]);
        } else {
          disconnectWallet();
        }
      });
    }
  }, []);

  return (
    <Web3Context.Provider value={{ account, balance, connectWallet, disconnectWallet, isConnecting }}>
      {children}

      {/* ========================================================== */}
      {/* MODAL KUSTOM: DETEKSI METAMASK (HP VS LAPTOP)              */}
      {/* ========================================================== */}
      {showNoProviderModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
            onClick={() => setShowNoProviderModal(false)}
          ></div>
          
          <div className="bg-white w-full max-w-sm rounded-[2rem] p-8 relative z-10 shadow-[0_20px_60px_rgba(0,0,0,0.2)] animate-appear flex flex-col items-center text-center border border-white">
            <button 
              onClick={() => setShowNoProviderModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-800 p-2 rounded-full hover:bg-slate-100 transition-colors"
            >
              <X size={20} />
            </button>
            
            {/* Ikon Berdasarkan Perangkat */}
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#F6851B]/20 to-[#E2761B]/10 flex items-center justify-center mb-6 border border-[#F6851B]/30 shadow-[0_0_20px_rgba(246,133,27,0.15)] relative">
              <div className="absolute inset-0 bg-[#F6851B] blur-xl opacity-20 rounded-full"></div>
              {isMobileDevice ? (
                <Smartphone size={36} className="text-[#F6851B] relative z-10" />
              ) : (
                <Monitor size={36} className="text-[#F6851B] relative z-10" />
              )}
            </div>
            
            <h2 className="text-2xl font-black text-[#0F172A] mb-2 tracking-tight">
              MetaMask Tidak Ditemukan!
            </h2>
            
            {/* Teks Berdasarkan Perangkat */}
            <p className="text-sm text-slate-500 mb-8 font-medium px-2">
              {isMobileDevice 
                ? "Untuk terhubung di HP, kamu harus membuka website ini melalui browser internal di dalam aplikasi MetaMask." 
                : "Kamu perlu menginstal ekstensi browser MetaMask untuk menyambungkan dompet kripto di PC/Laptop."}
            </p>

            {/* Tombol Aksi Berdasarkan Perangkat */}
            {isMobileDevice ? (
              <a 
                href={`https://metamask.app.link/dapp/${window.location.host}`}
                target="_blank" rel="noopener noreferrer"
                className="w-full py-4 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-[#F6851B] to-[#E2761B] shadow-[0_8px_20px_rgba(246,133,27,0.3)] hover:shadow-[0_8px_25px_rgba(246,133,27,0.4)] hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 mb-3"
              >
                Buka di Aplikasi MetaMask <ExternalLink size={16} />
              </a>
            ) : (
              <a 
                href="https://metamask.io/download/" 
                target="_blank" rel="noopener noreferrer"
                className="w-full py-4 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-[#F6851B] to-[#E2761B] shadow-[0_8px_20px_rgba(246,133,27,0.3)] hover:shadow-[0_8px_25px_rgba(246,133,27,0.4)] hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 mb-3"
              >
                <Download size={18} /> Instal Ekstensi MetaMask
              </a>
            )}
            
            <button 
              onClick={() => setShowNoProviderModal(false)}
              className="w-full py-3.5 rounded-xl font-bold text-sm text-slate-600 bg-transparent hover:bg-slate-50 transition-colors"
            >
              Nanti Saja
            </button>
          </div>
        </div>
      )}
    </Web3Context.Provider>
  );
};