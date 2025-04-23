import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPaperPlane, FaTimes } from 'react-icons/fa';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { addComment, updateComment } from '../../services/postService';

const CommentForm = ({
  postId,
  commentId = null,
  parentId = null,
  initialValue = '',
  onSuccess = () => {},
  onCancel = () => {},
  isEdit = false,
  isReply = false
}) => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { showToast } = useToast();
  
  const [commentText, setCommentText] = useState(initialValue);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // 댓글 제출 처리
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 빈 댓글 체크
    if (!commentText.trim()) {
      showToast('댓글 내용을 입력해주세요.', 'warning');
      return;
    }
    
    // 로그인 체크
    if (!currentUser) {
      showToast('로그인 후 댓글을 작성할 수 있습니다.', 'info');
      navigate('/login', { state: { from: `/community/${postId}` } });
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      if (isEdit) {
        // 댓글 수정
        const result = await updateComment(postId, commentId, commentText);
        
        if (result.success) {
          showToast('댓글이 수정되었습니다.', 'success');
          onSuccess(commentText);
        } else {
          showToast(result.error || '댓글 수정에 실패했습니다.', 'error');
        }
      } else {
        // 새 댓글 작성
        const commentData = {
          text: commentText,
          authorId: currentUser.uid,
          parentId: parentId
        };
        
        const result = await addComment(postId, commentData);
        
        if (result.success) {
          // 새 댓글 데이터 구성
          const newComment = {
            id: result.commentId,
            text: commentText,
            authorId: currentUser.uid,
            parentId: parentId,
            createdAt: new Date(),
            isEdited: false
          };
          
          showToast(isReply ? '답글이 작성되었습니다.' : '댓글이 작성되었습니다.', 'success');
          onSuccess(newComment);
          setCommentText(''); // 폼 초기화
        } else {
          showToast(result.error || '댓글 작성에 실패했습니다.', 'error');
        }
      }
    } catch (error) {
      console.error('댓글 저장 오류:', error);
      showToast('서버 오류가 발생했습니다. 다시 시도해주세요.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="mt-2">
      <div className="relative">
        <textarea
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 dark:border-dark-500 rounded-lg focus:ring-primary-500 focus:border-primary-500 dark:bg-dark-700 dark:text-white"
          placeholder={isReply ? "답글을 작성하세요..." : "댓글을 작성하세요..."}
          rows={3}
          disabled={isSubmitting}
        />
        
        <div className="flex justify-end mt-2 space-x-2">
          {/* 취소 버튼 (수정 또는 답글 작성 시에만 표시) */}
          {(isEdit || isReply) && (
            <button
              type="button"
              onClick={onCancel}
              className="px-3 py-1.5 text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-md dark:text-gray-300 dark:bg-dark-600 dark:hover:bg-dark-500"
              disabled={isSubmitting}
            >
              <FaTimes className="inline mr-1" size={12} />
              취소
            </button>
          )}
          
          {/* 제출 버튼 */}
          <button
            type="submit"
            className="px-3 py-1.5 text-sm text-white bg-primary-600 hover:bg-primary-700 rounded-md dark:bg-primary-700 dark:hover:bg-primary-800"
            disabled={isSubmitting}
          >
            <FaPaperPlane className="inline mr-1" size={12} />
            {isSubmitting 
              ? '처리 중...' 
              : isEdit
                ? '수정'
                : isReply
                  ? '답글 작성'
                  : '댓글 작성'
            }
          </button>
        </div>
      </div>
    </form>
  );
};

export default CommentForm;