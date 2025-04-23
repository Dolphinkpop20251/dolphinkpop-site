import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaCamera, FaSpinner, FaTimes, FaCheck, FaWifi, FaExclamationTriangle } from 'react-icons/fa';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { getUserById, updateUserProfile, refreshUserAuthData } from '../../services/userService';
import { testFirebaseServices, getFirebaseErrorMessage } from '../../utils/firebaseTest';

const ProfileEdit = () => {
  const { currentUser } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  // 폼 상태
  const [formValues, setFormValues] = useState({
    displayName: '',
    bio: ''
  });
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [firebaseStatus, setFirebaseStatus] = useState({
    isConnected: true,
    lastChecked: Date.now(),
    error: null
  });
  
  // 네트워크 상태
  const [networkStatus, setNetworkStatus] = useState({
    isOnline: navigator.onLine,
    lastChecked: Date.now()
  });
  
  // Firebase 연결 확인
  useEffect(() => {
    const checkFirebase = async () => {
      if (navigator.onLine) {
        try {
          const results = await testFirebaseServices();
          setFirebaseStatus({
            isConnected: results.firestoreQuery,
            lastChecked: Date.now(),
            error: results.errors.length > 0 ? results.errors[0] : null
          });
          
          if (!results.firestoreQuery) {
            showToast('Firebase 서버에 연결할 수 없습니다. 다시 시도해 주세요.', 'error');
          }
        } catch (error) {
          console.error('Firebase 테스트 오류:', error);
          setFirebaseStatus({
            isConnected: false,
            lastChecked: Date.now(),
            error
          });
          showToast('Firebase 서버 연결 테스트 중 오류가 발생했습니다.', 'error');
        }
      }
    };
    
    checkFirebase();
  }, [showToast]);
  
  // 네트워크 상태 리스너
  useEffect(() => {
    const handleOnline = () => {
      console.log('네트워크 연결됨');
      setNetworkStatus({
        isOnline: true,
        lastChecked: Date.now()
      });
      showToast('인터넷에 다시 연결되었습니다', 'success');
    };
    
    const handleOffline = () => {
      console.log('네트워크 연결 끊김');
      setNetworkStatus({
        isOnline: false,
        lastChecked: Date.now()
      });
      showToast('인터넷 연결이 끊겼습니다. 변경사항이 저장되지 않을 수 있습니다', 'error');
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [showToast]);
  
  // 사용자 정보 불러오기
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        
        if (currentUser) {
          // 인터넷 연결 확인
          if (!navigator.onLine) {
            showToast('오프라인 상태입니다. 프로필 정보를 불러올 수 없습니다.', 'warning');
            setLoading(false);
            return;
          }
          
          // 사용자 기본 정보
          const userResponse = await getUserById(currentUser.uid);
          if (userResponse.success) {
            const userData = userResponse.user;
            setFormValues({
              displayName: userData.displayName || '',
              bio: userData.bio || ''
            });
            setImagePreview(userData.photoURL || null);
          }
        }
      } catch (error) {
        console.error('사용자 정보 로딩 오류:', error);
        showToast('사용자 정보를 불러오는 중 오류가 발생했습니다.', 'error');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, [currentUser, showToast]);
  
  // 입력 변경 처리
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues(prev => ({
      ...prev,
      [name]: value
    }));
    
    // 오류 제거
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };
  
  // 이미지 선택 처리
  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // 파일 타입 체크
    if (!file.type.match('image.*')) {
      showToast('이미지 파일만 업로드할 수 있습니다.', 'error');
      return;
    }
    
    // 파일 크기 체크 (5MB 제한)
    if (file.size > 5 * 1024 * 1024) {
      showToast('이미지 크기는 5MB 이하여야 합니다.', 'error');
      return;
    }
    
    // 이전 미리보기 URL 해제
    if (imagePreview && imagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreview);
    }
    
    // 파일 저장 및 미리보기 생성
    setProfileImage(file);
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
    
    // 오류 제거
    if (errors.profileImage) {
      setErrors(prev => ({
        ...prev,
        profileImage: undefined
      }));
    }
  };
  
  // 이미지 제거 처리
  const handleRemoveImage = () => {
    setProfileImage(null);
    
    // 현재 미리보기가 URL 객체인 경우 해제
    if (imagePreview && imagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreview);
    }
    
    // 기존 사용자 이미지 유지 (실제 삭제는 저장 시 처리)
    if (currentUser?.photoURL) {
      setImagePreview(currentUser.photoURL);
    } else {
      setImagePreview(null);
    }
  };
  
  // 폼 유효성 검사
  const validateForm = () => {
    const newErrors = {};
    
    if (!formValues.displayName.trim()) {
      newErrors.displayName = '이름을 입력해주세요.';
    } else if (formValues.displayName.length < 2) {
      newErrors.displayName = '이름은 최소 2자 이상이어야 합니다.';
    }
    
    if (formValues.bio && formValues.bio.length > 200) {
      newErrors.bio = '자기소개는 200자 이내로 작성해주세요.';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // 폼 제출 처리
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('프로필 업데이트 시작');
    
    // 네트워크 상태 확인
    if (!navigator.onLine) {
      showToast('인터넷 연결이 없습니다. 프로필을 업데이트할 수 없습니다.', 'error');
      return;
    }
    
    // Firebase 연결 확인
    if (!firebaseStatus.isConnected) {
      showToast('Firebase 서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.', 'error');
      return;
    }
    
    // 유효성 검사
    if (!validateForm()) {
      console.log('폼 유효성 검사 실패');
      return;
    }
    
    setSubmitting(true);
    
    try {
      // 프로필 데이터 준비
      const profileData = {
        displayName: formValues.displayName,
        bio: formValues.bio,
        photoFile: profileImage
      };
      
      console.log('프로필 데이터:', { ...profileData, photoFile: profileImage ? '파일 있음' : '파일 없음' });
      
      // 프로필 업데이트 시도
      const result = await updateUserProfile(currentUser.uid, profileData);
      
      console.log('프로필 업데이트 결과:', result);
      
      if (result.success) {
        // Firebase Auth와 동기화 시도
        try {
          await refreshUserAuthData(currentUser.uid);
        } catch (authError) {
          console.warn('Auth 프로필 동기화 실패 (계속 진행):', authError);
        }
        
        showToast('프로필이 성공적으로 업데이트되었습니다.', 'success');
        setSubmitting(false);
        navigate('/mypage');
      } else {
        console.error('프로필 업데이트 실패:', result.error);
        showToast(result.error || '프로필 업데이트에 실패했습니다.', 'error');
        setSubmitting(false);
      }
    } catch (error) {
      console.error('프로필 업데이트 오류:', error);
      
      // 오류 메시지 맞춤화
      let errorMessage = '프로필 업데이트 중 오류가 발생했습니다.';
      
      if (error.message && error.message.includes('offline')) {
        errorMessage = '인터넷 연결이 끊겼습니다. 네트워크 연결을 확인하고 다시 시도해주세요.';
      } else if (error.message && error.message.includes('permission-denied')) {
        errorMessage = '권한이 없습니다. 다시 로그인 후 시도해주세요.';
      } else if (error.message && error.message.includes('timeout')) {
        errorMessage = '서버 응답 시간이 초과되었습니다. 나중에 다시 시도해주세요.';
      }
      
      showToast(errorMessage, 'error');
      setSubmitting(false);
    }
  };
  
  // 취소 처리
  const handleCancel = () => {
    // 임시 이미지 URL 해제
    if (imagePreview && imagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreview);
    }
    
    navigate('/mypage');
  };
  
  // 로딩 중
  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">프로필 정보를 불러오는 중...</p>
      </div>
    );
  }
  
  return (
    <form onSubmit={handleSubmit}>
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
        프로필 수정
      </h2>
      
      {/* Firebase 연결 상태 알림 */}
      {!firebaseStatus.isConnected && (
        <div className="mb-6 p-4 bg-red-100 text-red-800 rounded-lg flex items-center">
          <FaExclamationTriangle className="mr-2 text-red-600" />
          <div>
            <p className="font-bold">Firebase 서버에 연결할 수 없습니다.</p>
            <p className="text-sm">
              네트워크 연결을 확인하고 페이지를 새로고침해 주세요. 계속 문제가 발생하면 관리자에게 문의하세요.
            </p>
          </div>
        </div>
      )}
      
      {/* 네트워크 상태 알림 */}
      {!networkStatus.isOnline && (
        <div className="mb-6 p-4 bg-yellow-100 text-yellow-800 rounded-lg flex items-center">
          <FaExclamationTriangle className="mr-2 text-yellow-600" />
          <span>
            현재 오프라인 상태입니다. 인터넷에 연결한 후 다시 시도해주세요.
          </span>
        </div>
      )}
      
      {/* 프로필 이미지 */}
      <div className="mb-6 flex flex-col items-center">
        <div className="relative mb-4">
          {imagePreview ? (
            <img
              src={imagePreview}
              alt="프로필 미리보기"
              className="w-32 h-32 rounded-full object-cover border-4 border-white dark:border-dark-600 shadow-md"
            />
          ) : (
            <div className="w-32 h-32 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center border-4 border-white dark:border-dark-600 shadow-md">
              <span className="text-4xl font-bold text-gray-500 dark:text-gray-400">
                {formValues.displayName ? formValues.displayName.charAt(0).toUpperCase() : '?'}
              </span>
            </div>
          )}
          
          {/* 이미지 업로드 버튼 */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="absolute bottom-0 right-0 bg-primary-600 text-white p-2 rounded-full hover:bg-primary-700 dark:bg-primary-700 dark:hover:bg-primary-800"
            disabled={submitting || !networkStatus.isOnline || !firebaseStatus.isConnected}
          >
            <FaCamera size={16} />
          </button>
          
          {/* 이미지 제거 버튼 */}
          {imagePreview && (
            <button
              type="button"
              onClick={handleRemoveImage}
              className="absolute top-0 right-0 bg-red-600 text-white p-2 rounded-full hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800"
              disabled={submitting}
            >
              <FaTimes size={16} />
            </button>
          )}
          
          {/* 숨겨진 파일 입력 */}
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleImageSelect}
            className="hidden"
            disabled={submitting || !networkStatus.isOnline || !firebaseStatus.isConnected}
          />
        </div>
        
        <p className="text-sm text-gray-500 dark:text-gray-400">
          JPG, PNG 또는 GIF 이미지 (최대 5MB)
        </p>
      </div>
      
      {/* 이름 입력 */}
      <div className="mb-6">
        <label htmlFor="displayName" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
          이름 <span className="text-red-600">*</span>
        </label>
        <input
          type="text"
          id="displayName"
          name="displayName"
          value={formValues.displayName}
          onChange={handleChange}
          className={`form-input ${errors.displayName ? 'border-red-500 dark:border-red-700' : ''}`}
          placeholder="이름"
          disabled={submitting}
        />
        {errors.displayName && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.displayName}</p>
        )}
      </div>
      
      {/* 자기소개 입력 */}
      <div className="mb-6">
        <label htmlFor="bio" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
          자기소개
        </label>
        <textarea
          id="bio"
          name="bio"
          value={formValues.bio}
          onChange={handleChange}
          rows={4}
          className={`form-textarea ${errors.bio ? 'border-red-500 dark:border-red-700' : ''}`}
          placeholder="자기소개를 작성해주세요."
          disabled={submitting}
        />
        <div className="flex justify-between mt-1">
          {errors.bio ? (
            <p className="text-sm text-red-600 dark:text-red-400">{errors.bio}</p>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              자기소개는 선택 사항입니다.
            </p>
          )}
          <p className={`text-sm ${formValues.bio.length > 200 ? 'text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-gray-400'}`}>
            {formValues.bio.length}/200
          </p>
        </div>
      </div>
      
      {/* 네트워크 상태 */}
      <div className="flex items-center mb-6">
        <div className={`w-3 h-3 rounded-full mr-2 ${networkStatus.isOnline ? 'bg-green-500' : 'bg-red-500'}`}></div>
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {networkStatus.isOnline ? '온라인 상태' : '오프라인 상태 - 변경사항이 저장되지 않을 수 있습니다'}
        </span>
      </div>
      
      {/* 버튼 영역 */}
      <div className="flex justify-end space-x-3 mt-8">
        <button
          type="button"
          onClick={handleCancel}
          className="btn btn-outline"
          disabled={submitting}
        >
          취소
        </button>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={submitting || !networkStatus.isOnline || !firebaseStatus.isConnected}
        >
          {submitting ? (
            <>
              <FaSpinner className="animate-spin mr-2" />
              저장 중...
            </>
          ) : (
            <>
              <FaCheck className="mr-2" />
              저장하기
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default ProfileEdit;