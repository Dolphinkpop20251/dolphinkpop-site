import React from 'react';
import { Navigate } from 'react-router-dom';
import RegisterForm from '../components/auth/RegisterForm';
import SocialLogin from '../components/auth/SocialLogin';
import { useAuth } from '../hooks/useAuth';

const RegisterPage = () => {
  const { currentUser, isAuthReady } = useAuth();
  
  // 이미 로그인 상태이면 홈으로 리디렉션
  if (isAuthReady && currentUser) {
    return <Navigate to="/" replace />;
  }
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-800 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          회원가입
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          돌핀 계정을 생성하고 K-POP 팬 커뮤니티에 참여하세요
        </p>
      </div>
      
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex flex-col space-y-6">
          {/* 회원가입 폼 */}
          <RegisterForm />
          
          {/* 소셜 로그인 */}
          <SocialLogin />
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;