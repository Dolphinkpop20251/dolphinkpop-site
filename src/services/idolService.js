import { 
  collection, 
  doc, 
  addDoc, 
  getDoc, 
  getDocs, 
  deleteDoc, 
  updateDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  startAfter,
  endBefore,
  limitToLast,
  serverTimestamp,
  increment,
  Timestamp,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from './firebase';

// 아이돌 추가
export const addIdol = async (idolData, imageFile) => {
  try {
    // 이미지 업로드
    let photoURL = null;
    
    if (imageFile) {
      const safeFileName = imageFile.name.replace(/[^a-zA-Z0-9.]/g, '_');
      const timestamp = Date.now();
      const storageRef = ref(storage, `idols/${timestamp}_${safeFileName}`);
      await uploadBytes(storageRef, imageFile);
      photoURL = await getDownloadURL(storageRef);
    }
    
    // Firestore에 아이돌 정보 저장
    const newIdol = {
      ...idolData,
      photoURL,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    // 생년월일이 문자열이면 Timestamp로 변환
    if (idolData.birthdate && typeof idolData.birthdate === 'string' && idolData.birthdate.trim() !== '') {
      try {
        const birthdateObj = new Date(idolData.birthdate);
        if (!isNaN(birthdateObj)) {
          newIdol.birthdate = Timestamp.fromDate(birthdateObj);
        }
      } catch (error) {
        console.warn('생일 날짜 변환 오류:', error);
        // 오류 발생 시 원래 문자열 그대로 사용
      }
    }
    
    const docRef = await addDoc(collection(db, 'idols'), newIdol);
    
    return { success: true, idolId: docRef.id };
  } catch (error) {
    console.error('아이돌 추가 오류:', error);
    return { success: false, error: error.message };
  }
};

// 모든 아이돌 가져오기
export const getAllIdols = async () => {
  try {
    const q = query(
      collection(db, 'idols'),
      orderBy('name', 'asc')
    );
    
    const querySnapshot = await getDocs(q);
    
    const idols = [];
    querySnapshot.forEach((doc) => {
      // 날짜 포맷팅
      const data = doc.data();
      if (data.birthdate && data.birthdate instanceof Timestamp) {
        data.birthdate = data.birthdate.toDate().toISOString().split('T')[0];
      }
      
      idols.push({
        id: doc.id,
        ...data
      });
    });
    
    return { success: true, idols };
  } catch (error) {
    console.error('아이돌 목록 조회 오류:', error);
    return { success: false, error: error.message };
  }
};

// 특정 아이돌 가져오기
export const getIdolById = async (idolId) => {
  try {
    const idolDoc = await getDoc(doc(db, 'idols', idolId));
    
    if (!idolDoc.exists()) {
      return { success: false, error: '아이돌을 찾을 수 없습니다.' };
    }
    
    const idolData = idolDoc.data();
    
    // 날짜 포맷팅
    if (idolData.birthdate && idolData.birthdate instanceof Timestamp) {
      idolData.birthdate = idolData.birthdate.toDate().toISOString().split('T')[0];
    }
    
    return { 
      success: true, 
      idol: {
        id: idolDoc.id,
        ...idolData
      }
    };
  } catch (error) {
    console.error('아이돌 조회 오류:', error);
    return { success: false, error: error.message };
  }
};

// 아이돌 정보 수정
export const updateIdol = async (idolId, idolData, imageFile) => {
  try {
    const idolRef = doc(db, 'idols', idolId);
    const idolDoc = await getDoc(idolRef);
    
    if (!idolDoc.exists()) {
      return { success: false, error: '아이돌을 찾을 수 없습니다.' };
    }
    
    const updateData = {
      ...idolData,
      updatedAt: serverTimestamp()
    };
    
    // 생년월일이 문자열이면 Timestamp로 변환
    if (idolData.birthdate && typeof idolData.birthdate === 'string' && idolData.birthdate.trim() !== '') {
      try {
        const birthdateObj = new Date(idolData.birthdate);
        if (!isNaN(birthdateObj)) {
          updateData.birthdate = Timestamp.fromDate(birthdateObj);
        }
      } catch (error) {
        console.warn('생일 날짜 변환 오류:', error);
        // 오류 발생 시 원래 문자열 그대로 사용
      }
    }
    
    // 이미지 파일이 있는 경우 업로드
    if (imageFile) {
      // 기존 이미지 삭제
      const currentIdol = idolDoc.data();
      if (currentIdol.photoURL) {
        try {
          // 스토리지 URL에서 경로 추출
          const oldImagePath = decodeURIComponent(currentIdol.photoURL.split('/o/')[1].split('?')[0]);
          const oldImageRef = ref(storage, oldImagePath);
          await deleteObject(oldImageRef);
        } catch (error) {
          console.warn('기존 이미지 삭제 실패:', error);
          // 이미지 삭제 실패해도 계속 진행
        }
      }
      
      // 새 이미지 업로드
      const safeFileName = imageFile.name.replace(/[^a-zA-Z0-9.]/g, '_');
      const timestamp = Date.now();
      const storageRef = ref(storage, `idols/${timestamp}_${safeFileName}`);
      await uploadBytes(storageRef, imageFile);
      updateData.photoURL = await getDownloadURL(storageRef);
    }
    
    // Firestore 문서 업데이트
    await updateDoc(idolRef, updateData);
    
    return { success: true };
  } catch (error) {
    console.error('아이돌 수정 오류:', error);
    return { success: false, error: error.message };
  }
};

// 아이돌 삭제
export const deleteIdol = async (idolId) => {
  try {
    const idolRef = doc(db, 'idols', idolId);
    const idolDoc = await getDoc(idolRef);
    
    if (!idolDoc.exists()) {
      return { success: false, error: '아이돌을 찾을 수 없습니다.' };
    }
    
    // 이미지 삭제
    const idolData = idolDoc.data();
    if (idolData.photoURL) {
      try {
        // 스토리지 URL에서 경로 추출
        const imagePath = decodeURIComponent(idolData.photoURL.split('/o/')[1].split('?')[0]);
        const imageRef = ref(storage, imagePath);
        await deleteObject(imageRef);
      } catch (error) {
        console.warn('이미지 삭제 실패:', error);
        // 이미지 삭제 실패해도 계속 진행
      }
    }
    
    // 문서 삭제
    await deleteDoc(idolRef);
    
    return { success: true };
  } catch (error) {
    console.error('아이돌 삭제 오류:', error);
    return { success: false, error: error.message };
  }
};

// 그룹별 아이돌 가져오기
export const getIdolsByGroup = async (groupName) => {
  try {
    const q = query(
      collection(db, 'idols'),
      where('group', '==', groupName),
      orderBy('name', 'asc')
    );
    
    const querySnapshot = await getDocs(q);
    
    const idols = [];
    querySnapshot.forEach((doc) => {
      // 날짜 포맷팅
      const data = doc.data();
      if (data.birthdate && data.birthdate instanceof Timestamp) {
        data.birthdate = data.birthdate.toDate().toISOString().split('T')[0];
      }
      
      idols.push({
        id: doc.id,
        ...data
      });
    });
    
    return { success: true, idols };
  } catch (error) {
    console.error('그룹별 아이돌 조회 오류:', error);
    return { success: false, error: error.message };
  }
};

// 페이지네이션을 위한 아이돌 목록 가져오기
export const getIdolsWithPagination = async (startAfterDoc, limit = 10) => {
  try {
    let q;
    
    if (startAfterDoc) {
      q = query(
        collection(db, 'idols'),
        orderBy('name', 'asc'),
        startAfter(startAfterDoc),
        limit(limit)
      );
    } else {
      q = query(
        collection(db, 'idols'),
        orderBy('name', 'asc'),
        limit(limit)
      );
    }
    
    const querySnapshot = await getDocs(q);
    
    const idols = [];
    querySnapshot.forEach((doc) => {
      // 날짜 포맷팅
      const data = doc.data();
      if (data.birthdate && data.birthdate instanceof Timestamp) {
        data.birthdate = data.birthdate.toDate().toISOString().split('T')[0];
      }
      
      idols.push({
        id: doc.id,
        ...data
      });
    });
    
    const lastVisible = querySnapshot.docs.length > 0 
      ? querySnapshot.docs[querySnapshot.docs.length - 1] 
      : null;
    
    return { 
      success: true, 
      idols, 
      lastVisible,
      hasMore: querySnapshot.docs.length === limit
    };
  } catch (error) {
    console.error('아이돌 페이지네이션 조회 오류:', error);
    return { success: false, error: error.message };
  }
};

// 아이돌 목록 데이터 검색
export const searchIdols = async (searchTerm) => {
  try {
    // 기본 검색은 이름을 기준으로 합니다
    // Firestore는 문자열 내 검색을 지원하지 않으므로
    // 시작 문자로 필터링하고 클라이언트에서 추가 필터링
    const nameQuery = query(
      collection(db, 'idols'),
      where('name', '>=', searchTerm),
      where('name', '<=', searchTerm + '\uf8ff')
    );
    
    const groupQuery = query(
      collection(db, 'idols'),
      where('group', '>=', searchTerm),
      where('group', '<=', searchTerm + '\uf8ff')
    );
    
    const [nameSnapshot, groupSnapshot] = await Promise.all([
      getDocs(nameQuery),
      getDocs(groupQuery)
    ]);
    
    // 중복 제거를 위한 Map
    const idolsMap = new Map();
    
    // 이름 검색 결과 처리
    nameSnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.birthdate && data.birthdate instanceof Timestamp) {
        data.birthdate = data.birthdate.toDate().toISOString().split('T')[0];
      }
      
      idolsMap.set(doc.id, {
        id: doc.id,
        ...data
      });
    });
    
    // 그룹 검색 결과 처리
    groupSnapshot.forEach((doc) => {
      if (!idolsMap.has(doc.id)) {
        const data = doc.data();
        if (data.birthdate && data.birthdate instanceof Timestamp) {
          data.birthdate = data.birthdate.toDate().toISOString().split('T')[0];
        }
        
        idolsMap.set(doc.id, {
          id: doc.id,
          ...data
        });
      }
    });
    
    // 결과를 배열로 변환
    const idols = Array.from(idolsMap.values());
    
    // 이름순 정렬
    idols.sort((a, b) => a.name.localeCompare(b.name));
    
    return { success: true, idols };
  } catch (error) {
    console.error('아이돌 검색 오류:', error);
    return { success: false, error: error.message };
  }
};

// 아이돌 개수 가져오기
export const getIdolCount = async () => {
  try {
    const snapshot = await getDocs(collection(db, 'idols'));
    return { success: true, count: snapshot.size };
  } catch (error) {
    console.error('아이돌 개수 조회 오류:', error);
    return { success: false, error: error.message, count: 0 };
  }
};

// 아이돌 가져오기 (페이지네이션 간소화 버전)
export const getIdols = async (page = 1, perPage = 10) => {
  try {
    const start = (page - 1) * perPage;
    
    const q = query(
      collection(db, 'idols'),
      orderBy('name', 'asc'),
      limit(perPage)
    );
    
    const querySnapshot = await getDocs(q);
    
    const idols = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.birthdate && data.birthdate instanceof Timestamp) {
        data.birthdate = data.birthdate.toDate().toISOString().split('T')[0];
      }
      
      idols.push({
        id: doc.id,
        ...data
      });
    });
    
    return { success: true, idols, total: idols.length };
  } catch (error) {
    console.error('아이돌 목록 조회 오류:', error);
    return { success: false, error: error.message };
  }
};

// 인기 아이돌 가져오기
export const getPopularIdols = async (limit = 5) => {
  try {
    // 인기도 정보가 있다면 그에 따라 정렬하고, 그렇지 않으면 랜덤하게
    const q = query(
      collection(db, 'idols'),
      orderBy('name'),
      limit(limit)
    );
    
    const querySnapshot = await getDocs(q);
    
    const idols = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.birthdate && data.birthdate instanceof Timestamp) {
        data.birthdate = data.birthdate.toDate().toISOString().split('T')[0];
      }
      
      idols.push({
        id: doc.id,
        ...data
      });
    });
    
    return { success: true, idols };
  } catch (error) {
    console.error('인기 아이돌 조회 오류:', error);
    return { success: false, error: error.message };
  }
};

// 아이돌 팔로우
export const followIdol = async (idolId, userId) => {
  try {
    // 사용자 문서에 팔로잉 정보 추가
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      followingIdols: arrayUnion(idolId),
      updatedAt: serverTimestamp()
    });
    
    // 아이돌 문서에 팔로워 수 증가
    const idolRef = doc(db, 'idols', idolId);
    await updateDoc(idolRef, {
      followerCount: increment(1),
      followers: arrayUnion(userId)
    });
    
    return { success: true };
  } catch (error) {
    console.error('아이돌 팔로우 오류:', error);
    return { success: false, error: error.message };
  }
};

// 아이돌 언팔로우
export const unfollowIdol = async (idolId, userId) => {
  try {
    // 사용자 문서에서 팔로잉 정보 제거
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      followingIdols: arrayRemove(idolId),
      updatedAt: serverTimestamp()
    });
    
    // 아이돌 문서에서 팔로워 수 감소
    const idolRef = doc(db, 'idols', idolId);
    await updateDoc(idolRef, {
      followerCount: increment(-1),
      followers: arrayRemove(userId)
    });
    
    return { success: true };
  } catch (error) {
    console.error('아이돌 언팔로우 오류:', error);
    return { success: false, error: error.message };
  }
};

// 아이돌 팔로우 여부 확인
export const checkIdolFollow = async (idolId, userId) => {
  try {
    if (!userId) return { success: true, following: false };
    
    const userDoc = await getDoc(doc(db, 'users', userId));
    
    if (!userDoc.exists()) {
      return { success: false, error: '사용자를 찾을 수 없습니다.' };
    }
    
    const userData = userDoc.data();
    const followingIdols = userData.followingIdols || [];
    
    return { success: true, following: followingIdols.includes(idolId) };
  } catch (error) {
    console.error('아이돌 팔로우 확인 오류:', error);
    return { success: false, error: error.message };
  }
};

// 팔로우한 아이돌 목록 가져오기
export const getFollowedIdols = async (userId) => {
  try {
    // 사용자 정보 가져오기
    const userDoc = await getDoc(doc(db, 'users', userId));
    
    if (!userDoc.exists()) {
      return { success: false, error: '사용자를 찾을 수 없습니다.' };
    }
    
    const userData = userDoc.data();
    const followingIdols = userData.followingIdols || [];
    
    if (followingIdols.length === 0) {
      return { success: true, idols: [] };
    }
    
    // 팔로우한 아이돌 정보 가져오기
    const idols = [];
    
    // batching을 사용하지 않고 각 아이돌 문서를 가져오기
    const idolPromises = followingIdols.map(idolId => 
      getDoc(doc(db, 'idols', idolId)).then(doc => {
        if (doc.exists()) {
          const data = doc.data();
          if (data.birthdate && data.birthdate instanceof Timestamp) {
            data.birthdate = data.birthdate.toDate().toISOString().split('T')[0];
          }
          
          idols.push({
            id: doc.id,
            ...data
          });
        }
      })
    );
    
    await Promise.all(idolPromises);
    
    // 이름 기준 정렬
    idols.sort((a, b) => a.name.localeCompare(b.name));
    
    return { success: true, idols };
  } catch (error) {
    console.error('팔로우한 아이돌 목록 조회 오류:', error);
    return { success: false, error: error.message };
  }
};