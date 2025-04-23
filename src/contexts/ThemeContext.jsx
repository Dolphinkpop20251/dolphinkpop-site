import React, { createContext, useState, useEffect } from 'react';

// 테마 컨텍스트 생성
export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  // 테마 상태 초기화 (localStorage에서 저장된 값 가져오기 또는 시스템 기본값 사용)
  const [darkMode, setDarkMode] = useState(() => {
    // localStorage에서 테마 설정 불러오기 
    const savedTheme = localStorage.getItem('theme');
    
    if (savedTheme) {
      return savedTheme === 'dark';
    }
    
    // 시스템 기본 설정 감지
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // 다크 모드 토글
  const toggleDarkMode = () => {
    setDarkMode(prevMode => !prevMode);
  };

  // 특정 모드로 설정
  const setTheme = (isDark) => {
    setDarkMode(isDark);
  };

  // 테마 변경 시 HTML 속성 및 localStorage 업데이트
  useEffect(() => {
    // HTML 문서의 data-theme 속성 업데이트
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
    
    // 다크 모드일 때 클래스 추가/제거
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // localStorage에 테마 설정 저장
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  // 시스템 테마 변경 감지
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    // 시스템 테마 변경 시 이벤트 핸들러
    const handleChange = (e) => {
      // localStorage에 저장된 사용자 선택이 없는 경우에만 시스템 설정 따르기
      if (!localStorage.getItem('theme')) {
        setDarkMode(e.matches);
      }
    };
    
    // 이벤트 리스너 등록
    mediaQuery.addEventListener('change', handleChange);
    
    // 컴포넌트 언마운트 시 이벤트 리스너 제거
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // 컨텍스트 값
  const value = {
    darkMode,
    toggleDarkMode,
    setTheme
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
