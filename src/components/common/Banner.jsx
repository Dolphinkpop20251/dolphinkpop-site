import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaTimes } from 'react-icons/fa';

const Banner = ({ 
  message, 
  type = 'info', 
  link = null, 
  linkText = '자세히 보기', 
  dismissible = true,
  onDismiss = null,
  showIcon = true,
  className = ''
}) => {
  const [isVisible, setIsVisible] = useState(true);
  
  // 배너 유형별 스타일
  const bannerStyles = {
    info: 'bg-blue-50 text-blue-800 dark:bg-blue-900 dark:text-blue-100',
    success: 'bg-green-50 text-green-800 dark:bg-green-900 dark:text-green-100',
    warning: 'bg-yellow-50 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100',
    error: 'bg-red-50 text-red-800 dark:bg-red-900 dark:text-red-100',
    primary: 'bg-primary-50 text-primary-800 dark:bg-primary-900 dark:text-primary-100',
    secondary: 'bg-secondary-50 text-secondary-800 dark:bg-secondary-900 dark:text-secondary-100'
  };
  
  // 배너 닫기 처리
  const handleDismiss = () => {
    setIsVisible(false);
    if (onDismiss) {
      onDismiss();
    }
  };
  
  // 배너가 보이지 않게 설정되었으면 아무것도 렌더링하지 않음
  if (!isVisible) return null;
  
  return (
    <div className={`${bannerStyles[type]} py-3 px-4 rounded-md shadow-sm ${className}`}>
      <div className="flex justify-between items-center">
        <div className="flex-1">
          {message}
          
          {link && (
            <Link 
              to={link} 
              className="ml-2 underline font-medium hover:opacity-80"
            >
              {linkText}
            </Link>
          )}
        </div>
        
        {dismissible && (
          <button
            className="ml-4 text-current focus:outline-none hover:opacity-80"
            onClick={handleDismiss}
            aria-label="배너 닫기"
          >
            <FaTimes size={16} />
          </button>
        )}
      </div>
    </div>
  );
};

// 정적 배너 컴포넌트들 (편의를 위한 미리 설정된 배너)
Banner.Info = (props) => <Banner {...props} type="info" />;
Banner.Success = (props) => <Banner {...props} type="success" />;
Banner.Warning = (props) => <Banner {...props} type="warning" />;
Banner.Error = (props) => <Banner {...props} type="error" />;
Banner.Primary = (props) => <Banner {...props} type="primary" />;
Banner.Secondary = (props) => <Banner {...props} type="secondary" />;

export default Banner;