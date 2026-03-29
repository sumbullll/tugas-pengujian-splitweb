import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { ethers } from 'ethers';

export const Web3Context = createContext();

export const Web3Provider = ({ children }) => {
  const [account, setAccount] = useState(null);
  const [balance, setBalance] = useState("0.0000");
  const [isConnecting, setIsConnecting] = useState(false);

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
        // 👉 INI KUNCINYA: Paksa MetaMask memunculkan popup izin lagi
        await window.ethereum.request({
          method: 'wallet_requestPermissions',
          params: [{ eth_accounts: {} }]
        });

        // Setelah user memilih dan menyetujui di popup, ambil akunnya
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const walletAddress = accounts[0];
        
        setAccount(walletAddress);
        await fetchBalance(walletAddress);

        // KUNCI AUTO-CONNECT: Pasang bendera global
        localStorage.setItem('isWalletConnected', 'true');

        const token = localStorage.getItem('token');
        if (token) {
          await axios.put('http://127.0.0.1:5000/api/auth/update-wallet', 
            { wallet_address: walletAddress }, 
            { headers: { Authorization: `Bearer ${token}` } }
          );
        }
      } catch (error) {
        // Jika user sengaja menutup popup tanpa memilih
        if (error.code === 4001) {
          console.log("Koneksi dibatalkan oleh user.");
        } else {
          console.error("Gagal connect wallet:", error);
        }
      } finally {
        setIsConnecting(false);
      }
    } else {
      alert("Kamu belum menginstal ekstensi MetaMask!");
    }
  };

  // ==========================================
  // FUNGSI 3: DISCONNECT WALLET
  // ==========================================
  const disconnectWallet = () => {
    setAccount(null);
    setBalance("0.0000");
    localStorage.removeItem('isWalletConnected'); // Cabut bendera agar tidak auto-connect
  };

  // ==========================================
  // FUNGSI 4: AUTO-CONNECT (DIAM-DIAM, TANPA POPUP)
  // ==========================================
  useEffect(() => {
    const checkConnection = async () => {
      // Hanya berjalan jika bendera isWalletConnected masih 'true'
      if (typeof window.ethereum !== 'undefined' && localStorage.getItem('isWalletConnected') === 'true') {
        try {
          // Gunakan eth_accounts (mengambil akun diam-diam tanpa memicu popup)
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

    // Listener jika user mengganti akun langsung dari ekstensi MetaMask
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
    </Web3Context.Provider>
  );
};