import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaRegComment, FaRegHeart, FaHeart, FaRegEye, FaRegClock } from 'react-icons/fa';
import { useAuth } from '../../hooks/useAuth';
import { formatRelativeTime } from '../../utils/formatters';
import { checkPostLike, likePost, unlikePost } from '../../services/postService';
import { getUserBasicProfile } from '../../services/userService';
import { POST_CATEGORIES } from '../../utils/constants';

const PostCard = ({ post }) => {
  const { currentUser } = useAuth();
  const [liked, setLiked] = useState(false);
  const [author, setAuthor] = useState(null);
  
  // 작성자 정보 가져오기
  useEffect(() => {
    const fetchAuthor = async () => {
      try {
        if (post.authorId) {
          const result = await getUserBasicProfile(post.authorId);
          if (result.success) {
            setAuthor(result.profile);
          }
        }
      } catch (error) {
        console.error('작성자 정보 로딩 오류:', error);
      }
    };
    
    fetchAuthor();
  }, [post.authorId]);
  
  // 좋아요 상태 확인
  useEffect(() => {
    const checkLikeStatus = async () => {
      if (currentUser && post.id) {
        try {
          const result = await checkPostLike(post.id, currentUser.uid);
          if (result.success) {
            setLiked(result.liked);
          }
        } catch (error) {
          console.error('좋아요 상태 확인 오류:', error);
        }
      }
    };
    
    checkLikeStatus();
  }, [currentUser, post.id]);
  
  // 좋아요 토글
  const handleLikeToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!currentUser) {
      return; // 비로그인 상태에서는 무시
    }
    
    try {
      if (liked) {
        await unlikePost(post.id, currentUser.uid);
        setLiked(false);
      } else {
        await likePost(post.id, currentUser.uid);
        setLiked(true);
      }
    } catch (error) {
      console.error('좋아요 토글 오류:', error);
    }
  };
  
  // 카테고리 이름 가져오기
  const getCategoryName = (categoryId) => {
    const category = POST_CATEGORIES.find(cat => cat.id === categoryId);
    return category ? category.name : '기타';
  };
  
  // 게시글 미리보기 생성
  const createPreview = (content, maxLength = 100) => {
    if (!content) return '';
    
    // HTML 태그 제거
    const plainText = content.replace(/<[^>]*>/g, '');
    
    // 일정 길이 이상이면 자르기
    if (plainText.length > maxLength) {
      return plainText.substring(0, maxLength) + '...';
    }
    
    return plainText;
  };
  
  // 날짜 포맷팅
  const formattedDate = post.createdAt ? formatRelativeTime(post.createdAt) : '';
  
  return (
    <div className="border border-gray-200 dark:border-dark-600 rounded-lg p-4 bg-white dark:bg-dark-700 hover:shadow-md transition-shadow">
      <Link to={`/community/${post.id}`} className="block">
        {/* 게시물 헤더 */}
        <div className="flex justify-between items-center mb-2">
          {/* 카테고리 및 작성일 */}
          <div className="flex items-center space-x-2">
            <span className="badge badge-primary">
              {getCategoryName(post.category)}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
              <FaRegClock className="mr-1" />
              {formattedDate}
            </span>
          </div>
          
          {/* 조회수 */}
          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
            <FaRegEye className="mr-1" />
            <span>{post.viewCount || 0}</span>
          </div>
        </div>
        
        {/* 게시물 제목 */}
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          {post.title}
        </h3>
        
        {/* 게시물 내용 미리보기 */}
        <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 line-clamp-2">
          {createPreview(post.content)}
        </p>
        
        {/* 게시물 이미지가 있으면 표시 */}
        {post.imageUrls && post.imageUrls.length > 0 && (
          <div className="mb-3">
            <img 
              src={post.imageUrls[0]} 
              alt={post.title} 
              className="h-40 w-full object-cover rounded"
            />
          </div>
        )}
        
        {/* 게시물 푸터 */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100 dark:border-dark-600">
          {/* 작성자 정보 */}
          <div className="flex items-center">
            {author && (
              <>
                {author.photoURL ? (
                  <img
                    src={author.photoURL}
                    alt={author.displayName}
                    className="w-6 h-6 rounded-full mr-2"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-gray-300 dark:bg-gray-600 mr-2"></div>
                )}
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {author.displayName}
                </span>
              </>
            )}
          </div>
          
          {/* 좋아요 및 댓글 수 */}
          <div className="flex items-center space-x-4">
            {/* 좋아요 버튼 */}
            <button
              onClick={handleLikeToggle}
              className="flex items-center text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400"
            >
              {liked ? (
                <FaHeart className="text-red-500 mr-1" />
              ) : (
                <FaRegHeart className="mr-1" />
              )}
              <span className="text-sm">{post.likeCount || 0}</span>
            </button>
            
            {/* 댓글 수 */}
            <div className="flex items-center text-gray-500 dark:text-gray-400">
              <FaRegComment className="mr-1" />
              <span className="text-sm">{post.commentCount || 0}</span>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default PostCard;