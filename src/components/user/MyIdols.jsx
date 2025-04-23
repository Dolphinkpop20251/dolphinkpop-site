import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaHeart, FaSearch, FaMusic, FaCalendarAlt } from 'react-icons/fa';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { getFollowedIdols, unfollowIdol } from '../../services/idolService';
import Loading from '../common/Loading';

const MyIdols = () => {
  const { currentUser } = useAuth();
  const { showToast } = useToast();
  
  const [idols, setIdols] = useState([]);
  const [filteredIdols, setFilteredIdols] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // 팔로우한 아이돌 목록 가져오기
  useEffect(() => {
    const fetchIdols = async () => {
      try {
        setLoading(true);
        
        if (currentUser) {
          const response = await getFollowedIdols(currentUser.uid);
          
          if (response.success) {
            setIdols(response.idols);
            setFilteredIdols(response.idols);
          } else {
            showToast('팔로우한 아이돌을 불러올 수 없습니다.', 'error');
          }
        }
      } catch (error) {
        console.error('아이돌 목록 로딩 오류:', error);
        showToast('아이돌 목록을 불러오는 중 오류가 발생했습니다.', 'error');
      } finally {
        setLoading(false);
      }
    };
    
    fetchIdols();
  }, [currentUser, showToast]);
  
  // 검색어에 따른 필터링
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredIdols(idols);
    } else {
      const lowercaseSearchTerm = searchTerm.toLowerCase();
      const filtered = idols.filter(idol => 
        idol.name.toLowerCase().includes(lowercaseSearchTerm) || 
        idol.group.toLowerCase().includes(lowercaseSearchTerm)
      );
      setFilteredIdols(filtered);
    }
  }, [searchTerm, idols]);
  
  // 검색 입력 처리
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };
  
  // 아이돌 팔로우 취소
  const handleUnfollow = async (idolId) => {
    if (window.confirm('이 아이돌의 팔로우를 취소하시겠습니까?')) {
      try {
        const result = await unfollowIdol(idolId, currentUser.uid);
        
        if (result.success) {
          // 목록에서 제거
          const updatedIdols = idols.filter(idol => idol.id !== idolId);
          setIdols(updatedIdols);
          setFilteredIdols(updatedIdols.filter(idol => 
            idol.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
            idol.group.toLowerCase().includes(searchTerm.toLowerCase())
          ));
          
          showToast('팔로우가 취소되었습니다.', 'success');
        } else {
          showToast(result.error || '팔로우 취소에 실패했습니다.', 'error');
        }
      } catch (error) {
        console.error('팔로우 취소 오류:', error);
        showToast('팔로우 취소 중 오류가 발생했습니다.', 'error');
      }
    }
  };
  
  // 로딩 중
  if (loading) {
    return <Loading message="아이돌 목록을 불러오는 중..." />;
  }
  
  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
        내가 팔로우한 아이돌
      </h2>
      
      {/* 검색 입력 */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="아이돌 또는 그룹 검색"
            className="form-input pl-10 w-full"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaSearch className="text-gray-400" />
          </div>
        </div>
      </div>
      
      {/* 아이돌 없음 메시지 */}
      {filteredIdols.length === 0 && (
        <div className="text-center py-12 bg-gray-50 dark:bg-dark-800 rounded-lg">
          {searchTerm ? (
            <p className="text-gray-600 dark:text-gray-400">
              검색 결과가 없습니다.
            </p>
          ) : (
            <>
              <div className="flex justify-center mb-4">
                <FaHeart className="text-red-500" size={48} />
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                아직 팔로우한 아이돌이 없습니다.
              </p>
              <Link to="/idols" className="btn btn-primary">
                아이돌 둘러보기
              </Link>
            </>
          )}
        </div>
      )}
      
      {/* 아이돌 목록 */}
      {filteredIdols.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredIdols.map(idol => (
            <div 
              key={idol.id}
              className="bg-white dark:bg-dark-600 rounded-lg shadow-sm overflow-hidden border border-gray-200 dark:border-dark-700"
            >
              <div className="relative">
                <img
                  src={idol.profileImage || '/asset/images/default-idol.png'}
                  alt={idol.name}
                  className="w-full h-56 object-cover"
                />
                <button
                  onClick={() => handleUnfollow(idol.id)}
                  className="absolute top-2 right-2 bg-white text-red-500 p-2 rounded-full hover:bg-red-100 dark:bg-dark-700 dark:text-red-400 dark:hover:bg-dark-600 transition-colors"
                  title="팔로우 취소"
                >
                  <FaHeart size={18} />
                </button>
              </div>
              
              <div className="p-4">
                <Link to={`/idols/${idol.id}`} className="block">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 transition-colors mb-1">
                    {idol.name}
                  </h3>
                  
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-3">
                    <FaMusic className="mr-1" />
                    <span>{idol.group || '솔로'}</span>
                  </div>
                  
                  {idol.birthDate && (
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <FaCalendarAlt className="mr-1" />
                      <span>생일: {new Date(idol.birthDate).toLocaleDateString()}</span>
                    </div>
                  )}
                </Link>
                
                <div className="mt-4 flex space-x-2">
                  <Link 
                    to={`/gallery?idol=${idol.id}`}
                    className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
                  >
                    갤러리
                  </Link>
                  <Link 
                    to={`/videos?idol=${idol.id}`}
                    className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
                  >
                    비디오
                  </Link>
                  <Link 
                    to={`/community?idol=${idol.id}`}
                    className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
                  >
                    게시글
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* 아이돌 탐색 링크 */}
      <div className="mt-8 text-center">
        <Link to="/idols" className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300">
          더 많은 아이돌 찾아보기
        </Link>
      </div>
    </div>
  );
};

export default MyIdols;