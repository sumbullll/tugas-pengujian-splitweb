// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SplitWeb3 {
    // Event ini berguna untuk mencatat riwayat transaksi di Blockchain
    event PaymentMade(address indexed from, address indexed to, uint256 amount, string keterangan);

    // Fungsi utama untuk membayar
    function bayar(address payable _ke, string memory _keterangan) public payable {
        // Validasi 1: Pastikan ada uang yang dikirim
        require(msg.value > 0, "Nominal ETH tidak boleh 0");
        
        // Validasi 2: Pastikan alamat tujuan bukan alamat kosong
        require(_ke != address(0), "Alamat tujuan tidak valid");
        
        // Eksekusi transfer menggunakan '.call' (Paling aman untuk Solidity modern)
        (bool success, ) = _ke.call{value: msg.value}("");
        require(success, "Transfer gagal dilakukan oleh jaringan");

        // Rekam jejak transaksi
        emit PaymentMade(msg.sender, _ke, msg.value, _keterangan);
    }
}