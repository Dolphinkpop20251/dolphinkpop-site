import { useContext } from 'react';
import { NotificationContext } from '../contexts/NotificationContext';

// 토스트 알림 관리 커스텀 훅
export const useToast = () => {
  const notificationContext = useContext(NotificationContext);
  
  if (!notificationContext) {
    throw new Error('useToast must be used within a NotificationProvider');
  }
  
  // 토스트 표시 및 숨기기 함수만 추출하여 반환
  const { showToast, hideToast, toast } = notificationContext;
  
  return { showToast, hideToast, toast };
};
