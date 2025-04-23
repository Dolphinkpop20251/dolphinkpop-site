import React, { Component } from 'react';
import { FaExclamationTriangle } from 'react-icons/fa';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    // 다음 렌더링에서 폴백 UI가 보이도록 상태를 업데이트
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // 에러 리포팅 서비스에 에러를 기록
    console.error('ErrorBoundary caught an error', error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    
    // 여기에 에러 로깅 서비스 호출 가능 (ex: Sentry)
  }

  handleRefresh = () => {
    window.location.reload();
  };

  handleGoBack = () => {
    window.history.back();
  };

  render() {
    if (this.state.hasError) {
      // 폴백 UI를 렌더링
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-800 px-4">
          <div className="text-center max-w-md">
            <div className="bg-white dark:bg-dark-700 p-8 rounded-lg shadow-md">
              <div className="flex justify-center mb-4">
                <FaExclamationTriangle className="text-red-500" size={48} />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                오류가 발생했습니다
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                페이지를 로드하는 중에 문제가 발생했습니다. 새로고침을 하거나 이전 페이지로 돌아가 다시 시도해 주세요.
              </p>
              
              {/* 개발 환경에서만 상세한 에러 정보 표시 */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="mt-4 mb-6 p-4 bg-gray-100 dark:bg-dark-600 rounded text-left overflow-auto text-sm text-gray-800 dark:text-gray-200">
                  <p className="font-bold">에러 메시지:</p>
                  <p className="mb-2">{this.state.error.toString()}</p>
                  <p className="font-bold">컴포넌트 스택:</p>
                  <pre className="whitespace-pre-wrap">{this.state.errorInfo && this.state.errorInfo.componentStack}</pre>
                </div>
              )}
              
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={this.handleRefresh}
                  className="btn btn-primary"
                >
                  새로고침
                </button>
                <button
                  onClick={this.handleGoBack}
                  className="btn btn-outline"
                >
                  이전 페이지로 돌아가기
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // 에러가 없으면 자식 컴포넌트를 정상적으로 렌더링
    return this.props.children;
  }
}

export default ErrorBoundary;