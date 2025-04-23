import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import PostDetail from '../components/community/PostDetail';
import Loading from '../components/common/Loading';
import { useToast } from '../hooks/useToast';
import { getPostById } from '../services/postService';

const PostDetailPage = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  
  // 게시물 존재 여부 확인
  useEffect(() => {
    const checkPostExists = async () => {
      try {
        setLoading(true);
        const response = await getPostById(postId);
        
        if (!response.success) {
          setNotFound(true);
          showToast('존재하지 않는 게시물입니다.', 'error');
        }
      } catch (error) {
        console.error('게시물 조회 오류:', error);
        showToast('게시물을 불러오는 중 오류가 발생했습니다.', 'error');
        navigate('/community');
      } finally {
        setLoading(false);
      }
    };
    
    if (postId) {
      checkPostExists();
    } else {
      setNotFound(true);
    }
  }, [postId, navigate, showToast]);
  
  // 로딩 중
  if (loading) {
    return (
      <div className="container-custom mx-auto px-4 py-8">
        <Loading message="게시물을 불러오는 중..." />
      </div>
    );
  }
  
  // 게시물을 찾을 수 없음
  if (notFound) {
    return (
      <div className="container-custom mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            존재하지 않는 게시물입니다
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            요청하신 게시물을 찾을 수 없습니다.
          </p>
          <Link 
            to="/community"
            className="btn btn-primary"
          >
            커뮤니티로 돌아가기
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container-custom mx-auto px-4 py-8">
      {/* 상단 네비게이션 */}
      <div className="mb-6">
        <Link 
          to="/community"
          className="inline-flex items-center text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
        >
          <FaArrowLeft className="mr-2" size={14} />
          커뮤니티로 돌아가기
        </Link>
      </div>
      
      {/* 게시물 상세 컴포넌트 */}
      <PostDetail postId={postId} />
    </div>
  );
};

export default PostDetailPage;