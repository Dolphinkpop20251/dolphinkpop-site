import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaHome, FaArrowLeft, FaQuestion } from 'react-icons/fa';

const NotFoundPage = () => {
  const navigate = useNavigate();
  
  // 이전 페이지로 이동
  const goBack = () => {
    navigate(-1);
  };
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-800 flex flex-col justify-center items-center px-4 py-12">
      <div className="text-center max-w-md">
        <div className="mb-6">
          <h1 className="text-9xl font-bold text-primary-600 dark:text-primary-400">404</h1>
          <div className="w-16 h-1 bg-primary-600 dark:bg-primary-400 mx-auto my-4"></div>
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          페이지를 찾을 수 없습니다
        </h2>
        
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          요청하신 페이지가 삭제되었거나, 이름이 변경되었거나, 일시적으로 사용이 불가능합니다.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={goBack}
            className="btn btn-outline flex items-center justify-center"
          >
            <FaArrowLeft className="mr-2" />
            이전 페이지로
          </button>
          
          <Link
            to="/"
            className="btn btn-primary flex items-center justify-center"
          >
            <FaHome className="mr-2" />
            홈으로 이동
          </Link>
          
          <Link
            to="/help"
            className="btn btn-outline flex items-center justify-center"
          >
            <FaQuestion className="mr-2" />
            도움말
          </Link>
        </div>
      </div>
      
      {/* 추가 링크 */}
      <div className="mt-12 flex flex-wrap gap-4 justify-center">
        <Link to="/community" className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300">
          커뮤니티
        </Link>
        <Link to="/idols" className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300">
          아이돌
        </Link>
        <Link to="/gallery" className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300">
          갤러리
        </Link>
        <Link to="/videos" className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300">
          비디오
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;