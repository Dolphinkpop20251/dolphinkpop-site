import { useContext } from 'react';
import { LoadingContext } from '../contexts/LoadingContext';

// 로딩 상태 관리 커스텀 훅
export const useLoading = () => {
  const loadingContext = useContext(LoadingContext);
  
  if (!loadingContext) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  
  return loadingContext;
};
