import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaHeart, FaSearch } from 'react-icons/fa';
import { searchIdols } from '../../services/idolService';
import Loading from '../common/Loading';
import IdolFollowButton from './IdolFollowButton';
import { useAuth } from '../../hooks/useAuth';

const IdolSearch = ({ searchTerm }) => {
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentUser } = useAuth();
  
  // 검색어로 아이돌 검색
  useEffect(() => {
    const performSearch = async () => {
      if (!searchTerm) {
        setSearchResults([]);
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        setError(null);
        
        const response = await searchIdols(searchTerm);
        
        if (response.success) {
          setSearchResults(response.idols);
        } else {
          setError('검색 중 오류가 발생했습니다.');
          console.error(response.error);
        }
      } catch (error) {
        setError('검색 중 오류가 발생했습니다.');
        console.error('아이돌 검색 오류:', error);
      } finally {
        setLoading(false);
      }
    };
    
    performSearch();
  }, [searchTerm]);
  
  // 로딩 중 표시
  if (loading) {
    return <Loading size="medium" message="검색 중..." />;
  }
  
  // 에러 표시
  if (error) {
    return (
      <div className="text-center py-8 text-red-500 dark:text-red-400">
        <p>{error}</p>
      </div>
    );
  }
  
  // 검색 결과가 없을 때
  if (searchResults.length === 0) {
    return (
      <div className="text-center py-8">
        <FaSearch className="mx-auto text-gray-400 mb-4" size={40} />
        <p className="text-gray-500 dark:text-gray-400 mb-2">
          '{searchTerm}'에 대한 검색 결과가 없습니다.
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          다른 검색어를 입력하거나 필터를 조정해보세요.
        </p>
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {searchResults.map((idol) => (
        <div key={idol.id} className="flex flex-col">
          <Link 
            to={`/idols/${idol.id}`}
            className="group relative overflow-hidden rounded-lg mb-2"
          >
            <img
              src={idol.profileImage || '/asset/images/default-idol.png'}
              alt={idol.name}
              className="idol-img w-full transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="absolute bottom-0 left-0 p-3 w-full text-white text-opacity-0 group-hover:text-opacity-100 transition-all duration-300">
              <span className="flex items-center gap-1 text-sm">
                <FaHeart className="text-red-500" />
                {idol.followerCount || 0} 팔로워
              </span>
            </div>
          </Link>
          
          <div>
            <Link 
              to={`/idols/${idol.id}`}
              className="font-medium text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400"
            >
              {idol.name}
            </Link>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {idol.group || '솔로'}
            </p>
            
            {/* 팔로우 버튼 */}
            {currentUser && (
              <div className="mt-2">
                <IdolFollowButton idolId={idol.id} />
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default IdolSearch;