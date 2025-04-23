import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaHeart, FaRegHeart, FaRegComment, FaRegEye, FaRegClock, FaEdit, FaTrash, FaShare, FaFlag } from 'react-icons/fa';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { useModal } from '../../hooks/useModal';
import Modal from '../common/Modal';
import CommentList from './CommentList';
import CommentForm from './CommentForm';
import { getPostById, deletePost, likePost, unlikePost, checkPostLike } from '../../services/postService';
import { getUserBasicProfile } from '../../services/userService';
import { formatDate, formatRelativeTime } from '../../utils/formatters';
import { POST_CATEGORIES } from '../../utils/constants';

const PostDetail = ({ postId }) => {
  const navigate = useNavigate();
  const { currentUser, isAdmin } = useAuth();
  const { showToast } = useToast();
  const { isOpen, openModal, closeModal } = useModal();
  
  const [post, setPost] = useState(null);
  const [author, setAuthor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // 게시물 데이터 불러오기
  useEffect(() => {
    const fetchPostData = async () => {
      try {
        setLoading(true);
        const response = await getPostById(postId);
        
        if (response.success) {
          setPost(response.post);
          
          // 작성자 정보 불러오기
          const authorResponse = await getUserBasicProfile(response.post.authorId);
          if (authorResponse.success) {
            setAuthor(authorResponse.profile);
          }
        } else {
          showToast('게시물을 불러올 수 없습니다.', 'error');
          navigate('/community');
        }
      } catch (error) {
        console.error('게시물 조회 오류:', error);
        showToast('게시물을 불러오는 중 오류가 발생했습니다.', 'error');
        navigate('/community');
      } finally {
        setLoading(false);
      }
    };
    
    fetchPostData();
  }, [postId, navigate, showToast]);
  
  // 좋아요 상태 확인
  useEffect(() => {
    const checkLikeStatus = async () => {
      if (currentUser && post) {
        try {
          const result = await checkPostLike(postId, currentUser.uid);
          if (result.success) {
            setLiked(result.liked);
          }
        } catch (error) {
          console.error('좋아요 상태 확인 오류:', error);
        }
      }
    };
    
    checkLikeStatus();
  }, [currentUser, post, postId]);
  
  // 좋아요 토글
  const handleLikeToggle = async () => {
    if (!currentUser) {
      showToast('로그인 후 좋아요를 누를 수 있습니다.', 'info');
      navigate('/login', { state: { from: `/community/${postId}` } });
      return;
    }
    
    try {
      if (liked) {
        // 좋아요 취소
        const result = await unlikePost(postId, currentUser.uid);
        if (result.success) {
          setLiked(false);
          setPost(prev => ({
            ...prev,
            likeCount: (prev.likeCount || 0) - 1
          }));
        }
      } else {
        // 좋아요 추가
        const result = await likePost(postId, currentUser.uid);
        if (result.success) {
          setLiked(true);
          setPost(prev => ({
            ...prev,
            likeCount: (prev.likeCount || 0) + 1
          }));
        }
      }
    } catch (error) {
      console.error('좋아요 오류:', error);
      showToast('좋아요 처리 중 오류가 발생했습니다.', 'error');
    }
  };
  
  // 게시물 삭제
  const handleDeletePost = async () => {
    if (window.confirm('정말로 이 게시물을 삭제하시겠습니까?')) {
      try {
        const result = await deletePost(postId);
        
        if (result.success) {
          showToast('게시물이 삭제되었습니다.', 'success');
          navigate('/community');
        } else {
          showToast(result.error || '게시물 삭제에 실패했습니다.', 'error');
        }
      } catch (error) {
        console.error('게시물 삭제 오류:', error);
        showToast('게시물 삭제 중 오류가 발생했습니다.', 'error');
      }
    }
  };
  
  // 게시물 수정 페이지로 이동
  const handleEditPost = () => {
    navigate(`/community/edit/${postId}`);
  };
  
  // 게시물 공유
  const handleSharePost = () => {
    // 현재 URL 복사
    const url = window.location.href;
    navigator.clipboard.writeText(url)
      .then(() => {
        showToast('게시물 링크가 클립보드에 복사되었습니다.', 'success');
      })
      .catch(err => {
        console.error('클립보드 복사 오류:', err);
        showToast('링크 복사에 실패했습니다.', 'error');
      });
  };
  
  // 신고 기능
  const handleReport = () => {
    if (!currentUser) {
      showToast('로그인 후 신고할 수 있습니다.', 'info');
      navigate('/login', { state: { from: `/community/${postId}` } });
      return;
    }
    
    // 신고 모달 열기
    openModal();
  };
  
  // 신고 제출
  const submitReport = (reason) => {
    showToast('신고가 접수되었습니다.', 'success');
    closeModal();
  };
  
  // 이미지 모달에서 이전/다음 이미지 표시
  const handlePrevImage = () => {
    setCurrentImageIndex(prev => 
      prev === 0 ? (post.imageUrls.length - 1) : prev - 1
    );
  };
  
  const handleNextImage = () => {
    setCurrentImageIndex(prev => 
      prev === post.imageUrls.length - 1 ? 0 : prev + 1
    );
  };
  
  // 이미지 전체화면 모달 열기
  const openImageModal = (index) => {
    setCurrentImageIndex(index);
    openModal();
  };
  
  // 카테고리 이름 가져오기
  const getCategoryName = (categoryId) => {
    const category = POST_CATEGORIES.find(cat => cat.id === categoryId);
    return category ? category.name : '기타';
  };
  
  // 로딩 중이거나 게시물이 없는 경우
  if (loading) {
    return <div className="text-center py-12">게시물을 불러오는 중...</div>;
  }
  
  if (!post) {
    return <div className="text-center py-12">게시물을 찾을 수 없습니다.</div>;
  }
  
  // 권한 확인 (작성자 또는 관리자만 수정/삭제 가능)
  const canModify = currentUser && (currentUser.uid === post.authorId || isAdmin);
  
  // 날짜 포맷팅
  const formattedDate = formatDate(post.createdAt, 'YYYY년 MM월 DD일 HH:mm');
  const relativeDate = formatRelativeTime(post.createdAt);
  
  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white dark:bg-dark-700 rounded-lg shadow-md">
        {/* 게시물 헤더 */}
        <div className="p-6 border-b border-gray-200 dark:border-dark-600">
          {/* 카테고리 및 날짜 정보 */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <span className="badge badge-primary">
                {getCategoryName(post.category)}
              </span>
              <span 
                className="text-sm text-gray-500 dark:text-gray-400 flex items-center"
                title={formattedDate}
              >
                <FaRegClock className="mr-1" />
                {relativeDate}
              </span>
            </div>
            
            {/* 조회수 */}
            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
              <FaRegEye className="mr-1" />
              <span>{post.viewCount || 0}</span>
            </div>
          </div>
          
          {/* 게시물 제목 */}
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {post.title}
          </h1>
          
          {/* 작성자 정보 */}
          <div className="flex items-center">
            {author && (
              <>
                {author.photoURL ? (
                  <img
                    src={author.photoURL}
                    alt={author.displayName}
                    className="w-10 h-10 rounded-full mr-3"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-600 mr-3"></div>
                )}
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {author.displayName}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {author.bio || ''}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
        
        {/* 게시물 본문 */}
        <div className="p-6">
          {/* 이미지가 있는 경우 */}
          {post.imageUrls && post.imageUrls.length > 0 && (
            <div className="mb-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {post.imageUrls.map((url, index) => (
                  <div 
                    key={index}
                    className="cursor-pointer"
                    onClick={() => openImageModal(index)}
                  >
                    <img
                      src={url}
                      alt={`이미지 ${index + 1}`}
                      className="w-full h-60 object-cover rounded-lg border border-gray-200 dark:border-dark-600"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* 게시물 내용 */}
          <div 
            className="prose dark:prose-invert max-w-none mb-8"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
          
          {/* 게시물 액션 */}
          <div className="flex flex-wrap items-center justify-between border-t border-b border-gray-200 dark:border-dark-600 py-4 my-6">
            <div className="flex items-center space-x-4">
              {/* 좋아요 버튼 */}
              <button
                onClick={handleLikeToggle}
                className="flex items-center text-gray-600 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400"
              >
                {liked ? (
                  <FaHeart className="text-red-500 mr-1" size={20} />
                ) : (
                  <FaRegHeart className="mr-1" size={20} />
                )}
                <span>{post.likeCount || 0}</span>
              </button>
              
              {/* 댓글 수 */}
              <div className="flex items-center text-gray-600 dark:text-gray-400">
                <FaRegComment className="mr-1" size={20} />
                <span>{post.commentCount || 0}</span>
              </div>
              
              {/* 공유 버튼 */}
              <button
                onClick={handleSharePost}
                className="flex items-center text-gray-600 dark:text-gray-400 hover:text-primary-500 dark:hover:text-primary-400"
              >
                <FaShare className="mr-1" size={18} />
                <span className="hidden sm:inline">공유</span>
              </button>
              
              {/* 신고 버튼 */}
              <button
                onClick={handleReport}
                className="flex items-center text-gray-600 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400"
              >
                <FaFlag className="mr-1" size={18} />
                <span className="hidden sm:inline">신고</span>
              </button>
            </div>
            
            {/* 수정/삭제 버튼 (작성자 또는 관리자만 표시) */}
            {canModify && (
              <div className="flex items-center space-x-2 mt-2 sm:mt-0">
                <button
                  onClick={handleEditPost}
                  className="flex items-center text-gray-600 dark:text-gray-400 hover:text-primary-500 dark:hover:text-primary-400"
                >
                  <FaEdit className="mr-1" size={18} />
                  <span>수정</span>
                </button>
                <button
                  onClick={handleDeletePost}
                  className="flex items-center text-gray-600 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400"
                >
                  <FaTrash className="mr-1" size={18} />
                  <span>삭제</span>
                </button>
              </div>
            )}
          </div>
          
          {/* 댓글 섹션 */}
          <div className="mt-8">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              댓글 ({post.commentCount || 0})
            </h3>
            
            {/* 댓글 작성 폼 */}
            <CommentForm postId={postId} />
            
            {/* 댓글 목록 */}
            <div className="mt-6">
              <CommentList postId={postId} />
            </div>
          </div>
        </div>
      </div>
      
      {/* 이전, 다음 게시물 링크 (추후 구현) */}
      <div className="flex justify-between mt-6">
        <Link
          to="/community"
          className="btn btn-outline"
        >
          목록으로
        </Link>
      </div>
      
      {/* 이미지 모달 */}
      <Modal
        isOpen={isOpen && post.imageUrls && post.imageUrls.length > 0}
        onClose={closeModal}
        size="large"
        centerContent={true}
      >
        <div className="relative">
          <img
            src={post.imageUrls?.[currentImageIndex]}
            alt="이미지 보기"
            className="max-w-full max-h-[80vh] object-contain"
          />
          
          {/* 이미지가 여러 개일 경우 이전/다음 버튼 표시 */}
          {post.imageUrls && post.imageUrls.length > 1 && (
            <>
              <button
                onClick={handlePrevImage}
                className="absolute top-1/2 left-2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full"
              >
                &lt;
              </button>
              <button
                onClick={handleNextImage}
                className="absolute top-1/2 right-2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full"
              >
                &gt;
              </button>
              <div className="text-center text-sm mt-2 text-gray-600 dark:text-gray-400">
                {currentImageIndex + 1} / {post.imageUrls.length}
              </div>
            </>
          )}
        </div>
      </Modal>
      
      {/* 신고 모달 */}
      <Modal
        isOpen={isOpen && (!post.imageUrls || post.imageUrls.length === 0)}
        onClose={closeModal}
        title="게시물 신고"
        size="small"
      >
        <div className="p-4">
          <p className="mb-4 text-gray-700 dark:text-gray-300">
            이 게시물을 신고하는 이유를 선택해주세요:
          </p>
          <div className="space-y-2">
            {[
              '스팸 또는 광고',
              '음란물 또는 성적인 내용',
              '혐오 발언 또는 악의적인 내용',
              '폭력적인 내용 또는 괴롭힘',
              '개인정보 침해',
              '저작권 침해',
              '기타 사유'
            ].map((reason, index) => (
              <button
                key={index}
                onClick={() => submitReport(reason)}
                className="w-full text-left p-2 rounded hover:bg-gray-100 dark:hover:bg-dark-600"
              >
                {reason}
              </button>
            ))}
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default PostDetail;