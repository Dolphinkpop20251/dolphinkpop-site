import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaReply, FaEdit, FaTrash, FaRegClock } from 'react-icons/fa';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { getComments, deleteComment } from '../../services/postService';
import { getUserBasicProfile } from '../../services/userService';
import { formatRelativeTime } from '../../utils/formatters';
import CommentForm from './CommentForm';

const CommentList = ({ postId }) => {
  const { currentUser, isAdmin } = useAuth();
  const { showToast } = useToast();
  
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeReplyId, setActiveReplyId] = useState(null);
  const [activeEditId, setActiveEditId] = useState(null);
  const [commentAuthors, setCommentAuthors] = useState({});
  
  // 댓글 목록 불러오기
  useEffect(() => {
    const fetchComments = async () => {
      try {
        setLoading(true);
        const response = await getComments(postId);
        
        if (response.success) {
          // 부모/자식 관계로 댓글 구조화
          const structuredComments = structureComments(response.comments);
          setComments(structuredComments);
          
          // 작성자 정보 불러오기
          await fetchCommentAuthors(response.comments);
        } else {
          showToast('댓글을 불러올 수 없습니다.', 'error');
        }
      } catch (error) {
        console.error('댓글 조회 오류:', error);
        showToast('댓글을 불러오는 중 오류가 발생했습니다.', 'error');
      } finally {
        setLoading(false);
      }
    };
    
    fetchComments();
  }, [postId, showToast]);
  
  // 댓글 구조화 (부모/자식 관계)
  const structureComments = (flatComments) => {
    const commentMap = {};
    const rootComments = [];
    
    // 모든 댓글을 맵에 저장
    flatComments.forEach(comment => {
      commentMap[comment.id] = {
        ...comment,
        children: []
      };
    });
    
    // 부모/자식 관계 구성
    flatComments.forEach(comment => {
      if (comment.parentId) {
        // 부모 댓글이 존재하면 자식으로 추가
        if (commentMap[comment.parentId]) {
          commentMap[comment.parentId].children.push(commentMap[comment.id]);
        } else {
          // 부모가 삭제된 경우 최상위로 처리
          rootComments.push(commentMap[comment.id]);
        }
      } else {
        // 최상위 댓글
        rootComments.push(commentMap[comment.id]);
      }
    });
    
    return rootComments;
  };
  
  // 작성자 정보 가져오기
  const fetchCommentAuthors = async (comments) => {
    const uniqueAuthorIds = [...new Set(comments.map(comment => comment.authorId))];
    
    const authorsData = {};
    await Promise.all(
      uniqueAuthorIds.map(async (authorId) => {
        try {
          const result = await getUserBasicProfile(authorId);
          if (result.success) {
            authorsData[authorId] = result.profile;
          }
        } catch (error) {
          console.error('작성자 정보 로딩 오류:', error);
        }
      })
    );
    
    setCommentAuthors(authorsData);
  };
  
  // 답글 작성 폼 토글
  const toggleReplyForm = (commentId) => {
    setActiveReplyId(activeReplyId === commentId ? null : commentId);
    setActiveEditId(null); // 수정 폼 닫기
  };
  
  // 댓글 수정 폼 토글
  const toggleEditForm = (commentId) => {
    setActiveEditId(activeEditId === commentId ? null : commentId);
    setActiveReplyId(null); // 답글 폼 닫기
  };
  
  // 댓글 삭제
  const handleDeleteComment = async (commentId) => {
    if (window.confirm('정말로 이 댓글을 삭제하시겠습니까?')) {
      try {
        const result = await deleteComment(postId, commentId);
        
        if (result.success) {
          showToast('댓글이 삭제되었습니다.', 'success');
          
          // 댓글 목록 업데이트 (해당 댓글 및 자식 댓글 제거)
          setComments(prevComments => removeComment(prevComments, commentId));
        } else {
          showToast(result.error || '댓글 삭제에 실패했습니다.', 'error');
        }
      } catch (error) {
        console.error('댓글 삭제 오류:', error);
        showToast('댓글 삭제 중 오류가 발생했습니다.', 'error');
      }
    }
  };
  
  // 댓글 삭제 후 목록 업데이트
  const removeComment = (comments, commentId) => {
    return comments.filter(comment => {
      if (comment.id === commentId) {
        return false;
      }
      
      if (comment.children && comment.children.length > 0) {
        comment.children = removeComment(comment.children, commentId);
      }
      
      return true;
    });
  };
  
  // 새 댓글 추가
  const handleAddComment = (newComment, parentId = null) => {
    if (parentId) {
      // 답글인 경우
      setComments(prevComments => addReplyToComment(prevComments, parentId, newComment));
      setActiveReplyId(null); // 답글 폼 닫기
    } else {
      // 최상위 댓글인 경우
      setComments(prevComments => [
        ...prevComments,
        { ...newComment, children: [] }
      ]);
    }
  };
  
  // 특정 댓글에 답글 추가
  const addReplyToComment = (comments, parentId, newReply) => {
    return comments.map(comment => {
      if (comment.id === parentId) {
        return {
          ...comment,
          children: [...comment.children, { ...newReply, children: [] }]
        };
      }
      
      if (comment.children && comment.children.length > 0) {
        return {
          ...comment,
          children: addReplyToComment(comment.children, parentId, newReply)
        };
      }
      
      return comment;
    });
  };
  
  // 댓글 수정
  const handleUpdateComment = (commentId, updatedText) => {
    setComments(prevComments => updateCommentInList(prevComments, commentId, updatedText));
    setActiveEditId(null); // 수정 폼 닫기
  };
  
  // 댓글 목록에서 특정 댓글 수정
  const updateCommentInList = (comments, commentId, updatedText) => {
    return comments.map(comment => {
      if (comment.id === commentId) {
        return {
          ...comment,
          text: updatedText,
          isEdited: true
        };
      }
      
      if (comment.children && comment.children.length > 0) {
        return {
          ...comment,
          children: updateCommentInList(comment.children, commentId, updatedText)
        };
      }
      
      return comment;
    });
  };
  
  // 댓글 렌더링 (재귀 함수)
  const renderComment = (comment, depth = 0) => {
    const author = commentAuthors[comment.authorId];
    const isAuthor = currentUser && currentUser.uid === comment.authorId;
    const canModify = isAuthor || isAdmin;
    const formattedDate = formatRelativeTime(comment.createdAt);
    
    return (
      <div 
        key={comment.id} 
        className={`mb-4 ${depth > 0 ? 'ml-8 pl-4 border-l-2 border-gray-200 dark:border-dark-500' : ''}`}
      >
        <div className="bg-gray-50 dark:bg-dark-800 rounded-lg p-4">
          {/* 댓글 헤더 */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              {/* 작성자 프로필 */}
              {author ? (
                <Link to={`/profile/${comment.authorId}`} className="flex items-center">
                  {author.photoURL ? (
                    <img 
                      src={author.photoURL} 
                      alt={author.displayName} 
                      className="w-8 h-8 rounded-full mr-2"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 mr-2"></div>
                  )}
                  <span className="font-medium text-gray-900 dark:text-white">
                    {author.displayName}
                  </span>
                </Link>
              ) : (
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 mr-2"></div>
                  <span className="font-medium text-gray-900 dark:text-white">
                    사용자
                  </span>
                </div>
              )}
              
              {/* 작성 시간 */}
              <span className="ml-2 text-xs text-gray-500 dark:text-gray-400 flex items-center">
                <FaRegClock className="mr-1" />
                {formattedDate}
                {comment.isEdited && <span className="ml-1">(수정됨)</span>}
              </span>
            </div>
            
            {/* 수정/삭제 버튼 */}
            {canModify && (
              <div className="flex space-x-2">
                <button
                  onClick={() => toggleEditForm(comment.id)}
                  className="text-xs text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400"
                >
                  <FaEdit />
                </button>
                <button
                  onClick={() => handleDeleteComment(comment.id)}
                  className="text-xs text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
                >
                  <FaTrash />
                </button>
              </div>
            )}
          </div>
          
          {/* 댓글 내용 */}
          {activeEditId === comment.id ? (
            <CommentForm
              postId={postId}
              commentId={comment.id}
              initialValue={comment.text}
              onSuccess={(updatedText) => handleUpdateComment(comment.id, updatedText)}
              onCancel={() => setActiveEditId(null)}
              isEdit={true}
            />
          ) : (
            <div className="text-gray-800 dark:text-gray-200">
              {comment.text}
            </div>
          )}
          
          {/* 답글 버튼 */}
          {currentUser && (
            <div className="mt-2 flex justify-end">
              <button
                onClick={() => toggleReplyForm(comment.id)}
                className="text-xs text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 flex items-center"
              >
                <FaReply className="mr-1" />
                {activeReplyId === comment.id ? '취소' : '답글'}
              </button>
            </div>
          )}
          
          {/* 답글 폼 */}
          {activeReplyId === comment.id && (
            <div className="mt-3">
              <CommentForm
                postId={postId}
                parentId={comment.id}
                onSuccess={(newComment) => handleAddComment(newComment, comment.id)}
                onCancel={() => setActiveReplyId(null)}
                isReply={true}
              />
            </div>
          )}
        </div>
        
        {/* 자식 댓글 (재귀적 렌더링) */}
        {comment.children && comment.children.length > 0 && (
          <div className="mt-3">
            {comment.children.map(childComment => renderComment(childComment, depth + 1))}
          </div>
        )}
      </div>
    );
  };
  
  // 로딩 중
  if (loading) {
    return <div className="text-center py-4">댓글을 불러오는 중...</div>;
  }
  
  // 댓글 없음
  if (comments.length === 0) {
    return (
      <div className="text-center py-6 text-gray-500 dark:text-gray-400">
        첫 댓글을 작성해보세요!
      </div>
    );
  }
  
  return (
    <div className="space-y-2">
      {comments.map(comment => renderComment(comment))}
    </div>
  );
};

export default CommentList;