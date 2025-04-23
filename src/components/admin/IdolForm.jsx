import React, { useState, useRef, useEffect } from 'react';
import { FaImage, FaTimes, FaSave, FaUndo } from 'react-icons/fa';
import { useToast } from '../../hooks/useToast';
import { useLoading } from '../../hooks/useLoading';
import { addIdol, updateIdol } from '../../services/idolService';

const IdolForm = ({ initialData, onSuccess, onCancel }) => {
  const { showToast } = useToast();
  const { startLoading, stopLoading, isLoading } = useLoading();
  const fileInputRef = useRef(null);
  
  const defaultFormData = {
    name: '',
    engName: '',
    group: '',
    birthdate: '',
    position: '',
    company: '',
    bio: '',
    debutYear: new Date().getFullYear(),
    socialLinks: {
      instagram: '',
      twitter: '',
      youtube: ''
    }
  };
  
  const [formData, setFormData] = useState(initialData || defaultFormData);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [errors, setErrors] = useState({});
  
  // 초기 데이터 설정
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
      setImagePreview(initialData.photoURL || null);
    } else {
      setFormData(defaultFormData);
      setImageFile(null);
      setImagePreview(null);
    }
    setErrors({});
  }, [initialData]);
  
  // 입력 처리
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      // 중첩된 필드 (예: socialLinks.instagram)
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // 오류 지우기
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };
  
  // 이미지 선택 처리
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // 타입 체크
    if (!file.type.match('image.*')) {
      showToast('이미지 파일만 업로드할 수 있습니다.', 'error');
      return;
    }
    
    // 크기 체크 (5MB 제한)
    if (file.size > 5 * 1024 * 1024) {
      showToast('이미지 크기는 5MB 이하여야 합니다.', 'error');
      return;
    }
    
    setImageFile(file);
    if (imagePreview && imagePreview !== initialData?.photoURL) {
      URL.revokeObjectURL(imagePreview);
    }
    setImagePreview(URL.createObjectURL(file));
  };
  
  // 폼 검증
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = '이름은 필수 항목입니다.';
    }
    
    if (!formData.group.trim()) {
      newErrors.group = '그룹명은 필수 항목입니다.';
    }
    
    if (!initialData && !imageFile && !imagePreview) {
      newErrors.image = '아이돌 이미지는 필수 항목입니다.';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // 폼 제출
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      showToast('입력 정보를 확인해주세요.', 'error');
      return;
    }
    
    startLoading();
    
    try {
      const idolData = { ...formData };
      let result;
      
      if (initialData) {
        // 아이돌 정보 수정
        result = await updateIdol(initialData.id, idolData, imageFile);
      } else {
        // 새 아이돌 추가
        result = await addIdol(idolData, imageFile);
      }
      
      if (result.success) {
        showToast(
          initialData 
            ? '아이돌 정보가 수정되었습니다.' 
            : '새 아이돌이 추가되었습니다.',
          'success'
        );
        
        // 폼 리셋
        setFormData(defaultFormData);
        setImageFile(null);
        if (imagePreview && imagePreview !== initialData?.photoURL) {
          URL.revokeObjectURL(imagePreview);
        }
        setImagePreview(null);
        setErrors({});
        
        if (onSuccess) onSuccess();
      } else {
        showToast(result.error || '처리 중 오류가 발생했습니다.', 'error');
      }
    } catch (error) {
      console.error('아이돌 처리 오류:', error);
      showToast('처리 중 오류가 발생했습니다.', 'error');
    } finally {
      stopLoading();
    }
  };
  
  // 폼 리셋
  const handleReset = () => {
    if (initialData) {
      setFormData(initialData);
      setImageFile(null);
      setImagePreview(initialData.photoURL || null);
    } else {
      setFormData(defaultFormData);
      setImageFile(null);
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
      setImagePreview(null);
    }
    setErrors({});
  };
  
  // 취소 처리
  const handleCancel = () => {
    if (onCancel) {
      // 이미지 미리보기 URL 해제
      if (imagePreview && imagePreview !== initialData?.photoURL) {
        URL.revokeObjectURL(imagePreview);
      }
      onCancel();
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* 이미지 업로드 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          아이돌 이미지 {!initialData && <span className="text-red-500">*</span>}
        </label>
        
        {imagePreview ? (
          <div className="relative w-full h-48 mb-2">
            <img 
              src={imagePreview} 
              alt="아이돌 이미지 미리보기" 
              className="w-full h-full object-cover rounded-lg"
            />
            <button
              type="button"
              onClick={() => {
                setImageFile(null);
                if (imagePreview !== initialData?.photoURL) {
                  URL.revokeObjectURL(imagePreview);
                }
                setImagePreview(initialData?.photoURL || null);
              }}
              className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
            >
              <FaTimes size={14} />
            </button>
          </div>
        ) : (
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-4 text-center cursor-pointer h-48 flex flex-col items-center justify-center"
          >
            <FaImage className="h-8 w-8 text-gray-400 mb-2" />
            <p className="text-sm text-gray-500">
              이미지를 선택하거나 드래그하세요
            </p>
          </div>
        )}
        
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImageChange}
          accept="image/*"
          className="hidden"
        />
        
        {errors.image && (
          <p className="mt-1 text-sm text-red-600">{errors.image}</p>
        )}
      </div>
      
      {/* 기본 정보 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 이름 */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            이름 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={`form-input ${errors.name ? 'border-red-500' : ''}`}
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name}</p>
          )}
        </div>
        
        {/* 영문 이름 */}
        <div>
          <label htmlFor="engName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            영문 이름
          </label>
          <input
            type="text"
            id="engName"
            name="engName"
            value={formData.engName}
            onChange={handleChange}
            className="form-input"
          />
        </div>
        
        {/* 그룹 */}
        <div>
          <label htmlFor="group" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            그룹 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="group"
            name="group"
            value={formData.group}
            onChange={handleChange}
            className={`form-input ${errors.group ? 'border-red-500' : ''}`}
          />
          {errors.group && (
            <p className="mt-1 text-sm text-red-600">{errors.group}</p>
          )}
        </div>
        
        {/* 데뷔 연도 */}
        <div>
          <label htmlFor="debutYear" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            데뷔 연도
          </label>
          <input
            type="number"
            id="debutYear"
            name="debutYear"
            value={formData.debutYear}
            onChange={handleChange}
            min="1990"
            max={new Date().getFullYear()}
            className="form-input"
          />
        </div>
        
        {/* 생년월일 */}
        <div>
          <label htmlFor="birthdate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            생년월일
          </label>
          <input
            type="date"
            id="birthdate"
            name="birthdate"
            value={formData.birthdate}
            onChange={handleChange}
            className="form-input"
          />
        </div>
        
        {/* 포지션 */}
        <div>
          <label htmlFor="position" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            포지션
          </label>
          <input
            type="text"
            id="position"
            name="position"
            value={formData.position}
            onChange={handleChange}
            className="form-input"
          />
        </div>
      </div>
      
      {/* 소속사 */}
      <div>
        <label htmlFor="company" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          소속사
        </label>
        <input
          type="text"
          id="company"
          name="company"
          value={formData.company}
          onChange={handleChange}
          className="form-input"
        />
      </div>
      
      {/* 소개 */}
      <div>
        <label htmlFor="bio" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          소개
        </label>
        <textarea
          id="bio"
          name="bio"
          value={formData.bio}
          onChange={handleChange}
          rows={4}
          className="form-textarea"
        />
      </div>
      
      {/* 소셜 미디어 링크 */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">소셜 미디어</h3>
        
        <div className="space-y-2">
          {/* 인스타그램 */}
          <div>
            <label htmlFor="instagram" className="block text-xs text-gray-700 dark:text-gray-300 mb-1">
              인스타그램
            </label>
            <input
              type="text"
              id="instagram"
              name="socialLinks.instagram"
              value={formData.socialLinks.instagram}
              onChange={handleChange}
              placeholder="https://instagram.com/username"
              className="form-input"
            />
          </div>
          
          {/* 트위터 */}
          <div>
            <label htmlFor="twitter" className="block text-xs text-gray-700 dark:text-gray-300 mb-1">
              트위터
            </label>
            <input
              type="text"
              id="twitter"
              name="socialLinks.twitter"
              value={formData.socialLinks.twitter}
              onChange={handleChange}
              placeholder="https://twitter.com/username"
              className="form-input"
            />
          </div>
          
          {/* 유튜브 */}
          <div>
            <label htmlFor="youtube" className="block text-xs text-gray-700 dark:text-gray-300 mb-1">
              유튜브
            </label>
            <input
              type="text"
              id="youtube"
              name="socialLinks.youtube"
              value={formData.socialLinks.youtube}
              onChange={handleChange}
              placeholder="https://youtube.com/channel/..."
              className="form-input"
            />
          </div>
        </div>
      </div>
      
      {/* 버튼 */}
      <div className="flex justify-end space-x-2 pt-4">
        <button
          type="button"
          onClick={initialData ? handleCancel : handleReset}
          className="btn btn-outline"
          disabled={isLoading}
        >
          <FaUndo className="mr-1" />
          {initialData ? '취소' : '초기화'}
        </button>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={isLoading}
        >
          {isLoading ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              저장 중...
            </span>
          ) : (
            <>
              <FaSave className="mr-1" />
              {initialData ? '수정하기' : '추가하기'}
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default IdolForm;