import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaImage, FaTimes, FaSpinner } from 'react-icons/fa';
import { useAuth } from '../hooks/useAuth';
import { useLoading } from '../hooks/useLoading';
import { useToast } from '../hooks/useToast';
import { uploadGalleryImage } from '../services/galleryService';
import { MAX_UPLOAD_LIMITS } from '../utils/constants';

const GalleryUploadPage = () => {
  const { currentUser } = useAuth();
  const { isLoading, startLoading, stopLoading } = useLoading();
  const { showToast } = useToast();
  const navigate = useNavigate();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedIdol, setSelectedIdol] = useState('');
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  
  const fileInputRef = useRef(null);
  
  // 사용자 인증 확인
  useEffect(() => {
    if (!currentUser) {
      showToast('로그인이 필요합니다.', 'error');
      navigate('/login', { state: { from: '/gallery/upload' } });
    }
  }, [currentUser, navigate, showToast]);
  
  // 이미지 파일 선택 핸들러
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    
    if (!file) {
      return;
    }
    
    // 파일 크기 제한 (5MB)
    if (file.size > MAX_UPLOAD_LIMITS.PROFILE_PHOTO_SIZE_MB * 1024 * 1024) {
      showToast(`이미지 크기는 ${MAX_UPLOAD_LIMITS.PROFILE_PHOTO_SIZE_MB}MB 이하만 가능합니다.`, 'error');
      return;
    }
    
    // 파일 타입 확인
    if (!file.type.startsWith('image/')) {
      showToast('이미지 파일만 업로드할 수 있습니다.', 'error');
      return;
    }
    
    setImageFile(file);
    
    // 이미지 미리보기 생성
    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };
  
  // 이미지 선택 버튼 클릭 핸들러
  const handleSelectImage = () => {
    fileInputRef.current.click();
  };
  
  // 이미지 제거 핸들러
  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  // 태그 추가 핸들러
  const handleAddTag = (e) => {
    e.preventDefault();
    
    if (!tagInput.trim()) {
      return;
    }
    
    // 태그 중복 확인
    if (tags.includes(tagInput.trim())) {
      showToast('이미 추가된 태그입니다.', 'warning');
      return;
    }
    
    // 태그 최대 개수 제한 (10개)
    if (tags.length >= 10) {
      showToast('태그는 최대 10개까지 추가할 수 있습니다.', 'warning');
      return;
    }
    
    setTags([...tags, tagInput.trim()]);
    setTagInput('');
  };
  
  // 태그 제거 핸들러
  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };
  
  // 폼 제출 핸들러
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!title.trim()) {
      showToast('제목을 입력해주세요.', 'warning');
      return;
    }
    
    if (!imageFile) {
      showToast('이미지를 선택해주세요.', 'warning');
      return;
    }
    
    startLoading();
    
    try {
      // 이미지 데이터 생성
      const imageData = {
        title: title.trim(),
        description: description.trim(),
        idolId: selectedIdol || null,
        tags: tags.length > 0 ? tags : [],
      };
      
      // 이미지 업로드
      const result = await uploadGalleryImage(imageData, imageFile, currentUser.uid);
      
      if (result.success) {
        showToast('이미지가 성공적으로 업로드되었습니다.', 'success');
        navigate('/gallery');
      } else {
        showToast(result.error || '이미지 업로드에 실패했습니다.', 'error');
      }
    } catch (error) {
      console.error('이미지 업로드 오류:', error);
      showToast('이미지 업로드 중 오류가 발생했습니다.', 'error');
    } finally {
      stopLoading();
    }
  };
  
  return (
    <div className="container-custom mx-auto px-4 py-8 mt-20">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">갤러리 이미지 업로드</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 이미지 업로드 영역 */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              이미지
            </label>
            
            {imagePreview ? (
              <div className="relative">
                <img 
                  src={imagePreview} 
                  alt="미리보기" 
                  className="w-full max-h-96 object-contain border border-gray-300 dark:border-gray-700 rounded-lg"
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors"
                  aria-label="이미지 제거"
                >
                  <FaTimes />
                </button>
              </div>
            ) : (
              <div 
                onClick={handleSelectImage}
                className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-12 text-center cursor-pointer hover:border-gray-400 dark:hover:border-gray-600 transition-colors"
              >
                <FaImage className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" />
                <p className="text-gray-600 dark:text-gray-400 mb-2">이미지를 선택하거나 드래그 앤 드롭하세요</p>
                <p className="text-sm text-gray-500 dark:text-gray-500">
                  PNG, JPG, GIF, WEBP / 최대 5MB
                </p>
              </div>
            )}
            
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
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
              placeholder="이미지 제목을 입력하세요"
              maxLength={100}
              className="form-input"
              required
            />
          </div>
          
          {/* 설명 입력 */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              설명
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="이미지에 대한 설명을 입력하세요 (선택사항)"
              className="form-textarea"
              rows={3}
            />
          </div>
          
          {/* 아이돌 선택 */}
          <div>
            <label htmlFor="idol" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              아이돌
            </label>
            <select
              id="idol"
              value={selectedIdol}
              onChange={(e) => setSelectedIdol(e.target.value)}
              className="form-select"
            >
              <option value="">아이돌 선택 (선택사항)</option>
              <option value="blackpink">블랙핑크</option>
              <option value="bts">BTS</option>
              <option value="twice">트와이스</option>
              <option value="aespa">에스파</option>
              <option value="ive">아이브</option>
            </select>
          </div>
          
          {/* 태그 입력 */}
          <div>
            <label htmlFor="tags" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              태그
            </label>
            <div className="flex">
              <input
                type="text"
                id="tags"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="태그를 입력하고 추가 버튼을 클릭하세요"
                className="form-input rounded-r-none"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="btn btn-primary rounded-l-none px-4"
              >
                추가
              </button>
            </div>
            
            {/* 태그 목록 */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2.5 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1.5 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                    >
                      <FaTimes size={12} />
                    </button>
                  </span>
                ))}
              </div>
            )}
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              태그는 이미지 검색에 사용됩니다. (최대 10개)
            </p>
          </div>
          
          {/* 제출 버튼 */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => navigate('/gallery')}
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
                  업로드 중...
                </span>
              ) : (
                '업로드'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GalleryUploadPage;