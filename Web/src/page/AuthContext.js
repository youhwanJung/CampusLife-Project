import React, { createContext, useState, useContext } from 'react';
import config from './config'
/*
  Context란 리액트 컴포넌트간에 어떠한 값을 공유할수 있게 해주는 기능이다.
  전역적(global)으로 필요한 값을 다룰 때 사용하는데요, 
  꼭 전역적일 필요는 없습니다. 
  Context를 단순히 "리액트 컴포넌트에서 Props가 아닌 또 다른 방식으로 컴포넌트간에 값을 전달하는 방법이다"

  한마디로 전역 함수 및 변수 모음집 ㅋㅋ
*/

const AuthContext = createContext(); 
//Context 객체 생성 이 객체의 값은 전역적으로 여러 컴포넌트에서 공유 할 수 있다.

export const useAuth = () => useContext(AuthContext);
//useContext(Context객체) 를 사용해서 해당 Context의 value를 가져올 수 있다.

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [professorData, setProfessorData] = useState();
  const login = async (username, password) => {
    try {
      const IsProfessorInfo = await CheckProfessorInfo(username, password);

      // 서버 응답의 success 속성 확인
      if (IsProfessorInfo.success) {
        setIsLoggedIn(true);
        return IsProfessorInfo.data[0];
      } else {
        setIsLoggedIn(false);
        return false ;
      }
    } catch (error) {
      setIsLoggedIn(false); 
      console.log(error);
      return false;
    }
  };


  const CheckProfessorInfo = async (username, password) => {
    try {
      const response = await fetch(`${config.serverUrl}/CheckProfessorInfo`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id : username,
          pass : password
        })
      })
  
      if (!response.ok) {
        throw new Error(`Server error: ${response.status} ${response.statusText}`);
      }
  
      const ProfessorData = await response.json();
      setProfessorData(ProfessorData.data[0]);
      return ProfessorData;
    } catch (error) {
      console.error(error);
    }
  }

  const logout = () => {
    setIsLoggedIn(false);
  };
  //이 컴포넌트 생성 value로는 isLogedIn, login, logout 
  return (
    <AuthContext.Provider value={{ isLoggedIn, professorData, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};