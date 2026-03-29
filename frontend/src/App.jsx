import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Groups from './pages/Groups'; 
import GroupDetail from './pages/GroupDetail';
import JoinGroup from './pages/JoinGroup';
import History from './pages/History';
import Notifications from './pages/Notifications'; 
import Profile from './pages/Profile'; // 👉 Sudah di-import dengan benar

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        
        <Route path="/groups" element={<Groups />} /> 
        <Route path="/groups/:id" element={<GroupDetail />} />
        <Route path="/join/:id" element={<JoinGroup />} />

        {/* Jalur Riwayat Transaksi */}
        <Route path="/transactions" element={<History />} />

        {/* Jalur Notifikasi */}
        <Route path="/notifications" element={<Notifications />} />

        {/* 👉 PERBAIKAN: Penjaga dihapus, Halaman Profil resmi mengudara! */}
        <Route path="/profile" element={<Profile />} />

      </Routes>
    </Router>
  );
}

export default App;