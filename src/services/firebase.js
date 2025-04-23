import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';
import firebaseConfig from './firebaseConfig';

console.log('Firebase 초기화 시작');

// Firebase 앱 초기화
let app, auth, db, storage, analytics;

try {
  app = initializeApp(firebaseConfig);
  console.log('Firebase 앱 초기화 성공');
  
  // Firebase 인증
  auth = getAuth(app);
  console.log('Firebase 인증 초기화 성공');
  
  // Firestore 데이터베이스
  db = getFirestore(app);
  console.log('Firestore 데이터베이스 초기화 성공');
  
  // Firebase 스토리지
  storage = getStorage(app);
  console.log('Firebase 스토리지 초기화 성공');
  
  // Firebase 분석 (선택 사항)
  if (typeof window !== 'undefined') {
    try {
      analytics = getAnalytics(app);
      console.log('Firebase 분석 초기화 성공');
    } catch (analyticsError) {
      console.warn('Firebase 분석 초기화 실패:', analyticsError);
    }
  }
} catch (error) {
  console.error('Firebase 초기화 오류:', error);
}

// 네트워크 연결 확인 상태
const isNetworkConnected = () => navigator.onLine;

// Firebase 연결 테스트 함수
const checkFirebaseConnection = async () => {
  if (!isNetworkConnected()) {
    console.log('네트워크 연결 없음: 오프라인 상태입니다');
    return false;
  }
  
  if (!db) {
    console.log('Firestore 데이터베이스가 초기화되지 않았습니다');
    return false;
  }
  
  try {
    // 실제 데이터베이스에 존재하지 않는 문서를 쿼리하여 연결을 테스트합니다
    // 문서를 찾지 못해도 연결이 성공하면 "not-found" 오류만 발생합니다
    const testRef = doc(db, 'users', 'test-connection');
    await getDoc(testRef);
    console.log('Firebase 연결 테스트 성공');
    return true;
  } catch (error) {
    console.error('Firebase 연결 테스트 실패:', error);
    return false;
  }
};

// 네트워크 상태 변경 이벤트 리스너
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    console.log('네트워크 연결됨');
  });
  
  window.addEventListener('offline', () => {
    console.log('네트워크 연결 끊김');
  });
}

export { 
  app, 
  auth, 
  db, 
  storage, 
  analytics, 
  isNetworkConnected, 
  checkFirebaseConnection 
};