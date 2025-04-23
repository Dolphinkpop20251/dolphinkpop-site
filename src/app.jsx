import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import AppRoutes from './routes';
import { useAuth } from './hooks/useAuth';
import { useLoading } from './hooks/useLoading';
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import Loading from './components/common/Loading';
import Toast from './components/common/Toast';
import ErrorBoundary from './components/common/ErrorBoundary';

const App = () => {
  const { pathname } = useLocation();
  const { currentUser, isAuthReady } = useAuth();
  const { isLoading } = useLoading();

  // 페이지 이동 시 스크롤 맨 위로
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  // 인증 처리가 완료될 때까지 로딩 화면 표시
  if (!isAuthReady) {
    return <Loading fullscreen message="사이트를 불러오는 중..." />;
  }

  return (
    <ErrorBoundary>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow pt-16">
          {isLoading && <Loading />}
          <AppRoutes />
        </main>
        <Footer />
        <Toast />
      </div>
    </ErrorBoundary>
  );
};

export default App;