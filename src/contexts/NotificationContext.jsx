import React, { createContext, useState, useCallback, useEffect, useContext } from 'react';
import { collection, query, where, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../services/firebase';
import { AuthContext } from './AuthContext';

// 알림 컨텍스트 생성
export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  // 인증 컨텍스트에서 현재 사용자 가져오기
  const { currentUser } = useContext(AuthContext);

  // 토스트 알림 표시
  const showToast = useCallback((message, type = 'info') => {
    setToast({ show: true, message, type });

    // 3초 후 토스트 숨기기
    setTimeout(() => {
      setToast({ show: false, message: '', type: '' });
    }, 3000);
  }, []);

  // 토스트 알림 숨기기
  const hideToast = useCallback(() => {
    setToast({ show: false, message: '', type: '' });
  }, []);

  // 사용자 로그인 시 알림 구독
  useEffect(() => {
    let unsubscribe = null;

    if (currentUser) {
      // Firestore 알림 쿼리
      const notificationsQuery = query(
        collection(db, 'notifications'),
        where('recipientId', '==', currentUser.uid),
        orderBy('createdAt', 'desc'),
        limit(20)
      );

      // 실시간 알림 구독
      unsubscribe = onSnapshot(notificationsQuery, (snapshot) => {
        const notificationsList = [];
        let unread = 0;

        snapshot.forEach((doc) => {
          const notification = {
            id: doc.id,
            ...doc.data()
          };
          
          notificationsList.push(notification);
          
          // 읽지 않은 알림 카운트
          if (!notification.read) {
            unread++;
          }
        });

        setNotifications(notificationsList);
        setUnreadCount(unread);
        setIsLoaded(true);
      }, (error) => {
        console.error('알림 가져오기 오류:', error);
        setIsLoaded(true);
      });
    } else {
      // 로그아웃 상태: 알림 초기화
      setNotifications([]);
      setUnreadCount(0);
      setIsLoaded(true);
    }

    // 구독 해제
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [currentUser]);

  // 컨텍스트 값
  const value = {
    notifications,
    unreadCount,
    isLoaded,
    toast,
    showToast,
    hideToast
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
