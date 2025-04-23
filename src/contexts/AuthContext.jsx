import React, { createContext, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../services/firebase';

// 인증 컨텍스트 생성
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Firebase 인증 상태 변경 감지
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setIsLoading(true);
      
      if (user) {
        // 사용자 정보 업데이트
        setCurrentUser(user);
        
        try {
          // Firestore에서 사용자 역할 가져오기
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUserRole(userData.role || 'user');
          } else {
            setUserRole('user'); // 기본 역할
          }
        } catch (error) {
          console.error('사용자 역할 가져오기 실패:', error);
          setUserRole('user'); // 오류 시 기본 역할 설정
        }
      } else {
        // 로그아웃 상태
        setCurrentUser(null);
        setUserRole(null);
      }
      
      // 인증 준비 완료 상태 설정
      setIsAuthReady(true);
      setIsLoading(false);
    });

    // 컴포넌트 언마운트 시 구독 해제
    return () => unsubscribe();
  }, []);

  // 관리자 확인 헬퍼 함수
  const isAdmin = userRole === 'admin';

  // 컨텍스트 값
  const value = {
    currentUser,
    userRole,
    isAdmin,
    isAuthReady,
    isLoading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
