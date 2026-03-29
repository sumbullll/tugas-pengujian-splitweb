import { useState, useContext } from 'react';
import { ethers } from 'ethers';
import { Web3Context } from '../context/Web3Context';
import { CONTRACT_ADDRESS } from '../contracts/address';

// 👉 HAPUS import JSON yang bermasalah
// import SplitWeb3ABI from '../contracts/SplitWeb3.json';

export const useWallet = () => {
  const { account, balance } = useContext(Web3Context);
  const [isProcessing, setIsProcessing] = useState(false);

  const payViaMetaMask = async (receiverAddress, amountInIDR, keterangan) => {
    if (!window.ethereum) {
      alert("Silakan install MetaMask!");
      return { success: false };
    }

    if (!receiverAddress) {
      alert("Alamat dompet tujuan kosong!");
      return { success: false };
    }

    setIsProcessing(true);
    
    try {
      // 1. Validasi & Format Alamat (Checksum)
      const safeReceiver = ethers.getAddress(receiverAddress.trim());

      if (safeReceiver.toLowerCase() === account.toLowerCase()) {
        alert("Kamu tidak bisa membayar ke dompetmu sendiri!");
        setIsProcessing(false);
        return { success: false };
      }

      // 2. Ambil Kurs ETH/IDR Real-time dari CoinGecko
      const priceRes = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=idr');
      const priceData = await priceRes.json();
      const ethPriceIdr = priceData.ethereum.idr;

      // 3. Konversi Rupiah ke Wei (BigInt)
      const amountInETH = (Number(amountInIDR) / ethPriceIdr).toFixed(18);
      const amountInWei = ethers.parseEther(amountInETH.toString());

      if (amountInWei <= 0n) {
        alert("Gagal: Nominal tagihan terlalu kecil untuk jaringan Ethereum.");
        setIsProcessing(false);
        return { success: false };
      }

      console.log(`--- PERSIAPAN TRANSAKSI ---`);
      console.log(`Tujuan Aman : ${safeReceiver}`);
      console.log(`Nominal     : ${amountInETH} ETH`);

      // 4. Inisialisasi Provider & Signer
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      // 👉 5. JURUS PAMUNGKAS: Human-Readable ABI
      // Kita definisikan fungsi langsung di sini, mengabaikan file JSON!
      const abi = [
        "function bayar(address _ke, string _keterangan) public payable"
      ];

      // Buat instance contract menggunakan ABI manual
      const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, signer);

      // 6. EKSEKUSI TRANSAKSI
      console.log("Mengirim transaksi ke MetaMask...");
      const tx = await contract.bayar(safeReceiver, keterangan || "Split Bill", {
        value: amountInWei,
        gasLimit: 300000 // Paksa gas limit
      });

      console.log("Transaksi terkirim! Menunggu konfirmasi block...");
      
      const receipt = await tx.wait();
      console.log("SUCCESS! Hash:", receipt.hash);

      return {
        success: true,
        hash: receipt.hash,
        amountEth: amountInETH
      };

    } catch (error) {
      console.log("--- WEB3 ERROR LOG ---");
      console.error(error);

      if (error.code === 'INVALID_ARGUMENT') {
        alert("Gagal: Format alamat dompet temanmu salah!");
      } else if (error.code === 'ACTION_REJECTED') {
        alert("Transaksi dibatalkan di MetaMask.");
      } else {
        alert("Error Web3! Coba cek Console Log (F12).");
      }

      return { success: false };
    } finally {
      setIsProcessing(false);
    }
  };

  return { payViaMetaMask, isProcessing, account, balance };
};