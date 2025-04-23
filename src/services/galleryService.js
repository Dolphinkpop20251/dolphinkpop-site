import { 
  collection, 
  doc, 
  addDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  startAfter,
  serverTimestamp,
  increment,
  arrayUnion,
  arrayRemove,
  setDoc
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from './firebase';
import { MAX_UPLOAD_LIMITS } from '../utils/constants';

// 갤러리 이미지 업로드
export const uploadGalleryImage = async (imageData, imageFile, userId) => {
  try {
    // 이미지 파일 크기 확인 (5MB 제한)
    const fileSizeInMB = imageFile.size / (1024 * 1024);
    if (fileSizeInMB > MAX_UPLOAD_LIMITS.PROFILE_PHOTO_SIZE_MB) {
      return { 
        success: false, 
        error: `이미지 크기는 ${MAX_UPLOAD_LIMITS.PROFILE_PHOTO_SIZE_MB}MB 이하만 가능합니다.` 
      };
    }
    
    // 파일 확장자 추출
    const fileExtension = imageFile.name.split('.').pop().toLowerCase();
    
    // 허용된 이미지 형식인지 확인
    const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
    if (!allowedExtensions.includes(fileExtension)) {
      return { 
        success: false, 
        error: '지원되는 이미지 형식은 JPG, PNG, GIF, WEBP입니다.' 
      };
    }
    
    // 스토리지에 이미지 업로드
    const storageRef = ref(
      storage, 
      `galleries/${userId}/${Date.now()}_${imageFile.name}`
    );
    
    const uploadResult = await uploadBytes(storageRef, imageFile);
    const imageUrl = await getDownloadURL(uploadResult.ref);
    
    // Firestore에 이미지 메타데이터 저장
    const newImage = {
      ...imageData,
      url: imageUrl,
      uploadedBy: userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      likeCount: 0,
      viewCount: 0
    };
    
    const docRef = await addDoc(collection(db, 'galleries'), newImage);
    
    return { success: true, imageId: docRef.id, imageUrl };
  } catch (error) {
    console.error('이미지 업로드 오류:', error);
    return { success: false, error: error.message };
  }
};

// 갤러리 이미지 목록 가져오기
export const getGallery = async (lastDoc = null, imagesPerPage = 20) => {
  try {
    let imagesQuery;
    
    if (lastDoc) {
      imagesQuery = query(
        collection(db, 'galleries'),
        orderBy('createdAt', 'desc'),
        startAfter(lastDoc),
        limit(imagesPerPage)
      );
    } else {
      imagesQuery = query(
        collection(db, 'galleries'),
        orderBy('createdAt', 'desc'),
        limit(imagesPerPage)
      );
    }
    
    const querySnapshot = await getDocs(imagesQuery);
    
    const images = [];
    querySnapshot.forEach((doc) => {
      const imageData = doc.data();
      
      // 타임스탬프를 Date 객체로 변환
      const createdAt = imageData.createdAt?.toDate 
        ? imageData.createdAt.toDate() 
        : new Date(imageData.createdAt);
      
      images.push({
        id: doc.id,
        ...imageData,
        createdAt
      });
    });
    
    const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];
    
    return { 
      success: true, 
      images, 
      lastVisible,
      hasMore: querySnapshot.docs.length === imagesPerPage
    };
  } catch (error) {
    console.error('갤러리 불러오기 오류:', error);
    return { success: false, error: error.message };
  }
};

// 특정 이미지 상세 정보 가져오기
export const getGalleryImage = async (imageId) => {
  try {
    const imageDoc = await getDoc(doc(db, 'galleries', imageId));
    
    if (!imageDoc.exists()) {
      return { success: false, error: '이미지를 찾을 수 없습니다.' };
    }
    
    const imageData = imageDoc.data();
    
    // 이미지 조회수 증가
    await updateDoc(doc(db, 'galleries', imageId), {
      viewCount: increment(1)
    });
    
    return { 
      success: true, 
      image: { 
        id: imageDoc.id, 
        ...imageData 
      } 
    };
  } catch (error) {
    console.error('이미지 상세 정보 불러오기 오류:', error);
    return { success: false, error: error.message };
  }
};

// 이미지 수정
export const updateGalleryImage = async (imageId, updateData) => {
  try {
    await updateDoc(doc(db, 'galleries', imageId), {
      ...updateData,
      updatedAt: serverTimestamp()
    });
    
    return { success: true };
  } catch (error) {
    console.error('이미지 업데이트 오류:', error);
    return { success: false, error: error.message };
  }
};

// 이미지 삭제
export const deleteGalleryImage = async (imageId) => {
  try {
    const imageDoc = await getDoc(doc(db, 'galleries', imageId));
    
    if (!imageDoc.exists()) {
      return { success: false, error: '이미지를 찾을 수 없습니다.' };
    }
    
    const imageData = imageDoc.data();
    
    // 스토리지에서 이미지 파일 삭제
    if (imageData.url) {
      try {
        const storageRef = ref(storage, imageData.url);
        await deleteObject(storageRef);
      } catch (storageError) {
        console.error('스토리지 이미지 삭제 오류:', storageError);
        // 스토리지 삭제 실패해도 문서는 삭제 진행
      }
    }
    
    // Firestore에서 이미지 문서 삭제
    await deleteDoc(doc(db, 'galleries', imageId));
    
    return { success: true };
  } catch (error) {
    console.error('이미지 삭제 오류:', error);
    return { success: false, error: error.message };
  }
};

// 이미지 좋아요 추가
export const likeGalleryImage = async (imageId, userId) => {
  try {
    const imageRef = doc(db, 'galleries', imageId);
    const likeRef = doc(db, 'galleries', imageId, 'likes', userId);
    
    // 좋아요 정보 저장
    await setDoc(likeRef, {
      userId,
      createdAt: serverTimestamp()
    });
    
    // 이미지의 좋아요 수 증가
    await updateDoc(imageRef, {
      likeCount: increment(1),
      likedBy: arrayUnion(userId)
    });
    
    return { success: true };
  } catch (error) {
    console.error('이미지 좋아요 오류:', error);
    return { success: false, error: error.message };
  }
};

// 이미지 좋아요 취소
export const unlikeGalleryImage = async (imageId, userId) => {
  try {
    const imageRef = doc(db, 'galleries', imageId);
    const likeRef = doc(db, 'galleries', imageId, 'likes', userId);
    
    // 좋아요 정보 삭제
    await deleteDoc(likeRef);
    
    // 이미지의 좋아요 수 감소
    await updateDoc(imageRef, {
      likeCount: increment(-1),
      likedBy: arrayRemove(userId)
    });
    
    return { success: true };
  } catch (error) {
    console.error('이미지 좋아요 취소 오류:', error);
    return { success: false, error: error.message };
  }
};

// 사용자 갤러리 이미지 가져오기
export const getUserGalleryImages = async (userId, lastDoc = null, imagesPerPage = 20) => {
  try {
    let imagesQuery;
    
    if (lastDoc) {
      imagesQuery = query(
        collection(db, 'galleries'),
        where('uploadedBy', '==', userId),
        orderBy('createdAt', 'desc'),
        startAfter(lastDoc),
        limit(imagesPerPage)
      );
    } else {
      imagesQuery = query(
        collection(db, 'galleries'),
        where('uploadedBy', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(imagesPerPage)
      );
    }
    
    const querySnapshot = await getDocs(imagesQuery);
    
    const images = [];
    querySnapshot.forEach((doc) => {
      images.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];
    
    return { 
      success: true, 
      images, 
      lastVisible,
      hasMore: querySnapshot.docs.length === imagesPerPage
    };
  } catch (error) {
    console.error('사용자 갤러리 불러오기 오류:', error);
    return { success: false, error: error.message };
  }
};

// getUserGalleries 함수 - 호환성을 위해 getUserGalleryImages의 별칭으로 제공
export const getUserGalleries = getUserGalleryImages;

// 아이돌 기반 이미지 검색
export const searchGalleryByIdol = async (idolId, lastDoc = null, imagesPerPage = 20) => {
  try {
    let imagesQuery;
    
    if (lastDoc) {
      imagesQuery = query(
        collection(db, 'galleries'),
        where('idolId', '==', idolId),
        orderBy('createdAt', 'desc'),
        startAfter(lastDoc),
        limit(imagesPerPage)
      );
    } else {
      imagesQuery = query(
        collection(db, 'galleries'),
        where('idolId', '==', idolId),
        orderBy('createdAt', 'desc'),
        limit(imagesPerPage)
      );
    }
    
    const querySnapshot = await getDocs(imagesQuery);
    
    const images = [];
    querySnapshot.forEach((doc) => {
      images.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];
    
    return { 
      success: true, 
      images, 
      lastVisible,
      hasMore: querySnapshot.docs.length === imagesPerPage
    };
  } catch (error) {
    console.error('아이돌 갤러리 검색 오류:', error);
    return { success: false, error: error.message };
  }
};

// getIdolGalleries 함수 - 호환성을 위해 searchGalleryByIdol의 별칭으로 제공
export const getIdolGalleries = searchGalleryByIdol;

// 태그 기반 이미지 검색
export const searchGalleryByTags = async (tag, lastDoc = null, imagesPerPage = 20) => {
  try {
    let imagesQuery;
    
    if (lastDoc) {
      imagesQuery = query(
        collection(db, 'galleries'),
        where('tags', 'array-contains', tag),
        orderBy('createdAt', 'desc'),
        startAfter(lastDoc),
        limit(imagesPerPage)
      );
    } else {
      imagesQuery = query(
        collection(db, 'galleries'),
        where('tags', 'array-contains', tag),
        orderBy('createdAt', 'desc'),
        limit(imagesPerPage)
      );
    }
    
    const querySnapshot = await getDocs(imagesQuery);
    
    const images = [];
    querySnapshot.forEach((doc) => {
      images.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];
    
    return { 
      success: true, 
      images, 
      lastVisible,
      hasMore: querySnapshot.docs.length === imagesPerPage
    };
  } catch (error) {
    console.error('태그 갤러리 검색 오류:', error);
    return { success: false, error: error.message };
  }
};

// 인기 이미지 가져오기
export const getPopularGalleryImages = async (limit = 10) => {
  try {
    const imagesQuery = query(
      collection(db, 'galleries'),
      orderBy('likeCount', 'desc'),
      limit(limit)
    );
    
    const querySnapshot = await getDocs(imagesQuery);
    
    const images = [];
    querySnapshot.forEach((doc) => {
      images.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return { success: true, images };
  } catch (error) {
    console.error('인기 이미지 불러오기 오류:', error);
    return { success: false, error: error.message };
  }
};

// getPopularGalleries 함수 - 호환성을 위해 getPopularGalleryImages의 별칭으로 제공
export const getPopularGalleries = getPopularGalleryImages;

// 이미지 좋아요 상태 확인
export const checkGalleryImageLike = async (imageId, userId) => {
  try {
    const likeRef = doc(db, 'galleries', imageId, 'likes', userId);
    const likeDoc = await getDoc(likeRef);
    
    return { success: true, liked: likeDoc.exists() };
  } catch (error) {
    console.error('이미지 좋아요 상태 확인 오류:', error);
    return { success: false, error: error.message };
  }
};

// 갤러리 개수 가져오기
export const getGalleryCount = async () => {
  try {
    const snapshot = await getDocs(collection(db, 'galleries'));
    return { success: true, count: snapshot.size };
  } catch (error) {
    console.error('갤러리 개수 조회 오류:', error);
    return { success: false, error: error.message, count: 0 };
  }
};