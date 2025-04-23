import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import { useAuth } from '../../hooks/useAuth';
import { useForm } from '../../hooks/useForm';
import { validateLoginForm } from '../../utils/validators';

const LoginForm = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  
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
    { email: '', password: '' },
    validateLoginForm
  );
  
  // 로그인 처리
  const onSubmit = async () => {
    try {
      setLoginError('');
      const success = await login(values.email, values.password);
      
      if (success) {
        navigate('/');
      }
    } catch (error) {
      console.error('로그인 오류:', error);
      setLoginError('로그인 중 오류가 발생했습니다. 다시 시도해주세요.');
    }
  };
  
  // 비밀번호 표시 토글
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  return (
    <div className="w-full max-w-md">
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white dark:bg-dark-700 rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">로그인</h2>
        
        {/* 로그인 에러 메시지 */}
        {loginError && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200 rounded-md text-sm">
            {loginError}
          </div>
        )}
        
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
          {touched.password && errors.password && (
            <p className="form-error">{errors.password}</p>
          )}
        </div>
        
        {/* 비밀번호 재설정 링크 */}
        <div className="flex justify-end mb-6">
          <Link
            to="/reset-password"
            className="text-sm text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300"
          >
            비밀번호를 잊으셨나요?
          </Link>
        </div>
        
        {/* 로그인 버튼 */}
        <button
          type="submit"
          className="w-full btn btn-primary py-3"
          disabled={isSubmitting}
        >
          {isSubmitting ? '로그인 중...' : '로그인'}
        </button>
        
        {/* 회원가입 안내 */}
        <div className="mt-6 text-center">
          <span className="text-gray-600 dark:text-gray-400">아직 계정이 없으신가요?</span>{' '}
          <Link
            to="/register"
            className="text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300"
          >
            회원가입
          </Link>
        </div>
      </form>
    </div>
  );
};

export default LoginForm;