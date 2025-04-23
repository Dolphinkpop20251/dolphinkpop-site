import React from 'react';
import { FaGoogle } from 'react-icons/fa';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';

const SocialLogin = ({ className = '' }) => {
  const { googleLogin } = useAuth();
  const { showToast } = useToast();
  
  // Google 로그인 처리
  const handleGoogleLogin = async () => {
    try {
      await googleLogin();
    } catch (error) {
      console.error('Google 로그인 오류:', error);
      showToast('Google 로그인 중 오류가 발생했습니다.', 'error');
    }
  };
  
  // 기타 소셜 로그인 (아직 구현되지 않음)
  const handleOtherSocialLogin = (provider) => {
    showToast(`${provider} 로그인은 현재 준비 중입니다.`, 'info');
  };
  
  return (
    <div className={`w-full ${className}`}>
      {/* 구분선 */}
      <div className="relative flex items-center justify-center my-6">
        <div className="border-t border-gray-300 dark:border-gray-600 absolute w-full"></div>
        <div className="bg-white dark:bg-dark-700 px-4 relative text-sm text-gray-500 dark:text-gray-400">
          또는
        </div>
      </div>
      
      {/* 소셜 로그인 버튼 */}
      <div className="space-y-3">
        {/* 구글 로그인 */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-600 transition-colors"
        >
          <FaGoogle className="text-red-500" size={20} />
          <span>Google 계정으로 계속하기</span>
        </button>
      </div>
      
      {/* 소셜 로그인 안내 */}
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-4 text-center">
        소셜 계정으로 로그인하면 돌핀의{' '}
        <a href="/terms" className="text-primary-600 dark:text-primary-400 hover:underline">
          이용약관
        </a>
        {' '}및{' '}
        <a href="/privacy" className="text-primary-600 dark:text-primary-400 hover:underline">
          개인정보처리방침
        </a>
        에 동의하게 됩니다.
      </p>
    </div>
  );
};

export default SocialLogin;