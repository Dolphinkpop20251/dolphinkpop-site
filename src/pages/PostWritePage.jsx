import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaRegImage, FaSpinner, FaTimes } from 'react-icons/fa';
import { useAuth } from '../hooks/useAuth';
import { useLoading } from '../hooks/useLoading';
import { useToast } from '../hooks/useToast';
import { createPost, getPostById, updatePost } from '../services/postService';
import { POST_CATEGORIES, MAX_UPLOAD_LIMITS } from '../utils/constants';
import RichTextEditor from '../components/common/RichTextEditor';

const PostWritePage = () => {
  const { postId } = useParams(); // 수정 모드인 경우 postId가 있음
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { isLoading, startLoading, stopLoading } = useLoading();
  const { showToast } = useToast();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('general');
  const [images, setImages] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const [isEdit, setIsEdit] = useState(false);
  const [originalPost, setOriginalPost] = useState(null);

  // 사용자 인증 확인
  useEffect(() => {
    if (!currentUser) {
      showToast('로그인이 필요합니다.', 'error');
      navigate('/login', { state: { from: '/community/write' } });
    }
  }, [currentUser, navigate, showToast]);

  // 수정 모드인 경우 게시글 데이터 가져오기
  useEffect(() => {
    const fetchPostData = async () => {
      if (postId) {
        startLoading();
        try {
          const result = await getPostById(postId);
          if (result.success) {
            const post = result.post;
            
            // 작성자 확인
            if (post.authorId !== currentUser?.uid) {
              showToast('게시글 수정 권한이 없습니다.', 'error');
              navigate(`/community/${postId}`);
              return;
            }
            
            setTitle(post.title || '');
            setContent(post.content || '');
            setCategory(post.category || 'general');
            setImages(post.imageUrls || []);
            setIsEdit(true);
            setOriginalPost(post);
          } else {
            showToast('게시글을 불러올 수 없습니다.', 'error');
            navigate('/community');
          }
        } catch (error) {
          showToast('게시글을 불러오는 중 오류가 발생했습니다.', 'error');
          navigate('/community');
        } finally {
          stopLoading();
        }
      }
    };
    
    if (currentUser) {
      fetchPostData();
    }
  }, [postId, currentUser, navigate, showToast, startLoading, stopLoading]);

  // 이미지 파일 처리
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    
    // 이미지 최대 개수 제한
    if (images.length + files.length > MAX_UPLOAD_LIMITS.POST_IMAGES) {
      showToast(`이미지는 최대 ${MAX_UPLOAD_LIMITS.POST_IMAGES}개까지 업로드할 수 있습니다.`, 'warning');
      return;
    }
    
    // 이미지 미리보기 및 파일 저장
    const newImagePreviews = files.map(file => URL.createObjectURL(file));
    setImages(prev => [...prev, ...newImagePreviews]);
    setImageFiles(prev => [...prev, ...files]);
  };

  // 미리보기 이미지 삭제
  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImageFiles(prev => prev.filter((_, i) => i !== index));
  };

  // 폼 제출 처리
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!title.trim()) {
      showToast('제목을 입력해주세요.', 'warning');
      return;
    }
    
    if (!content.trim()) {
      showToast('내용을 입력해주세요.', 'warning');
      return;
    }
    
    startLoading();
    
    try {
      const postData = {
        title: title.trim(),
        content,
        category
      };
      
      let result;
      
      if (isEdit) {
        // 게시글 수정
        result = await updatePost(postId, postData, imageFiles);
      } else {
        // 게시글 생성
        result = await createPost(postData, currentUser.uid, imageFiles);
      }
      
      if (result.success) {
        showToast(
          isEdit ? '게시글이 수정되었습니다.' : '게시글이 작성되었습니다.',
          'success'
        );
        
        // 게시글 상세 페이지로 이동
        navigate(isEdit ? `/community/${postId}` : `/community/${result.postId}`);
      } else {
        showToast(
          isEdit ? '게시글 수정에 실패했습니다.' : '게시글 작성에 실패했습니다.',
          'error'
        );
      }
    } catch (error) {
      showToast('오류가 발생했습니다. 다시 시도해주세요.', 'error');
    } finally {
      stopLoading();
    }
  };

  return (
    <div className="container-custom mx-auto px-4 py-8 mt-20">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">
          {isEdit ? '게시글 수정' : '새 게시글 작성'}
        </h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 카테고리 선택 */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              카테고리
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="form-select"
              required
            >
              {POST_CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          
          {/* 제목 입력 */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              제목
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="제목을 입력하세요"
              maxLength={100}
              className="form-input"
              required
            />
          </div>
          
          {/* 본문 에디터 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              내용
            </label>
            <RichTextEditor
              initialValue={content}
              onChange={setContent}
              placeholder="내용을 입력하세요"
              minHeight="300px"
            />
          </div>
          
          {/* 이미지 업로드 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              이미지 (최대 {MAX_UPLOAD_LIMITS.POST_IMAGES}개)
            </label>
            
            <div className="mt-2 flex flex-wrap gap-4">
              {/* 현재 이미지 미리보기 */}
              {images.map((image, index) => (
                <div 
                  key={index} 
                  className="relative w-24 h-24 border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden group"
                >
                  <img 
                    src={image} 
                    alt={`첨부 ${index + 1}`} 
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="이미지 삭제"
                  >
                    <FaTimes size={12} />
                  </button>
                </div>
              ))}
              
              {/* 이미지 추가 버튼 */}
              {images.length < MAX_UPLOAD_LIMITS.POST_IMAGES && (
                <label className="w-24 h-24 flex flex-col items-center justify-center cursor-pointer border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-md hover:border-gray-400 dark:hover:border-gray-600 transition-colors">
                  <FaRegImage className="w-8 h-8 text-gray-400 dark:text-gray-500 mb-1" />
                  <span className="text-xs text-gray-500 dark:text-gray-400">이미지 추가</span>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                  />
                </label>
              )}
            </div>
            
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              지원 형식: JPG, PNG, GIF (각 파일 최대 5MB)
            </p>
          </div>
          
          {/* 작성/수정 버튼 */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="btn btn-outline"
            >
              취소
            </button>
            
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center">
                  <FaSpinner className="animate-spin mr-2" />
                  저장 중...
                </span>
              ) : (
                isEdit ? '수정 완료' : '작성 완료'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PostWritePage;