import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { FaUser, FaHeart, FaEdit, FaSignOutAlt, FaImage, FaVideo, FaNewspaper, FaCog } from 'react-icons/fa';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import Loading from '../components/common/Loading';
import Profile from '../components/user/Profile';
import ProfileEdit from '../components/user/ProfileEdit';
import MyIdols from '../components/user/MyIdols';
import MyPosts from '../components/user/MyPosts';
import MyPhotos from '../components/user/MyPhotos';
import MyVideos from '../components/user/MyVideos';
import Settings from '../components/user/Settings';

const MyPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, logout, isAuthReady } = useAuth();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('profile');
  
  // 현재 경로에 따라 활성 탭 설정
  useEffect(() => {
    const path = location.pathname;
    if (path.includes('/mypage/edit')) {
      setActiveTab('edit');
    } else if (path.includes('/mypage/idols')) {
      setActiveTab('idols');
    } else if (path.includes('/mypage/posts')) {
      setActiveTab('posts');
    } else if (path.includes('/mypage/photos')) {
      setActiveTab('photos');
    } else if (path.includes('/mypage/videos')) {
      setActiveTab('videos');
    } else if (path.includes('/mypage/settings')) {
      setActiveTab('settings');
    } else {
      setActiveTab('profile');
    }
  }, [location.pathname]);
  
  // 로그아웃 처리
  const handleLogout = async () => {
    try {
      await logout();
      showToast('로그아웃되었습니다.', 'success');
      navigate('/');
    } catch (error) {
      console.error('로그아웃 오류:', error);
      showToast('로그아웃 중 오류가 발생했습니다.', 'error');
    }
  };
  
  // 로그인 확인 중
  if (!isAuthReady) {
    return <Loading fullscreen message="로그인 확인 중..." />;
  }
  
  // 로그인하지 않은 경우 로그인 페이지로 리디렉션
  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }
  
  // 탭 클래스 (활성/비활성)
  const getTabClass = (tab) => {
    return `flex items-center py-3 px-4 ${
      activeTab === tab
        ? 'text-primary-600 border-b-2 border-primary-600 font-medium dark:text-primary-400 dark:border-primary-400'
        : 'text-gray-600 hover:text-gray-900 hover:border-b-2 hover:border-gray-300 dark:text-gray-400 dark:hover:text-white dark:hover:border-dark-500'
    }`;
  };
  
  return (
    <div className="container-custom mx-auto px-4 py-8">
      <div className="max-w-5xl mx-auto">
        {/* 페이지 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            마이페이지
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            내 프로필 및 활동 관리
          </p>
        </div>
        
        {/* 탭 네비게이션 */}
        <div className="border-b border-gray-200 dark:border-dark-600 mb-8">
          <nav className="flex flex-wrap -mb-px overflow-x-auto">
            <Link to="/mypage" className={getTabClass('profile')}>
              <FaUser className="mr-2" />
              프로필
            </Link>
            <Link to="/mypage/edit" className={getTabClass('edit')}>
              <FaEdit className="mr-2" />
              프로필 수정
            </Link>
            <Link to="/mypage/idols" className={getTabClass('idols')}>
              <FaHeart className="mr-2" />
              내 아이돌
            </Link>
            <Link to="/mypage/posts" className={getTabClass('posts')}>
              <FaNewspaper className="mr-2" />
              내 게시글
            </Link>
            <Link to="/mypage/photos" className={getTabClass('photos')}>
              <FaImage className="mr-2" />
              내 사진
            </Link>
            <Link to="/mypage/videos" className={getTabClass('videos')}>
              <FaVideo className="mr-2" />
              내 비디오
            </Link>
            <Link to="/mypage/settings" className={getTabClass('settings')}>
              <FaCog className="mr-2" />
              설정
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center py-3 px-4 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
            >
              <FaSignOutAlt className="mr-2" />
              로그아웃
            </button>
          </nav>
        </div>
        
        {/* 콘텐츠 영역 */}
        <div className="bg-white dark:bg-dark-700 rounded-lg shadow-sm p-6">
          <Routes>
            <Route path="/" element={<Profile />} />
            <Route path="/edit" element={<ProfileEdit />} />
            <Route path="/idols" element={<MyIdols />} />
            <Route path="/posts" element={<MyPosts />} />
            <Route path="/photos" element={<MyPhotos />} />
            <Route path="/videos" element={<MyVideos />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/mypage" replace />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default MyPage;