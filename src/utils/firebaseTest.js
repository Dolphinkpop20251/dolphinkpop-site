/**
 * Firebase 연결을 테스트하고 오류를 더 친절하게 표시하기 위한 유틸리티
 */
import { db, auth, storage } from '../services/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { ref, getDownloadURL } from 'firebase/storage';

/**
 * Firebase 서비스 상태를 테스트합니다
 * @returns {Promise<Object>} 테스트 결과 객체
 */
export const testFirebaseServices = async () => {
  const results = {
    network: navigator.onLine,
    auth: !!auth,
    firestore: !!db,
    storage: !!storage,
    firestoreQuery: false,
    storageAccess: false,
    errors: []
  };
  
  console.log('Firebase 서비스 테스트 시작');
  console.log('네트워크 연결 상태:', results.network ? '온라인' : '오프라인');
  
  // 네트워크 연결 확인
  if (!results.network) {
    results.errors.push({
      service: 'network',
      error: '오프라인 상태입니다'
    });
    return results;
  }
  
  // Firebase 초기화 확인
  if (!results.firestore) {
    results.errors.push({
      service: 'firestore',
      error: 'Firestore가 초기화되지 않았습니다'
    });
  }
  
  if (!results.storage) {
    results.errors.push({
      service: 'storage',
      error: 'Storage가 초기화되지 않았습니다'
    });
  }
  
  if (!results.auth) {
    results.errors.push({
      service: 'auth',
      error: '인증 서비스가 초기화되지 않았습니다'
    });
  }
  
  // 필수 서비스가 초기화되지 않았으면 더 이상 테스트하지 않음
  if (!results.firestore || !results.auth) {
    return results;
  }
  
  // Firestore 쿼리 테스트
  try {
    // 테스트 문서에 접근 시도 (문서가 없어도 연결 성공으로 간주)
    const testDocRef = doc(db, 'users', 'test-connection');
    await getDoc(testDocRef);
    results.firestoreQuery = true;
    console.log('Firestore 쿼리 테스트 성공');
  } catch (error) {
    results.errors.push({
      service: 'firestore',
      error: error.message || '데이터베이스 쿼리 실패'
    });
    console.error('Firestore 쿼리 테스트 실패:', error);
  }
  
  // Storage 액세스 테스트 (선택 사항)
  if (results.storage) {
    try {
      // 존재하지 않는 파일을 요청해도 연결 자체는 테스트 가능
      const testRef = ref(storage, 'test-connection.txt');
      try {
        await getDownloadURL(testRef);
        results.storageAccess = true;
      } catch (notFoundError) {
        // 파일이 없어도 스토리지 연결 자체는 성공으로 처리
        if (notFoundError.code === 'storage/object-not-found') {
          results.storageAccess = true;
          console.log('Storage 연결 테스트 성공 (파일 없음)');
        } else {
          throw notFoundError;
        }
      }
    } catch (error) {
      console.log('Storage 테스트 오류 (선택 사항):', error);
      // 오류는 기록하지만 결과에 포함하지는 않음 (선택적 기능)
    }
  }
  
  return results;
};

/**
 * Firebase 오류 메시지를 사용자 친화적으로 변환합니다
 * @param {Error} error Firebase 오류 객체
 * @returns {string} 사용자 친화적인 오류 메시지
 */
export const getFirebaseErrorMessage = (error) => {
  if (!error) return '알 수 없는 오류가 발생했습니다.';
  
  const errorCode = error.code || '';
  const errorMessage = error.message || '';
  
  // 네트워크 관련 오류
  if (
    !navigator.onLine || 
    errorMessage.includes('network') || 
    errorMessage.includes('offline') ||
    errorMessage.includes('internet')
  ) {
    return '인터넷 연결이 끊겼습니다. 네트워크 연결을 확인해주세요.';
  }
  
  // API 키 관련 오류
  if (errorCode === 'auth/invalid-api-key' || errorMessage.includes('api key')) {
    return 'Firebase API 키가 올바르지 않습니다. 관리자에게 문의해주세요.';
  }
  
  // 앱 구성 관련 오류
  if (errorCode.includes('app-deleted') || errorCode.includes('app-not-authorized')) {
    return 'Firebase 앱 구성에 문제가 있습니다. 관리자에게 문의해주세요.';
  }
  
  // 권한 관련 오류
  if (errorMessage.includes('permission-denied') || errorCode.includes('permission-denied')) {
    return '권한이 없습니다. 로그인 후 다시 시도해주세요.';
  }
  
  // 타임아웃 관련 오류
  if (errorMessage.includes('timeout') || errorCode.includes('timeout')) {
    return '서버 응답 시간이 초과되었습니다. 잠시 후 다시 시도해주세요.';
  }
  
  // 기타 오류는 그대로 반환
  return errorMessage || '오류가 발생했습니다. 다시 시도해주세요.';
};

export default { testFirebaseServices, getFirebaseErrorMessage };