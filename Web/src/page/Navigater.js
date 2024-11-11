import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext'; // Adjust path based on your context location
import Login from './Login';
import Main from './Main';
import Test from './Test';
import QrCheck from './QrCheck';
import HeaderPage from '../HeaderPage/HeaderPage';

function Navigator() {
  const { isLoggedIn } = useAuth();

  return (
    <Router>
      <HeaderPage />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={isLoggedIn ? <Main /> : <Navigate to="/login" />} />
        <Route path="/main" element={isLoggedIn ? <Main /> : <Navigate to="/login" />} />
        <Route path="/test" element={isLoggedIn ? <Test /> : <Navigate to="/login" />} />
        <Route path="/qrcheck" element={isLoggedIn ? <QrCheck /> : <Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default Navigator;
