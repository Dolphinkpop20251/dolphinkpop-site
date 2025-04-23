import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaEnvelope, FaArrowLeft } from 'react-icons/fa';
import { useAuth } from '../../hooks/useAuth';
import { useForm } from '../../hooks/useForm';
import { isValidEmail } from '../../utils/validators';

const PasswordReset = () => {
  const { resetPassword } = useAuth();
  const [resetSent, setResetSent] = useState(false);
  const [resetError, setResetError] = useState('');
  
  // 폼 상태 관리
  const { 
    values, 
    errors, 
    touched,
    isSubmitting,
    handleChange, 
    handleBlur, 
    handleSubmit 
  } = useForm(
    { email: '' },
    validateResetForm
  );
  
  // 재설정 폼 유효성 검사
  function validateResetForm(values) {
    const errors = {};
    
    if (!values.email) {
      errors.email = '이메일을 입력해주세요.';
    } else if (!isValidEmail(values.email)) {
      errors.email = '유효한 이메일 주소를 입력해주세요.';
    }
    
    return errors;
  }
  
  // 비밀번호 재설정 요청 처리
  const onSubmit = async () => {
    try {
      setResetError('');
      const success = await resetPassword(values.email);
      
      if (success) {
        setResetSent(true);
      }
    } catch (error) {
      console.error('비밀번호 재설정 오류:', error);
      setResetError('비밀번호 재설정 요청 중 오류가 발생했습니다. 다시 시도해주세요.');
    }
  };
  
  // 재설정 메일 발송 후 화면
  if (resetSent) {
    return (
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-dark-700 rounded-lg shadow-md p-6">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900 mb-4">
              <FaEnvelope className="h-8 w-8 text-green-600 dark:text-green-300" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">이메일이 발송되었습니다</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {values.email}로 비밀번호 재설정 링크가 발송되었습니다. 이메일을 확인해주세요.
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mb-6">
              이메일이 보이지 않는다면 스팸함을 확인해보시거나 다시 시도해주세요.
            </p>
            <div className="flex flex-col space-y-3">
              <button
                onClick={() => setResetSent(false)}
                className="btn btn-outline"
              >
                다시 시도
              </button>
              <Link to="/login" className="btn btn-primary">
                로그인 페이지로 돌아가기
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // 비밀번호 재설정 요청 폼
  return (
    <div className="w-full max-w-md">
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white dark:bg-dark-700 rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 text-center">비밀번호 재설정</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6 text-center">
          계정에 등록된 이메일로 재설정 링크를 보내드립니다.
        </p>
        
        {/* 재설정 에러 메시지 */}
        {resetError && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200 rounded-md text-sm">
            {resetError}
          </div>
        )}
        
        {/* 이메일 입력 필드 */}
        <div className="form-group">
          <label htmlFor="email" className="form-label">
            이메일
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaEnvelope className="text-gray-400" />
            </div>
            <input
              type="email"
              id="email"
              name="email"
              value={values.email}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="example@email.com"
              className={`form-input pl-10 ${
                touched.email && errors.email ? 'border-red-500 dark:border-red-700' : ''
              }`}
              disabled={isSubmitting}
            />
          </div>
          {touched.email && errors.email && (
            <p className="form-error">{errors.email}</p>
          )}
        </div>
        
        {/* 재설정 링크 전송 버튼 */}
        <button
          type="submit"
          className="w-full btn btn-primary py-3 mt-4"
          disabled={isSubmitting}
        >
          {isSubmitting ? '처리 중...' : '재설정 링크 전송'}
        </button>
        
        {/* 로그인 화면 링크 */}
        <div className="mt-6 text-center">
          <Link
            to="/login"
            className="flex items-center justify-center text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300"
          >
            <FaArrowLeft className="mr-2" size={14} />
            로그인 화면으로 돌아가기
          </Link>
        </div>
      </form>
    </div>
  );
};

export default PasswordReset;