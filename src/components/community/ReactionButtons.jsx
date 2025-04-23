import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaHeart, FaRegHeart, FaThumbsUp, FaRegThumbsUp, FaLaugh, FaRegLaugh, FaSadTear, FaRegSadTear } from 'react-icons/fa';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';

// 가능한 반응 타입 정의
const REACTION_TYPES = {
  LIKE: {
    id: 'like',
    label: '좋아요',
    activeIcon: <FaHeart size={20} />,
    inactiveIcon: <FaRegHeart size={20} />,
    color: 'text-red-500'
  },
  THUMBS_UP: {
    id: 'thumbsUp',
    label: '추천',
    activeIcon: <FaThumbsUp size={20} />,
    inactiveIcon: <FaRegThumbsUp size={20} />,
    color: 'text-blue-500'
  },
  LAUGH: {
    id: 'laugh',
    label: '웃겨요',
    activeIcon: <FaLaugh size={20} />,
    inactiveIcon: <FaRegLaugh size={20} />,
    color: 'text-yellow-500'
  },
  SAD: {
    id: 'sad',
    label: '슬퍼요',
    activeIcon: <FaSadTear size={20} />,
    inactiveIcon: <FaRegSadTear size={20} />,
    color: 'text-purple-500'
  }
};

const ReactionButtons = ({
  postId,
  onReactionChange,
  initialReactions = {},
  showLabels = false,
  size = 'medium',
  className = ''
}) => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { showToast } = useToast();
  
  // 현재 사용자의 반응 상태
  const [userReaction, setUserReaction] = useState(null);
  
  // 반응 개수
  const [reactionCounts, setReactionCounts] = useState({
    like: initialReactions.like || 0,
    thumbsUp: initialReactions.thumbsUp || 0,
    laugh: initialReactions.laugh || 0,
    sad: initialReactions.sad || 0
  });
  
  // 초기 반응 데이터 설정
  useEffect(() => {
    // 사용자의 기존 반응이 있으면 설정
    if (currentUser && initialReactions.userReaction) {
      setUserReaction(initialReactions.userReaction);
    }
    
    // 반응 개수 초기화
    setReactionCounts({
      like: initialReactions.like || 0,
      thumbsUp: initialReactions.thumbsUp || 0,
      laugh: initialReactions.laugh || 0,
      sad: initialReactions.sad || 0
    });
  }, [initialReactions, currentUser]);
  
  // 반응 클릭 처리
  const handleReaction = (reactionType) => {
    // 비로그인 상태일 경우
    if (!currentUser) {
      showToast('로그인 후 이용 가능합니다.', 'info');
      navigate('/login', { state: { from: `/community/${postId}` } });
      return;
    }
    
    // 이전 반응 상태 저장
    const previousReaction = userReaction;
    
    if (userReaction === reactionType) {
      // 같은 반응 다시 클릭 시 취소
      setUserReaction(null);
      
      // 해당 반응 개수 감소
      setReactionCounts(prev => ({
        ...prev,
        [reactionType]: Math.max(0, prev[reactionType] - 1)
      }));
      
      // 반응 변경 콜백 호출
      onReactionChange && onReactionChange({
        postId,
        reactionType: null,
        previousReaction
      });
    } else {
      // 새로운 반응 또는 다른 반응으로 변경
      
      // 기존 반응이 있으면 해당 반응 개수 감소
      if (previousReaction) {
        setReactionCounts(prev => ({
          ...prev,
          [previousReaction]: Math.max(0, prev[previousReaction] - 1)
        }));
      }
      
      // 새 반응 설정
      setUserReaction(reactionType);
      
      // 새 반응 개수 증가
      setReactionCounts(prev => ({
        ...prev,
        [reactionType]: prev[reactionType] + 1
      }));
      
      // 반응 변경 콜백 호출
      onReactionChange && onReactionChange({
        postId,
        reactionType,
        previousReaction
      });
    }
  };
  
  // 버튼 크기 클래스
  const sizeClasses = {
    small: 'text-sm',
    medium: 'text-base',
    large: 'text-lg'
  };
  
  // 반응 아이콘 렌더링
  const renderReactionButton = (reactionType) => {
    const reaction = REACTION_TYPES[reactionType];
    const isActive = userReaction === reaction.id;
    const count = reactionCounts[reaction.id];
    
    return (
      <button
        key={reaction.id}
        type="button"
        onClick={() => handleReaction(reaction.id)}
        className={`flex items-center ${sizeClasses[size]} 
          ${isActive 
            ? `${reaction.color} font-medium` 
            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          } transition-colors`}
        title={reaction.label}
      >
        <span className="mr-1">
          {isActive ? reaction.activeIcon : reaction.inactiveIcon}
        </span>
        
        {/* 개수 표시 */}
        {count > 0 && <span className="mr-1">{count}</span>}
        
        {/* 레이블 (옵션) */}
        {showLabels && <span>{reaction.label}</span>}
      </button>
    );
  };
  
  return (
    <div className={`flex space-x-4 ${className}`}>
      {Object.keys(REACTION_TYPES).map(type => 
        renderReactionButton(type)
      )}
    </div>
  );
};

export default ReactionButtons;