import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import { useNavigate } from 'react-router-dom';
import styles from './Login.module.css';
import logo from '../image/logo.png';

function Login() {
  const { login  } = useAuth(); //로그인, 로그아웃 사용자 인증을 관리해주는 함수를 만들어주는 useaAuth
  const navigate = useNavigate();
  const [username, setUsername] = useState(''); //아이디
  const [password, setPassword] = useState(''); //비밀번호
  const [error, setError] = useState(''); //에러

  //로그인 폼이 제출될 때 실행되는 비동기 함수
  const handleSubmit = async (event) => {
    event.preventDefault(); //원래 디폴트는 폼제출 후 새로고침인데 event.preventDefault(); 함수를 사용해서 새로고침을 막음
    try {
      const ProfessorInfo = await login(username, password);
      if(ProfessorInfo) {
        navigate('/' , { state: { ProfessorInfo } });
      }else {
        setError('Login failed. Please check your username and password.');
      }
    } catch (err) {
      console.log(err)
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.imageArea}>
        <img src={logo} alt="Logo" className={styles.image} />
      </div>
      <h2 className={styles.h2}>강의 출석체크 홈페이지</h2>
      <form className={styles.form} onSubmit={handleSubmit}>
        {error && <div className={styles.error}>{error}</div>}
        <div className={styles.inputArea}>
          <label htmlFor="username" className={styles.inputText}>아이디 :</label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className={styles.input}
          />
        </div>
        <div className={styles.inputArea}>
          <label htmlFor="password" className={styles.inputText}>비밀번호 :</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className={styles.input}
          />
        </div>
        <div className={styles.buttonArea}>
          <button type="submit" className={styles.button}>로그인</button>
        </div>
      </form>
    </div>
  );
}

export default Login;