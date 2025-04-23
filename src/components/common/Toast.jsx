import React from 'react';
import { createPortal } from 'react-dom';
import { FaCheckCircle, FaInfoCircle, FaExclamationTriangle, FaTimesCircle, FaTimes } from 'react-icons/fa';
import { useToast } from '../../hooks/useToast';

const Toast = () => {
  const { toast, hideToast } = useToast();
  
  if (!toast.show) return null;
  
  // 토스트 타입에 따른 아이콘과 스타일 결정
  const getToastStyles = () => {
    switch (toast.type) {
      case 'success':
        return {
          icon: <FaCheckCircle size={20} />,
          bgColor: 'bg-green-100 dark:bg-green-900',
          textColor: 'text-green-800 dark:text-green-100',
          borderColor: 'border-green-400 dark:border-green-700'
        };
      case 'error':
        return {
          icon: <FaTimesCircle size={20} />,
          bgColor: 'bg-red-100 dark:bg-red-900',
          textColor: 'text-red-800 dark:text-red-100',
          borderColor: 'border-red-400 dark:border-red-700'
        };
      case 'warning':
        return {
          icon: <FaExclamationTriangle size={20} />,
          bgColor: 'bg-yellow-100 dark:bg-yellow-900',
          textColor: 'text-yellow-800 dark:text-yellow-100',
          borderColor: 'border-yellow-400 dark:border-yellow-700'
        };
      case 'info':
      default:
        return {
          icon: <FaInfoCircle size={20} />,
          bgColor: 'bg-blue-100 dark:bg-blue-900',
          textColor: 'text-blue-800 dark:text-blue-100',
          borderColor: 'border-blue-400 dark:border-blue-700'
        };
    }
  };
  
  const { icon, bgColor, textColor, borderColor } = getToastStyles();
  
  // createPortal을 사용하여 토스트를 별도의 요소에 렌더링
  return createPortal(
    <div className="toast-container">
      <div 
        className={`${bgColor} ${textColor} ${borderColor} px-4 py-3 rounded shadow-md border-l-4 flex items-center justify-between max-w-md animate-fadeIn`}
        role="alert"
      >
        <div className="flex items-center">
          <span className="mr-2">{icon}</span>
          <span>{toast.message}</span>
        </div>
        <button 
          onClick={hideToast}
          className={`ml-4 ${textColor} focus:outline-none hover:opacity-80`}
          aria-label="닫기"
        >
          <FaTimes size={16} />
        </button>
      </div>
    </div>,
    document.getElementById('toast-root') // index.html에서 정의한 토스트 포털 요소
  );
};

export default Toast;