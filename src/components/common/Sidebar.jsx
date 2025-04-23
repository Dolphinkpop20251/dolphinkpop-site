import React from 'react';
import { NavLink } from 'react-router-dom';
import { FaTimes } from 'react-icons/fa';

const Sidebar = ({ 
  isOpen, 
  onClose, 
  title = '메뉴', 
  items = [], 
  position = 'left',
  width = 'medium',
  overlay = true,
  children
}) => {
  // 너비 관련 클래스
  const widthClasses = {
    small: 'w-64',
    medium: 'w-80',
    large: 'w-96',
    full: 'w-full'
  };
  
  // 위치 관련 클래스
  const positionClasses = {
    left: `left-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`,
    right: `right-0 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`
  };
  
  // 아이템이 활성화되었는지 확인하는 함수
  const isItemActive = (path) => {
    return window.location.pathname === path || window.location.pathname.startsWith(`${path}/`);
  };
  
  // 사이드바가 열려있지 않으면 아무것도 렌더링하지 않음
  if (!isOpen) return null;
  
  return (
    <>
      {/* 오버레이 (배경) */}
      {overlay && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
          onClick={onClose}
        />
      )}
      
      {/* 사이드바 */}
      <div 
        className={`
          fixed top-0 bottom-0 ${widthClasses[width]} ${positionClasses[position]} 
          bg-white dark:bg-dark-700 shadow-lg z-50 transition-transform duration-300 ease-in-out
          flex flex-col
        `}
      >
        {/* 사이드바 헤더 */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-dark-600">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none"
            aria-label="사이드바 닫기"
          >
            <FaTimes size={20} />
          </button>
        </div>
        
        {/* 사이드바 콘텐츠 */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* 메뉴 아이템 목록 */}
          {items.length > 0 && (
            <nav className="mb-6">
              <ul className="space-y-2">
                {items.map((item, index) => {
                  if (item.divider) {
                    return <li key={index} className="border-t border-gray-200 dark:border-dark-600 my-4" />;
                  }
                  
                  if (item.header) {
                    return (
                      <li key={index} className="pt-4 pb-2">
                        <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          {item.header}
                        </h3>
                      </li>
                    );
                  }
                  
                  const isActive = isItemActive(item.to);
                  
                  return (
                    <li key={index}>
                      <NavLink
                        to={item.to}
                        className={`
                          flex items-center px-4 py-3 rounded-md transition-colors
                          ${isActive 
                            ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300' 
                            : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-dark-600'}
                        `}
                        onClick={() => {
                          if (item.onClick) item.onClick();
                          if (item.closeOnClick !== false) onClose();
                        }}
                      >
                        {item.icon && <span className="mr-3">{item.icon}</span>}
                        <span>{item.label}</span>
                        {item.badge && (
                          <span className={`
                            ml-auto inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium
                            ${item.badgeColor || 'bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-300'}
                          `}>
                            {item.badge}
                          </span>
                        )}
                      </NavLink>
                    </li>
                  );
                })}
              </ul>
            </nav>
          )}
          
          {/* 자식 컴포넌트 렌더링 */}
          {children}
        </div>
      </div>
    </>
  );
};

export default Sidebar;