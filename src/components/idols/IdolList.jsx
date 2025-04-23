import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaHeart, FaUser } from 'react-icons/fa';
import { getIdols, getPopularIdols } from '../../services/idolService';
import Loading from '../common/Loading';
import IdolFollowButton from './IdolFollowButton';
import { useAuth } from '../../hooks/useAuth';

const IdolList = ({ groupFilter = null, popular = false, limit = 20 }) => {
  const [idols, setIdols] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastDoc, setLastDoc] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const { currentUser } = useAuth();
  
  // 아이돌 목록 가져오기
  useEffect(() => {
    const fetchIdols = async () => {
      try {
        setLoading(true);
        
        let response;
        
        if (popular) {
          // 인기 아이돌 (팔로워 순)
          response = await getPopularIdols(limit);
        } else {
          // 일반 목록 (페이지네이션)
          response = await getIdols(null, limit, groupFilter);
        }
        
        if (response.success) {
          setIdols(response.idols);
          setLastDoc(response.lastVisible);
          setHasMore(response.hasMore);
        } else {
          console.error('아이돌 목록 가져오기 실패:', response.error);
        }
      } catch (error) {
        console.error('아이돌 목록 가져오기 오류:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchIdols();
  }, [groupFilter, popular, limit]);
  
  // 더 보기
  const loadMore = async () => {
    if (!hasMore || loading) return;
    
    try {
      setLoading(true);
      
      const response = await getIdols(lastDoc, limit, groupFilter);
      
      if (response.success) {
        setIdols([...idols, ...response.idols]);
        setLastDoc(response.lastVisible);
        setHasMore(response.hasMore);
      }
    } catch (error) {
      console.error('더 보기 오류:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // 로딩 중 표시
  if (loading && idols.length === 0) {
    return <Loading size="medium" message="아이돌 정보를 불러오는 중..." />;
  }
  
  // 결과가 없을 때
  if (idols.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 dark:text-gray-400">
          {groupFilter 
            ? `'${groupFilter}' 그룹의 아이돌이 없습니다.`
            : '등록된 아이돌이 없습니다.'}
        </p>
      </div>
    );
  }
  
  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {idols.map((idol) => (
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
      
      {/* 더 보기 버튼 */}
      {!popular && hasMore && (
        <div className="mt-8 text-center">
          <button 
            onClick={loadMore} 
            disabled={loading}
            className="btn btn-outline"
          >
            {loading ? '로딩 중...' : '더 보기'}
          </button>
        </div>
      )}
    </div>
  );
};

export default IdolList;