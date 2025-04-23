import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import * as authService from '../services/authService';
import { useLoading } from './useLoading';
import { useToast } from './useToast';

// 인증 관련 커스텀 훅
export const useAuth = () => {
  const authContext = useContext(AuthContext);
  const { startLoading, stopLoading } = useLoading();
  const { showToast } = useToast();
  
  // 로그인 함수
  const login = async (email, password) => {
    startLoading('로그인 중...');
    try {
      const result = await authService.loginWithEmail(email, password);
      if (result.success) {
        showToast('로그인 성공!', 'success');
        return true;
      } else {
        showToast(result.error || '로그인에 실패했습니다.', 'error');
        return false;
      }
    } catch (error) {
      showToast('로그인 중 오류가 발생했습니다.', 'error');
      return false;
    } finally {
      stopLoading();
    }
  };
  
  // 구글 로그인 함수
  const googleLogin = async () => {
    startLoading('구글 계정으로 로그인 중...');
    try {
      const result = await authService.loginWithGoogle();
      if (result.success) {
        showToast('로그인 성공!', 'success');
        return true;
      } else {
        showToast(result.error || '로그인에 실패했습니다.', 'error');
        return false;
      }
    } catch (error) {
      showToast('로그인 중 오류가 발생했습니다.', 'error');
      return false;
    } finally {
      stopLoading();
    }
  };
  
  // 회원가입 함수
  const register = async (email, password, displayName) => {
    startLoading('계정 생성 중...');
    try {
      const result = await authService.registerWithEmail(email, password, displayName);
      if (result.success) {
        showToast('회원가입 성공! 이메일 인증을 확인해주세요.', 'success');
        return true;
      } else {
        showToast(result.error || '회원가입에 실패했습니다.', 'error');
        return false;
      }
    } catch (error) {
      showToast('회원가입 중 오류가 발생했습니다.', 'error');
      return false;
    } finally {
      stopLoading();
    }
  };
  
  // 로그아웃 함수
  const logout = async () => {
    startLoading('로그아웃 중...');
    try {
      const result = await authService.logout();
      if (result.success) {
        showToast('로그아웃 되었습니다.', 'info');
        return true;
      } else {
        showToast(result.error || '로그아웃에 실패했습니다.', 'error');
        return false;
      }
    } catch (error) {
      showToast('로그아웃 중 오류가 발생했습니다.', 'error');
      return false;
    } finally {
      stopLoading();
    }
  };
  
  // 비밀번호 재설정 함수
  const resetPassword = async (email) => {
    startLoading('비밀번호 재설정 메일 발송 중...');
    try {
      const result = await authService.resetPassword(email);
      if (result.success) {
        showToast('비밀번호 재설정 이메일이 발송되었습니다.', 'success');
        return true;
      } else {
        showToast(result.error || '비밀번호 재설정에 실패했습니다.', 'error');
        return false;
      }
    } catch (error) {
      showToast('비밀번호 재설정 중 오류가 발생했습니다.', 'error');
      return false;
    } finally {
      stopLoading();
    }
  };
  
  // 프로필 업데이트 함수
  const updateProfile = async (userId, profileData) => {
    startLoading('프로필 업데이트 중...');
    try {
      const result = await authService.updateUserProfile(userId, profileData);
      if (result.success) {
        showToast('프로필이 업데이트 되었습니다.', 'success');
        return true;
      } else {
        showToast(result.error || '프로필 업데이트에 실패했습니다.', 'error');
        return false;
      }
    } catch (error) {
      showToast('프로필 업데이트 중 오류가 발생했습니다.', 'error');
      return false;
    } finally {
      stopLoading();
    }
  };
  
  // 비밀번호 변경 함수
  const changePassword = async (currentPassword, newPassword) => {
    startLoading('비밀번호 변경 중...');
    try {
      const result = await authService.changePassword(currentPassword, newPassword);
      if (result.success) {
        showToast('비밀번호가 변경되었습니다.', 'success');
        return true;
      } else {
        showToast(result.error || '비밀번호 변경에 실패했습니다.', 'error');
        return false;
      }
    } catch (error) {
      showToast('비밀번호 변경 중 오류가 발생했습니다.', 'error');
      return false;
    } finally {
      stopLoading();
    }
  };
  
  // AuthContext의 값과 추가 함수들 반환
  return {
    ...authContext,
    login,
    googleLogin,
    register,
    logout,
    resetPassword,
    updateProfile,
    changePassword
  };
};
