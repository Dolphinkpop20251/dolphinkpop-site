import React, { useEffect } from 'react';
import { useLocation, Navigate } from 'react-router-dom';
import LoginForm from '../components/auth/LoginForm';
import SocialLogin from '../components/auth/SocialLogin';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';

const LoginPage = () => {
  const location = useLocation();
  const { currentUser, isAuthReady } = useAuth();
  const { showToast } = useToast();
  
  // 리디렉션 위치 (로그인 요청 시 from 값이 있으면 사용)
  const from = location.state?.from || '/';
  
  // 링크를 통해 전달된 메시지 표시 (회원가입 완료 등)
  useEffect(() => {
    if (location.state?.message) {
      showToast(location.state.message, location.state.type || 'success');
    }
  }, [location.state, showToast]);
  
  // 이미 로그인 상태이면 리디렉션
  if (isAuthReady && currentUser) {
    return <Navigate to={from} replace />;
  }
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-800 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          로그인
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          돌핀에 오신 것을 환영합니다
        </p>
      </div>
      
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex flex-col space-y-6">
          {/* 이메일 로그인 폼 */}
          <LoginForm />
          
          {/* 소셜 로그인 */}
          <SocialLogin />
        </div>
      </div>
    </div>
  );
};

export default LoginPage;