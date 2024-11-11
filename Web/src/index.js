import React from 'react';
import ReactDOM from 'react-dom/client'; // 'react-dom/client'에서 createRoot 가져오기
import './index.css';
import App from './App';
import Navigater from './page/Navigater';
import reportWebVitals from './reportWebVitals';
import { AuthProvider } from './page/AuthContext'; // 경로에 맞게 조정

// 루트 컨테이너 가져오기
const container = document.getElementById('root');
const root = ReactDOM.createRoot(container); // createRoot 사용하여 루트 생성

// 앱 렌더링
root.render(
  <React.StrictMode>
    <AuthProvider>
      <Navigater />
    </AuthProvider>
  </React.StrictMode>
);

// 웹 성능 측정
reportWebVitals();
