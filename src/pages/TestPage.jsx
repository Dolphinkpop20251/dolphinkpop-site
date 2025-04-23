import React from 'react';
import FirebaseConnectionTest from '../components/test/FirebaseConnectionTest';

const TestPage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Dolphin 테스트 페이지</h1>
      
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Firebase 연결 테스트</h2>
          <p className="mb-4 text-gray-700">
            이 페이지는 Firebase 서비스와의 연결을 테스트합니다. 
            모든 테스트가 성공적으로 통과하면 Firebase 설정이 올바르게 구성된 것입니다.
          </p>
          
          <FirebaseConnectionTest />
        </div>
      </div>
    </div>
  );
};

export default TestPage;