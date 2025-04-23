import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CommunityPage from './pages/Communitypage';
import IdolsPage from './pages/IdolsPage';
import GalleryPage from './pages/GalleryPage';
import VideoPage from './pages/VideoPage';
import PostDetailPage from './pages/PostDetailPage';
import PostWritePage from './pages/PostWritePage';
import IdolDetailPage from './pages/IdolDetailpage';
import VideoDetailPage from './pages/VideoDetailPage';
import MyPage from './pages/MyPage';
import AdminPage from './pages/AdminPage';
import GalleryDetailPage from './pages/GalleryDetailPage';
import GalleryUploadPage from './pages/GalleryUploadPage';
import NotFoundPage from './pages/NotFoundPage';
import TestPage from './pages/TestPage';

// 보호된 라우트 컴포넌트 (로그인 필요)
const ProtectedRoute = ({ children }) => {
  const { currentUser, isAuthReady } = useAuth();
  
  if (!isAuthReady) {
    return null; // 인증 상태가 확인되지 않은 경우 아무것도 렌더링하지 않음
  }
  
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

// 관리자 전용 라우트
const AdminRoute = ({ children }) => {
  const { currentUser, isAdmin, isAuthReady } = useAuth();
  
  if (!isAuthReady) {
    return null;
  }
  
  if (!currentUser || !isAdmin) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

// 미인증 사용자만 접근 가능한 라우트 (로그인 페이지, 회원가입 페이지 등)
const PublicOnlyRoute = ({ children }) => {
  const { currentUser, isAuthReady } = useAuth();
  
  if (!isAuthReady) {
    return null;
  }
  
  if (currentUser) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* 공개 페이지 */}
      <Route path="/" element={<HomePage />} />
      <Route path="/idols" element={<IdolsPage />} />
      <Route path="/idols/:idolId" element={<IdolDetailPage />} />
      <Route path="/gallery" element={<GalleryPage />} />
      <Route path="/gallery/upload" element={
        <ProtectedRoute>
          <GalleryUploadPage />
        </ProtectedRoute>
      } />
      <Route path="/gallery/:imageId" element={<GalleryDetailPage />} />
      <Route path="/videos" element={<VideoPage />} />
      <Route path="/videos/:videoId" element={<VideoDetailPage />} />
      <Route path="/community/write" element={
        <ProtectedRoute>
          <PostWritePage />
        </ProtectedRoute>
      } />
      <Route path="/community/edit/:postId" element={
        <ProtectedRoute>
          <PostWritePage />
        </ProtectedRoute>
      } />
      <Route path="/community" element={<CommunityPage />} />
      <Route path="/community/:postId" element={<PostDetailPage />} />
      
      {/* 인증되지 않은 사용자만 */}
      <Route path="/login" element={
        <PublicOnlyRoute>
          <LoginPage />
        </PublicOnlyRoute>
      } />
      <Route path="/register" element={
        <PublicOnlyRoute>
          <RegisterPage />
        </PublicOnlyRoute>
      } />
      
      {/* 보호된 라우트 (로그인 필요) */}
      <Route path="/mypage/*" element={
        <ProtectedRoute>
          <MyPage />
        </ProtectedRoute>
      } />
      
      {/* 관리자 페이지 */}
      <Route path="/admin/*" element={
        <AdminRoute>
          <AdminPage />
        </AdminRoute>
      } />
      
      {/* 테스트 페이지 */}
      <Route path="/test" element={<TestPage />} />
      
      {/* 404 페이지 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRoutes;