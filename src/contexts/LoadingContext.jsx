import React, { createContext, useState, useCallback } from 'react';

// 로딩 컨텍스트 생성
export const LoadingContext = createContext();

export const LoadingProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');

  // 로딩 시작
  const startLoading = useCallback((message = '') => {
    setIsLoading(true);
    setLoadingMessage(message);
  }, []);

  // 로딩 종료
  const stopLoading = useCallback(() => {
    setIsLoading(false);
    setLoadingMessage('');
  }, []);

  // 컨텍스트 값
  const value = {
    isLoading,
    loadingMessage,
    startLoading,
    stopLoading
  };

  return (
    <LoadingContext.Provider value={value}>
      {children}
    </LoadingContext.Provider>
  );
};
