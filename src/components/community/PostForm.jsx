import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaCamera, FaTimes, FaTag, FaIdCard } from 'react-icons/fa';
import { useForm } from '../../hooks/useForm';
import { useAuth } from '../../hooks/useAuth';
import { useLoading } from '../../hooks/useLoading';
import { useToast } from '../../hooks/useToast';
import { useStorage } from '../../hooks/useStorage';
import { validatePostForm } from '../../utils/validators';
import { createPost, updatePost } from '../../services/postService';
import { searchIdols } from '../../services/idolService';
import { POST_CATEGORIES } from '../../utils/constants';

const PostForm = ({ post = null, isEdit = false }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuth();
  const { startLoading, stopLoading } = useLoading();
  const { showToast } = useToast();
  const { uploadFile, progress, isUploading } = useStorage();
  
  const [selectedImages, setSelectedImages] = useState([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedIdols, setSelectedIdols] = useState([]);
  const [showIdolSearch, setShowIdolSearch] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // URL 파라미터에서 아이돌 이름 가져오기
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const idolName = params.get('idol');
    
    if (idolName) {
      searchForIdol(idolName);
    }
  }, [location.search]);

  // 수정 모드일 때 초기값 설정
  useEffect(() => {
    if (isEdit && post) {
      setImagePreviewUrls(post.imageUrls || []);
      setSelectedIdols(post.idols || []);
    }
  }, [isEdit, post]);
  
  // 폼 상태 관리
  const initialValues = isEdit && post 
    ? { 
        title: post.title || '',
        content: post.content || '',
        category: post.category || ''
      }
    : { 
        title: '',
        content: '',
        category: ''
      };
  
  const { 
    values, 
    errors, 
    touched,
    isSubmitting,
    handleChange, 
    handleBlur, 
    handleSubmit,
    resetForm 
  } = useForm(initialValues, validatePostForm);
  
  // 이미지 선택 처리
  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length === 0) return;
    
    // 이미지 파일만 허용
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    // 최대 5개까지만 허용
    const newImages = [...selectedImages, ...imageFiles].slice(0, 5);
    setSelectedImages(newImages);
    
    // 미리보기 URL 생성
    const newImageUrls = newImages.map(file => URL.createObjectURL(file));
    setImagePreviewUrls(newImageUrls);
  };
  
  // 이미지 제거
  const removeImage = (index) => {
    const newImages = [...selectedImages];
    newImages.splice(index, 1);
    setSelectedImages(newImages);
    
    const newImageUrls = [...imagePreviewUrls];
    URL.revokeObjectURL(newImageUrls[index]); // 메모리 해제
    newImageUrls.splice(index, 1);
    setImagePreviewUrls(newImageUrls);
  };
  
  // 아이돌 검색
  const searchForIdol = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    
    try {
      const response = await searchIdols(query);
      
      if (response.success) {
        setSearchResults(response.idols);
      } else {
        console.error('아이돌 검색 실패:', response.error);
      }
    } catch (error) {
      console.error('아이돌 검색 오류:', error);
    }
  };
  
  // 검색 입력 처리
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    if (query.length >= 2) {
      searchForIdol(query);
    } else {
      setSearchResults([]);
    }
  };
  
  // 아이돌 선택
  const selectIdol = (idol) => {
    // 이미 선택된 아이돌인지 확인
    const alreadySelected = selectedIdols.some(selected => selected.id === idol.id);
    
    if (!alreadySelected) {
      setSelectedIdols([...selectedIdols, idol]);
    }
    
    setSearchQuery('');
    setSearchResults([]);
  };
  
  // 선택된 아이돌 제거
  const removeIdol = (idolId) => {
    setSelectedIdols(selectedIdols.filter(idol => idol.id !== idolId));
  };
  
  // 폼 제출 처리
  const onSubmit = async () => {
    try {
      setSubmitError('');
      startLoading(isEdit ? '게시물 수정 중...' : '게시물 작성 중...');
      
      // 이미지 업로드
      let imageUrls = [];
      
      if (selectedImages.length > 0) {
        // 이미지 업로드 (각 이미지마다 경로 생성)
        const uploadPromises = selectedImages.map((image, index) => {
          const path = `posts/${currentUser.uid}/${Date.now()}_${index}_${image.name}`;
          return uploadFile(image, path);
        });
        
        const uploadResults = await Promise.all(uploadPromises);
        imageUrls = uploadResults.map(result => result.url);
      } else if (isEdit && post && post.imageUrls) {
        // 수정 모드에서 이미지가 변경되지 않은 경우 기존 이미지 URL 사용
        imageUrls = post.imageUrls;
      }
      
      // 게시물 데이터 준비
      const postData = {
        title: values.title,
        content: values.content,
        category: values.category,
        imageUrls,
        idols: selectedIdols.map(idol => ({
          id: idol.id,
          name: idol.name,
          profileImage: idol.profileImage
        }))
      };
      
      let result;
      
      if (isEdit) {
        // 게시물 수정
        result = await updatePost(post.id, postData);
      } else {
        // 새 게시물 작성
        result = await createPost(postData);
      }
      
      if (result.success) {
        showToast(
          isEdit ? '게시물이 수정되었습니다.' : '게시물이 작성되었습니다.',
          'success'
        );
        
        if (isEdit) {
          navigate(`/community/${post.id}`);
        } else {
          navigate(`/community/${result.postId}`);
        }
      } else {
        setSubmitError(result.error || '게시물 저장 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('게시물 저장 오류:', error);
      setSubmitError('게시물 저장 중 오류가 발생했습니다.');
    } finally {
      stopLoading();
    }
  };
  
  // 폼 취소
  const handleCancel = () => {
    if (isEdit) {
      navigate(`/community/${post.id}`);
    } else {
      navigate('/community');
    }
  };
  
  return (
    <div className="mx-auto max-w-3xl">
      <div className="bg-white dark:bg-dark-700 shadow-md rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          {isEdit ? '게시물 수정' : '새 게시물 작성'}
        </h1>
        
        {/* 제출 오류 표시 */}
        {submitError && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200 rounded-md text-sm">
            {submitError}
          </div>
        )}
        
        <form onSubmit={handleSubmit(onSubmit)}>
          {/* 카테고리 선택 */}
          <div className="form-group">
            <label htmlFor="category" className="form-label">
              카테고리
            </label>
            <select
              id="category"
              name="category"
              value={values.category}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`form-select ${
                touched.category && errors.category ? 'border-red-500 dark:border-red-700' : ''
              }`}
              disabled={isSubmitting}
            >
              <option value="">카테고리 선택</option>
              {POST_CATEGORIES.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            {touched.category && errors.category && (
              <p className="form-error">{errors.category}</p>
            )}
          </div>
          
          {/* 제목 입력 */}
          <div className="form-group">
            <label htmlFor="title" className="form-label">
              제목
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={values.title}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="게시물 제목을 입력하세요"
              className={`form-input ${
                touched.title && errors.title ? 'border-red-500 dark:border-red-700' : ''
              }`}
              disabled={isSubmitting}
            />
            {touched.title && errors.title && (
              <p className="form-error">{errors.title}</p>
            )}
          </div>
          
          {/* 내용 입력 */}
          <div className="form-group">
            <label htmlFor="content" className="form-label">
              내용
            </label>
            <textarea
              id="content"
              name="content"
              value={values.content}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="게시물 내용을 입력하세요"
              rows={10}
              className={`form-textarea ${
                touched.content && errors.content ? 'border-red-500 dark:border-red-700' : ''
              }`}
              disabled={isSubmitting}
            ></textarea>
            {touched.content && errors.content && (
              <p className="form-error">{errors.content}</p>
            )}
          </div>
          
          {/* 이미지 업로드 */}
          <div className="form-group">
            <label className="form-label">이미지 (최대 5개)</label>
            
            <div className="flex flex-wrap gap-2 mb-3">
              {/* 이미지 미리보기 */}
              {imagePreviewUrls.map((url, index) => (
                <div key={index} className="relative w-24 h-24">
                  <img
                    src={url}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-full object-cover rounded-md"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center"
                    aria-label="이미지 제거"
                  >
                    <FaTimes size={12} />
                  </button>
                </div>
              ))}
              
              {/* 이미지 추가 버튼 */}
              {imagePreviewUrls.length < 5 && (
                <label className="w-24 h-24 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-md flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 dark:hover:bg-dark-600">
                  <FaCamera className="text-gray-400 mb-1" size={20} />
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    이미지 추가
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageSelect}
                    className="hidden"
                    disabled={isSubmitting || isUploading}
                  />
                </label>
              )}
            </div>
            
            {/* 업로드 진행 상태 */}
            {progress > 0 && progress < 100 && (
              <div className="mt-2">
                <div className="h-2 bg-gray-200 dark:bg-dark-500 rounded-full">
                  <div 
                    className="h-full bg-primary-600 dark:bg-primary-700 rounded-full" 
                    style={{width: `${progress}%`}}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {progress}% 업로드됨
                </p>
              </div>
            )}
          </div>
          
          {/* 아이돌 태그 */}
          <div className="form-group">
            <label className="form-label flex items-center">
              <FaIdCard className="mr-1" /> 
              관련 아이돌
            </label>
            
            {/* 선택된 아이돌 표시 */}
            <div className="flex flex-wrap gap-2 mb-3">
              {selectedIdols.map((idol) => (
                <div 
                  key={idol.id}
                  className="flex items-center gap-1 bg-gray-100 dark:bg-dark-600 text-gray-800 dark:text-gray-200 px-2 py-1 rounded-full text-sm"
                >
                  {idol.profileImage && (
                    <img 
                      src={idol.profileImage} 
                      alt={idol.name} 
                      className="w-4 h-4 rounded-full object-cover"
                    />
                  )}
                  <span>{idol.name}</span>
                  <button
                    type="button"
                    onClick={() => removeIdol(idol.id)}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    aria-label={`${idol.name} 태그 제거`}
                  >
                    <FaTimes size={10} />
                  </button>
                </div>
              ))}
              
              {/* 아이돌 추가 버튼 */}
              <button
                type="button"
                onClick={() => setShowIdolSearch(!showIdolSearch)}
                className="flex items-center gap-1 bg-gray-100 dark:bg-dark-600 text-gray-800 dark:text-gray-200 px-2 py-1 rounded-full text-sm hover:bg-gray-200 dark:hover:bg-dark-500"
              >
                <FaTag size={12} />
                <span>아이돌 추가</span>
              </button>
            </div>
            
            {/* 아이돌 검색 */}
            {showIdolSearch && (
              <div className="mb-4 p-3 border border-gray-200 dark:border-dark-600 rounded-md">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  placeholder="아이돌 이름 검색"
                  className="form-input mb-2"
                />
                
                {/* 검색 결과 */}
                {searchResults.length > 0 && (
                  <div className="max-h-40 overflow-y-auto">
                    <ul className="divide-y divide-gray-200 dark:divide-dark-600">
                      {searchResults.map((idol) => (
                        <li key={idol.id} className="py-2">
                          <button
                            type="button"
                            onClick={() => selectIdol(idol)}
                            className="w-full flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-dark-600 p-1 rounded"
                          >
                            <img 
                              src={idol.profileImage || '/asset/images/default-idol.png'} 
                              alt={idol.name} 
                              className="w-8 h-8 rounded-full object-cover"
                            />
                            <div className="text-left">
                              <p className="text-gray-900 dark:text-white font-medium">
                                {idol.name}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {idol.group || '솔로'}
                              </p>
                            </div>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {searchQuery.length >= 2 && searchResults.length === 0 && (
                  <p className="text-gray-500 dark:text-gray-400 text-sm py-1">
                    검색 결과가 없습니다.
                  </p>
                )}
              </div>
            )}
          </div>
          
          {/* 제출 및 취소 버튼 */}
          <div className="flex gap-3 mt-6">
            <button
              type="submit"
              className="btn btn-primary flex-1"
              disabled={isSubmitting || isUploading}
            >
              {isSubmitting || isUploading
                ? (isEdit ? '수정 중...' : '게시 중...')
                : (isEdit ? '수정하기' : '게시하기')}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="btn btn-outline"
              disabled={isSubmitting || isUploading}
            >
              취소
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PostForm;