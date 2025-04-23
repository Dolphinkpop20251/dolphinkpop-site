import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { FaInfoCircle } from 'react-icons/fa';
import PostList from '../components/community/PostList';
import Banner from '../components/common/Banner';
import { POST_CATEGORIES } from '../utils/constants';

const CommunityPage = () => {
  const location = useLocation();
  const [activeCategory, setActiveCategory] = useState('');

  // URL 쿼리 파라미터에서 카테고리 가져오기
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const category = searchParams.get('category');
    
    // 유효한 카테고리인지 확인
    if (category && POST_CATEGORIES.some(c => c.id === category)) {
      setActiveCategory(category);
    } else {
      setActiveCategory('');
    }
  }, [location.search]);

  return (
    <div className="container-custom mx-auto px-4 py-8 mt-20">
      {/* 페이지 헤더 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          커뮤니티
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          다양한 K-POP 아이돌 관련 주제로 다른 팬들과 소통하세요!
        </p>
      </div>
      
      {/* 공지사항 배너 */}
      <div className="mb-6">
        <Banner
          message="커뮤니티 이용 규칙을 확인하고 건전한 팬 활동을 함께 해주세요."
          type="info"
          icon={<FaInfoCircle />}
          link="/community/rules"
          linkText="이용 규칙 확인하기"
          dismissible={true}
        />
      </div>
      
      {/* 카테고리 탭 */}
      <div className="mb-8 border-b border-gray-200 dark:border-dark-600">
        <div className="flex flex-wrap -mb-px">
          <button
            className={`inline-block py-3 px-4 font-medium text-sm border-b-2 transition-colors mr-1
              ${activeCategory === '' 
                ? 'border-primary-600 text-primary-600 dark:border-primary-400 dark:text-primary-400' 
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            onClick={() => setActiveCategory('')}
          >
            전체
          </button>
          
          {POST_CATEGORIES.map(category => (
            <button
              key={category.id}
              className={`inline-block py-3 px-4 font-medium text-sm border-b-2 transition-colors mr-1
                ${activeCategory === category.id 
                  ? 'border-primary-600 text-primary-600 dark:border-primary-400 dark:text-primary-400' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              onClick={() => setActiveCategory(category.id)}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>
      
      {/* 게시물 목록 */}
      <PostList category={activeCategory} />
    </div>
  );
};

export default CommunityPage;