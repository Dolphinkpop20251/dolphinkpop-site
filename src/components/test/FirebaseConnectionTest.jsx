import React, { useState, useEffect } from 'react';
import { app, db, auth, storage } from '../../services/firebase';
import { collection, addDoc, getDocs, query, limit } from 'firebase/firestore';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';
import { onAuthStateChanged } from 'firebase/auth';

const FirebaseConnectionTest = () => {
  const [testResults, setTestResults] = useState({
    app: 'pending',
    auth: 'pending',
    firestore: 'pending',
    storage: 'pending'
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userStatus, setUserStatus] = useState('checking...');

  useEffect(() => {
    const runTests = async () => {
      setLoading(true);
      setError(null);
      const results = {
        app: 'pending',
        auth: 'pending',
        firestore: 'pending',
        storage: 'pending'
      };

      try {
        // 1. Firebase 앱 초기화 테스트
        if (app) {
          results.app = 'success';
        } else {
          results.app = 'failed';
          throw new Error('Firebase 앱 초기화 실패');
        }

        // 2. Firebase 인증 테스트
        if (auth) {
          results.auth = 'success';
          // 현재 사용자 상태 확인
          onAuthStateChanged(auth, (user) => {
            if (user) {
              setUserStatus(`로그인됨: ${user.email}`);
            } else {
              setUserStatus('로그인되지 않음');
            }
          });
        } else {
          results.auth = 'failed';
        }

        // 3. Firestore 테스트
        if (db) {
          try {
            // 테스트 컬렉션에 쓰기 (테스트용)
            const testDocRef = await addDoc(collection(db, 'connection_tests'), {
              timestamp: new Date(),
              test: 'Firebase 연결 테스트'
            });
            
            // 데이터 읽기 (확인용)
            const querySnapshot = await getDocs(
              query(collection(db, 'connection_tests'), limit(1))
            );
            
            if (querySnapshot.size > 0) {
              results.firestore = 'success';
            } else {
              results.firestore = 'warning';
            }
          } catch (firestoreError) {
            console.error('Firestore 테스트 오류:', firestoreError);
            results.firestore = 'failed';
          }
        } else {
          results.firestore = 'failed';
        }

        // 4. Storage 테스트
        if (storage) {
          try {
            // 테스트 이미지 업로드 (작은 텍스트 데이터)
            const storageRef = ref(storage, 'test/connection_test.txt');
            await uploadString(storageRef, 'Firebase Storage 연결 테스트');
            
            // URL 가져오기 (확인용)
            const downloadURL = await getDownloadURL(storageRef);
            if (downloadURL) {
              results.storage = 'success';
            } else {
              results.storage = 'warning';
            }
          } catch (storageError) {
            console.error('Storage 테스트 오류:', storageError);
            results.storage = 'failed';
          }
        } else {
          results.storage = 'failed';
        }
      } catch (mainError) {
        setError(mainError.message);
        console.error('테스트 중 오류 발생:', mainError);
      } finally {
        setTestResults(results);
        setLoading(false);
      }
    };

    runTests();
  }, []);

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Firebase 연결 테스트</h2>
      
      {loading ? (
        <div className="text-center">
          <p className="mb-4">테스트 실행 중...</p>
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      ) : (
        <>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              <p>{error}</p>
            </div>
          )}
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Firebase 앱 초기화:</span>
              <span className={`px-3 py-1 rounded-full text-white ${
                testResults.app === 'success' ? 'bg-green-500' : 
                testResults.app === 'failed' ? 'bg-red-500' : 
                testResults.app === 'warning' ? 'bg-yellow-500' : 'bg-gray-500'
              }`}>
                {testResults.app === 'success' ? '성공' : 
                 testResults.app === 'failed' ? '실패' : 
                 testResults.app === 'warning' ? '경고' : '대기 중'}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span>Firebase 인증:</span>
              <span className={`px-3 py-1 rounded-full text-white ${
                testResults.auth === 'success' ? 'bg-green-500' : 
                testResults.auth === 'failed' ? 'bg-red-500' : 
                testResults.auth === 'warning' ? 'bg-yellow-500' : 'bg-gray-500'
              }`}>
                {testResults.auth === 'success' ? '성공' : 
                 testResults.auth === 'failed' ? '실패' : 
                 testResults.auth === 'warning' ? '경고' : '대기 중'}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span>Firestore:</span>
              <span className={`px-3 py-1 rounded-full text-white ${
                testResults.firestore === 'success' ? 'bg-green-500' : 
                testResults.firestore === 'failed' ? 'bg-red-500' : 
                testResults.firestore === 'warning' ? 'bg-yellow-500' : 'bg-gray-500'
              }`}>
                {testResults.firestore === 'success' ? '성공' : 
                 testResults.firestore === 'failed' ? '실패' : 
                 testResults.firestore === 'warning' ? '경고' : '대기 중'}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span>Storage:</span>
              <span className={`px-3 py-1 rounded-full text-white ${
                testResults.storage === 'success' ? 'bg-green-500' : 
                testResults.storage === 'failed' ? 'bg-red-500' : 
                testResults.storage === 'warning' ? 'bg-yellow-500' : 'bg-gray-500'
              }`}>
                {testResults.storage === 'success' ? '성공' : 
                 testResults.storage === 'failed' ? '실패' : 
                 testResults.storage === 'warning' ? '경고' : '대기 중'}
              </span>
            </div>
            
            <div className="mt-6 pt-4 border-t border-gray-200">
              <p><strong>사용자 상태:</strong> {userStatus}</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default FirebaseConnectionTest;