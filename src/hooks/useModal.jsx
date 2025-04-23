import { useState, useCallback } from 'react';

// 모달 상태 관리를 위한 커스텀 훅
export const useModal = (initialOpen = false) => {
  const [isOpen, setIsOpen] = useState(initialOpen);
  const [modalData, setModalData] = useState(null);

  // 모달 열기
  const openModal = useCallback((data = null) => {
    setModalData(data);
    setIsOpen(true);
    // 모달이 열리면 배경 스크롤 방지
    document.body.style.overflow = 'hidden';
  }, []);

  // 모달 닫기
  const closeModal = useCallback(() => {
    setIsOpen(false);
    // 모달이 닫히면 배경 스크롤 허용
    document.body.style.overflow = 'unset';
  }, []);

  // 모달 토글
  const toggleModal = useCallback((data = null) => {
    if (!isOpen) {
      setModalData(data);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    setIsOpen(prev => !prev);
  }, [isOpen]);

  // 컴포넌트 언마운트 시 스크롤 복원 처리를 위한 정리 함수
  const cleanup = useCallback(() => {
    document.body.style.overflow = 'unset';
  }, []);

  return {
    isOpen,
    modalData,
    openModal,
    closeModal,
    toggleModal,
    cleanup
  };
};
