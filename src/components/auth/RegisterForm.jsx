import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaUser, FaCheck } from 'react-icons/fa';
import { useAuth } from '../../hooks/useAuth';
import { useForm } from '../../hooks/useForm';
import { validateRegisterForm, validatePassword } from '../../utils/validators';

const RegisterForm = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [registerError, setRegisterError] = useState('');
  
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
    { 
      displayName: '', 
      email: '', 
      password: '', 
      confirmPassword: '',
      agreeTerms: false
    },
    validateRegisterForm
  );
  
  // 비밀번호 강도 계산
  const passwordStrength = values.password ? validatePassword(values.password) : { strength: 0 };
  
  // 강도 표시 막대 설정
  const getStrengthBarWidth = () => {
    return `${(passwordStrength.strength / 5) * 100}%`;
  };
  
  const getStrengthColor = () => {
    const { strength } = passwordStrength;
    if (strength <= 1) return 'bg-red-500';
    if (strength <= 2) return 'bg-orange-500';
    if (strength <= 3) return 'bg-yellow-500';
    if (strength <= 4) return 'bg-green-500';
    return 'bg-green-600';
  };
  
  const getStrengthText = () => {
    const { strength } = passwordStrength;
    if (strength <= 1) return '매우 약함';
    if (strength <= 2) return '약함';
    if (strength <= 3) return '보통';
    if (strength <= 4) return '강함';
    return '매우 강함';
  };
  
  // 회원가입 처리
  const onSubmit = async () => {
    try {
      setRegisterError('');
      const success = await register(values.email, values.password, values.displayName);
      
      if (success) {
        navigate('/login', { state: { message: '회원가입 성공! 이메일 인증 후 로그인해주세요.' } });
      }
    } catch (error) {
      console.error('회원가입 오류:', error);
      setRegisterError('회원가입 중 오류가 발생했습니다. 다시 시도해주세요.');
    }
  };
  
  // 비밀번호 표시 토글
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  // 비밀번호 확인 표시 토글
  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };
  
  return (
    <div className="w-full max-w-md">
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white dark:bg-dark-700 rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">회원가입</h2>
        
        {/* 회원가입 에러 메시지 */}
        {registerError && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200 rounded-md text-sm">
            {registerError}
          </div>
        )}
        
        {/* 이름 입력 필드 */}
        <div className="form-group">
          <label htmlFor="displayName" className="form-label">
            이름
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaUser className="text-gray-400" size={16} />
            </div>
            <input
              type="text"
              id="displayName"
              name="displayName"
              value={values.displayName}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="이름"
              className={`form-input pl-10 ${
                touched.displayName && errors.displayName ? 'border-red-500 dark:border-red-700' : ''
              }`}
              disabled={isSubmitting}
            />
          </div>
          {touched.displayName && errors.displayName && (
            <p className="form-error">{errors.displayName}</p>
          )}
        </div>
        
        {/* 이메일 입력 필드 */}
        <div className="form-group">
          <label htmlFor="email" className="form-label">
            이메일
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaEnvelope className="text-gray-400" size={16} />
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
        
        {/* 비밀번호 입력 필드 */}
        <div className="form-group">
          <label htmlFor="password" className="form-label">
            비밀번호
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaLock className="text-gray-400" size={16} />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              name="password"
              value={values.password}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="비밀번호"
              className={`form-input pl-10 ${
                touched.password && errors.password ? 'border-red-500 dark:border-red-700' : ''
              }`}
              disabled={isSubmitting}
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              tabIndex="-1"
            >
              {showPassword ? (
                <FaEyeSlash className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
              ) : (
                <FaEye className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
              )}
            </button>
          </div>
          
          {/* 비밀번호 강도 표시 */}
          {values.password && (
            <div className="mt-2">
              <div className="h-1 w-full bg-gray-200 dark:bg-dark-500 rounded-full">
                <div 
                  className={`h-full rounded-full ${getStrengthColor()}`} 
                  style={{ width: getStrengthBarWidth() }}
                ></div>
              </div>
              <p className="text-xs mt-1 text-gray-600 dark:text-gray-400">
                {getStrengthText()}
              </p>
            </div>
          )}
          
          {touched.password && errors.password && (
            <p className="form-error">{errors.password}</p>
          )}
        </div>
        
        {/* 비밀번호 확인 입력 필드 */}
        <div className="form-group">
          <label htmlFor="confirmPassword" className="form-label">
            비밀번호 확인
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaLock className="text-gray-400" size={16} />
            </div>
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              id="confirmPassword"
              name="confirmPassword"
              value={values.confirmPassword}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="비밀번호 확인"
              className={`form-input pl-10 ${
                touched.confirmPassword && errors.confirmPassword ? 'border-red-500 dark:border-red-700' : ''
              }`}
              disabled={isSubmitting}
            />
            <button
              type="button"
              onClick={toggleConfirmPasswordVisibility}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              tabIndex="-1"
            >
              {showConfirmPassword ? (
                <FaEyeSlash className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
              ) : (
                <FaEye className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
              )}
            </button>
          </div>
          {touched.confirmPassword && errors.confirmPassword && (
            <p className="form-error">{errors.confirmPassword}</p>
          )}
        </div>
        
        {/* 이용약관 동의 */}
        <div className="form-group">
          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                id="agreeTerms"
                name="agreeTerms"
                type="checkbox"
                checked={values.agreeTerms}
                onChange={handleChange}
                className="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-primary-500 dark:border-gray-600 dark:bg-dark-600 dark:focus:ring-primary-800"
              />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="agreeTerms" className="text-gray-600 dark:text-gray-400">
                <Link 
                  to="/terms" 
                  target="_blank" 
                  className="text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300"
                >
                  서비스 이용약관
                </Link>
                {' '}및{' '}
                <Link 
                  to="/privacy" 
                  target="_blank"
                  className="text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300"
                >
                  개인정보처리방침
                </Link>
                에 동의합니다.
              </label>
            </div>
          </div>
          {touched.agreeTerms && errors.agreeTerms && (
            <p className="form-error mt-1">{errors.agreeTerms}</p>
          )}
        </div>
        
        {/* 회원가입 버튼 */}
        <button
          type="submit"
          className="w-full btn btn-primary py-3 mt-4"
          disabled={isSubmitting}
        >
          {isSubmitting ? '처리 중...' : '회원가입'}
        </button>
        
        {/* 로그인 안내 */}
        <div className="mt-6 text-center">
          <span className="text-gray-600 dark:text-gray-400">이미 계정이 있으신가요?</span>{' '}
          <Link
            to="/login"
            className="text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300"
          >
            로그인
          </Link>
        </div>
      </form>
    </div>
  );
};

export default RegisterForm;