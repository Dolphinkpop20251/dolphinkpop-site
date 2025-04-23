import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { FaTimes } from 'react-icons/fa';

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'medium',
  showCloseButton = true,
  closeOnClickOutside = true,
  centerContent = false
}) => {
  const modalRef = useRef(null);

  // 모달 크기에 따른 클래스
  const sizeClasses = {
    small: 'max-w-md',
    medium: 'max-w-2xl',
    large: 'max-w-4xl',
    fullWidth: 'max-w-full mx-4'
  };

  // Escape 키 누를 때 모달 닫기
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // 모달이 열릴 때 스크롤 방지
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      // 모달이 닫힐 때 스크롤 복원
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // 모달 외부 클릭 시 닫기
  const handleOutsideClick = (e) => {
    if (closeOnClickOutside && modalRef.current && !modalRef.current.contains(e.target)) {
      onClose();
    }
  };

  // 모달이 열려있지 않으면 아무것도 렌더링하지 않음
  if (!isOpen) return null;

  // createPortal을 사용하여 모달을 body 바로 아래에 렌더링
  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
      onClick={handleOutsideClick}
    >
      <div
        ref={modalRef}
        className={`${sizeClasses[size]} w-full bg-white dark:bg-dark-700 rounded-lg shadow-lg overflow-hidden transition-all transform animate-fadeIn`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* 모달 헤더 */}
        {(title || showCloseButton) && (
          <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-dark-600">
            {title && (
              <h3
                id="modal-title"
                className="text-lg font-semibold text-gray-900 dark:text-white"
              >
                {title}
              </h3>
            )}
            {showCloseButton && (
              <button
                type="button"
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none"
                aria-label="닫기"
              >
                <FaTimes size={18} />
              </button>
            )}
          </div>
        )}

        {/* 모달 본문 */}
        <div className={`p-4 ${centerContent ? 'flex items-center justify-center' : ''}`}>
          {children}
        </div>
      </div>
    </div>,
    document.getElementById('modal-root') // index.html에서 정의한 모달 포털 요소
  );
};

export default Modal;