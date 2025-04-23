import { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  onSnapshot,
  doc,
  getDoc,
  getDocs
} from 'firebase/firestore';
import { db } from '../services/firebase';

// Firestore 실시간 데이터 구독 커스텀 훅
export const useFirestore = (collectionName, options = {}) => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // 옵션 파라미터
  const { 
    whereClause = [], 
    orderByClause = null,
    limitCount = null,
    listen = true // 실시간 업데이트 여부
  } = options;
  
  useEffect(() => {
    setIsLoading(true);
    
    // 컬렉션 참조 생성
    let collectionRef = collection(db, collectionName);
    let queryRef = collectionRef;
    
    // 쿼리 조건 적용
    if (whereClause.length > 0) {
      whereClause.forEach(clause => {
        if (clause.length === 3) {
          queryRef = query(queryRef, where(clause[0], clause[1], clause[2]));
        }
      });
    }
    
    // 정렬 조건 적용
    if (orderByClause) {
      queryRef = query(queryRef, orderBy(orderByClause.field, orderByClause.direction || 'asc'));
    }
    
    // 결과 제한 적용
    if (limitCount) {
      queryRef = query(queryRef, limit(limitCount));
    }
    
    // 실시간 리스너 설정 또는 일회성 쿼리 실행
    let unsubscribe;
    
    if (listen) {
      // 실시간 구독
      unsubscribe = onSnapshot(queryRef, 
        (snapshot) => {
          const documents = [];
          snapshot.forEach(doc => {
            documents.push({ id: doc.id, ...doc.data() });
          });
          setData(documents);
          setIsLoading(false);
          setError(null);
        },
        (err) => {
          console.error('Firestore 구독 오류:', err);
          setError(err);
          setIsLoading(false);
        }
      );
    } else {
      // 일회성 쿼리 실행
      const fetchData = async () => {
        try {
          const snapshot = await getDocs(queryRef);
          const documents = [];
          snapshot.forEach(doc => {
            documents.push({ id: doc.id, ...doc.data() });
          });
          setData(documents);
          setError(null);
        } catch (err) {
          console.error('Firestore 쿼리 오류:', err);
          setError(err);
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchData();
    }
    
    // 구독 해제
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [collectionName, JSON.stringify(whereClause), JSON.stringify(orderByClause), limitCount, listen]);
  
  return { data, isLoading, error };
};

// 단일 문서 실시간 구독 커스텀 훅
export const useDocument = (collectionName, documentId, listen = true) => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    if (!documentId) {
      setData(null);
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    
    // 문서 참조 생성
    const docRef = doc(db, collectionName, documentId);
    
    // 실시간 리스너 설정 또는 일회성 조회
    let unsubscribe;
    
    if (listen) {
      // 실시간 구독
      unsubscribe = onSnapshot(docRef, 
        (docSnapshot) => {
          if (docSnapshot.exists()) {
            setData({ id: docSnapshot.id, ...docSnapshot.data() });
          } else {
            setData(null);
          }
          setIsLoading(false);
          setError(null);
        },
        (err) => {
          console.error('Firestore 문서 구독 오류:', err);
          setError(err);
          setIsLoading(false);
        }
      );
    } else {
      // 일회성 조회
      const fetchDocument = async () => {
        try {
          const docSnapshot = await getDoc(docRef);
          if (docSnapshot.exists()) {
            setData({ id: docSnapshot.id, ...docSnapshot.data() });
          } else {
            setData(null);
          }
          setError(null);
        } catch (err) {
          console.error('Firestore 문서 조회 오류:', err);
          setError(err);
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchDocument();
    }
    
    // 구독 해제
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [collectionName, documentId, listen]);
  
  return { data, isLoading, error };
};
