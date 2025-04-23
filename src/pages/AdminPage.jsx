import React, { useEffect } from 'react';
import { Routes, Route, Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { FaUsers, FaIdCard, FaImage, FaVideo, FaNewspaper, FaChartBar, FaCog, FaTachometerAlt } from 'react-icons/fa';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import DashboardPage from './admin/DashboardPage';
import UserManagementPage from './admin/UserManagementPage';
import IdolManagementPage from './admin/IdolManagementPage';
import Loading from '../components/common/Loading';

const AdminPage = () => {
  const { currentUser, isAdmin, isAuthReady } = useAuth();
  const { showToast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  
  // 권한 확인
  useEffect(() => {
    if (isAuthReady && currentUser && !isAdmin) {
      showToast('관리자 권한이 없습니다.', 'error');
      navigate('/');
    }
  }, [isAuthReady, currentUser, isAdmin, navigate, showToast]);
  
  // 현재 활성화된 메뉴 확인
  const isActive = (path) => {
    if (path === '/admin' && location.pathname === '/admin') {
      return true;
    }
    return location.pathname.startsWith(path);
  };
  
  // 로딩 중
  if (!isAuthReady) {
    return <Loading fullscreen message="로그인 확인 중..." />;
  }
  
  // 비로그인 또는 관리자 아님
  if (!currentUser || !isAdmin) {
    return <Loading fullscreen message="권한 확인 중..." />;
  }
  
  return (
    <div className="container mx-auto px-4 py-8 mt-20">
      <div className="bg-white dark:bg-dark-700 rounded-lg shadow mb-8 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              관리자 대시보드
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              돌핀 커뮤니티 사이트 관리 페이지입니다.
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <Link to="/" className="btn btn-outline">
              사이트로 돌아가기
            </Link>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* 사이드바 메뉴 */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-dark-700 rounded-lg shadow p-4 sticky top-24">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 px-2">관리 메뉴</h2>
            <nav className="space-y-1">
              <Link 
                to="/admin" 
                className={`flex items-center py-2 px-3 rounded-md transition-colors ${
                  isActive('/admin') && location.pathname === '/admin'
                    ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/50 dark:text-primary-400' 
                    : 'hover:bg-gray-100 text-gray-700 dark:hover:bg-dark-600 dark:text-gray-300'
                }`}
              >
                <FaTachometerAlt className="mr-3" />
                <span>대시보드</span>
              </Link>
              <Link 
                to="/admin/users" 
                className={`flex items-center py-2 px-3 rounded-md transition-colors ${
                  isActive('/admin/users')
                    ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/50 dark:text-primary-400' 
                    : 'hover:bg-gray-100 text-gray-700 dark:hover:bg-dark-600 dark:text-gray-300'
                }`}
              >
                <FaUsers className="mr-3" />
                <span>사용자 관리</span>
              </Link>
              <Link 
                to="/admin/idols" 
                className={`flex items-center py-2 px-3 rounded-md transition-colors ${
                  isActive('/admin/idols')
                    ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/50 dark:text-primary-400' 
                    : 'hover:bg-gray-100 text-gray-700 dark:hover:bg-dark-600 dark:text-gray-300'
                }`}
              >
                <FaIdCard className="mr-3" />
                <span>아이돌 관리</span>
              </Link>
              <Link 
                to="/admin/posts" 
                className={`flex items-center py-2 px-3 rounded-md transition-colors ${
                  isActive('/admin/posts')
                    ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/50 dark:text-primary-400' 
                    : 'hover:bg-gray-100 text-gray-700 dark:hover:bg-dark-600 dark:text-gray-300'
                }`}
              >
                <FaNewspaper className="mr-3" />
                <span>게시글 관리</span>
              </Link>
              <Link 
                to="/admin/galleries" 
                className={`flex items-center py-2 px-3 rounded-md transition-colors ${
                  isActive('/admin/galleries')
                    ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/50 dark:text-primary-400' 
                    : 'hover:bg-gray-100 text-gray-700 dark:hover:bg-dark-600 dark:text-gray-300'
                }`}
              >
                <FaImage className="mr-3" />
                <span>갤러리 관리</span>
              </Link>
              <Link 
                to="/admin/videos" 
                className={`flex items-center py-2 px-3 rounded-md transition-colors ${
                  isActive('/admin/videos')
                    ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/50 dark:text-primary-400' 
                    : 'hover:bg-gray-100 text-gray-700 dark:hover:bg-dark-600 dark:text-gray-300'
                }`}
              >
                <FaVideo className="mr-3" />
                <span>비디오 관리</span>
              </Link>
              <Link 
                to="/admin/settings" 
                className={`flex items-center py-2 px-3 rounded-md transition-colors ${
                  isActive('/admin/settings')
                    ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/50 dark:text-primary-400' 
                    : 'hover:bg-gray-100 text-gray-700 dark:hover:bg-dark-600 dark:text-gray-300'
                }`}
              >
                <FaCog className="mr-3" />
                <span>사이트 설정</span>
              </Link>
            </nav>
          </div>
        </div>
        
        {/* 메인 콘텐츠 영역 */}
        <div className="lg:col-span-4">
          <div className="bg-white dark:bg-dark-700 rounded-lg shadow p-6">
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/users" element={<UserManagementPage />} />
              <Route path="/idols" element={<IdolManagementPage />} />
              <Route path="/posts" element={<div>게시글 관리 - 준비 중</div>} />
              <Route path="/galleries" element={<div>갤러리 관리 - 준비 중</div>} />
              <Route path="/videos" element={<div>비디오 관리 - 준비 중</div>} />
              <Route path="/settings" element={<div>사이트 설정 - 준비 중</div>} />
              <Route path="*" element={<Navigate to="/admin" replace />} />
            </Routes>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;