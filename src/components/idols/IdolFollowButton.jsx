import React, { useState, useEffect } from 'react';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import { followIdol, unfollowIdol, checkIdolFollow } from '../../services/idolService';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { useNavigate } from 'react-router-dom';

const IdolFollowButton = ({ idolId, size = 'small', showCount = false, followerCount = 0 }) => {
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [count, setCount] = useState(followerCount);
  const { currentUser } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  
  // 팔로우 상태 확인
  useEffect(() => {
    const checkFollowStatus = async () => {
      if (!currentUser || !idolId) {
        setLoading(false);
        return;
      }
      
      try {
        const response = await checkIdolFollow(idolId, currentUser.uid);
        
        if (response.success) {
          setIsFollowing(response.following);
        }
      } catch (error) {
        console.error('팔로우 상태 확인 오류:', error);
      } finally {
        setLoading(false);
      }
    };
    
    checkFollowStatus();
  }, [idolId, currentUser]);
  
  // 팔로우/언팔로우 처리
  const toggleFollow = async () => {
    if (!currentUser) {
      showToast('로그인 후 이용해주세요.', 'info');
      navigate('/login', { state: { from: `/idols/${idolId}` } });
      return;
    }
    
    if (loading) return;
    
    setLoading(true);
    
    try {
      if (isFollowing) {
        // 언팔로우
        const response = await unfollowIdol(idolId, currentUser.uid);
        
        if (response.success) {
          setIsFollowing(false);
          setCount(prevCount => Math.max(0, prevCount - 1));
          showToast('아이돌 팔로우를 취소했습니다.', 'info');
        } else {
          showToast('팔로우 취소 중 오류가 발생했습니다.', 'error');
        }
      } else {
        // 팔로우
        const response = await followIdol(idolId, currentUser.uid);
        
        if (response.success) {
          setIsFollowing(true);
          setCount(prevCount => prevCount + 1);
          showToast('아이돌을 팔로우했습니다.', 'success');
        } else {
          showToast('팔로우 중 오류가 발생했습니다.', 'error');
        }
      }
    } catch (error) {
      console.error('팔로우 토글 오류:', error);
      showToast('요청 처리 중 오류가 발생했습니다.', 'error');
    } finally {
      setLoading(false);
    }
  };
  
  // 버튼 클래스 설정
  const getButtonClass = () => {
    let baseClass = 'flex items-center justify-center transition-colors duration-200 ';
    
    // 팔로우 상태에 따른 클래스
    if (isFollowing) {
      baseClass += 'bg-primary-600 text-white hover:bg-primary-700 dark:bg-primary-700 dark:hover:bg-primary-800 ';
    } else {
      baseClass += 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-dark-600 dark:text-gray-300 dark:hover:bg-dark-500 ';
    }
    
    // 크기에 따른 클래스
    if (size === 'small') {
      baseClass += 'text-xs py-1 px-2 rounded ';
    } else if (size === 'medium') {
      baseClass += 'text-sm py-1.5 px-3 rounded-md ';
    } else {
      baseClass += 'text-sm py-2 px-4 rounded-md ';
    }
    
    // 로딩 상태
    if (loading) {
      baseClass += 'opacity-70 cursor-wait';
    }
    
    return baseClass;
  };
  
  return (
    <button
      onClick={toggleFollow}
      disabled={loading}
      className={getButtonClass()}
      aria-label={isFollowing ? '팔로우 취소' : '팔로우'}
    >
      {isFollowing ? (
        <>
          <FaHeart className="mr-1" />
          {size !== 'small' && (
            <span>{showCount ? `${count} 팔로잉` : '팔로잉'}</span>
          )}
        </>
      ) : (
        <>
          <FaRegHeart className="mr-1" />
          {size !== 'small' && (
            <span>{showCount ? `${count} 팔로우` : '팔로우'}</span>
          )}
        </>
      )}
    </button>
  );
};

export default IdolFollowButton;