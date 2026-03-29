import { createContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [walletAddress, setWalletAddress] = useState(null);

  // Fungsi Login
  const login = (userData, userToken) => {
    setUser(userData);
    setToken(userToken);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', userToken);
  };

  // Fungsi Logout
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  // Fungsi Connect MetaMask
  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setWalletAddress(accounts[0]);
        return accounts[0];
      } catch (error) {
        console.error("User menolak koneksi wallet");
      }
    } else {
      alert("Silakan install MetaMask!");
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, walletAddress, login, logout, connectWallet }}>
      {children}
    </AuthContext.Provider>
  );
};