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
  setDoc
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from './firebase';

// 비디오 생성
export const createVideo = async (videoData, thumbnailImage, authorId) => {
  try {
    // 비디오 기본 데이터
    const newVideo = {
      ...videoData,
      authorId,
      viewCount: 0,
      likeCount: 0,
      commentCount: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    // 썸네일 이미지 업로드
    if (thumbnailImage) {
      const storageRef = ref(storage, `videos/thumbnails/${authorId}/${Date.now()}_thumbnail`);
      await uploadBytes(storageRef, thumbnailImage);
      const thumbnailUrl = await getDownloadURL(storageRef);
      
      newVideo.thumbnailUrl = thumbnailUrl;
    }
    
    // Firestore에 비디오 저장
    const videoRef = await addDoc(collection(db, 'videos'), newVideo);
    
    return { success: true, videoId: videoRef.id };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// 비디오 목록 가져오기 (페이지네이션)
export const getVideos = async (lastDoc = null, videosPerPage = 12, idolFilter = null) => {
  try {
    let videosQuery;
    
    if (idolFilter) {
      // 아이돌별 필터링
      videosQuery = query(
        collection(db, 'videos'),
        where('idolId', '==', idolFilter),
        orderBy('createdAt', 'desc'),
        limit(videosPerPage)
      );
    } else {
      // 전체 비디오
      videosQuery = query(
        collection(db, 'videos'),
        orderBy('createdAt', 'desc'),
        limit(videosPerPage)
      );
    }
    
    // 페이지네이션을 위한 시작점 설정
    if (lastDoc) {
      if (idolFilter) {
        videosQuery = query(
          collection(db, 'videos'),
          where('idolId', '==', idolFilter),
          orderBy('createdAt', 'desc'),
          startAfter(lastDoc),
          limit(videosPerPage)
        );
      } else {
        videosQuery = query(
          collection(db, 'videos'),
          orderBy('createdAt', 'desc'),
          startAfter(lastDoc),
          limit(videosPerPage)
        );
      }
    }
    
    const querySnapshot = await getDocs(videosQuery);
    
    const videos = [];
    querySnapshot.forEach((doc) => {
      videos.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];
    
    return { 
      success: true, 
      videos, 
      lastVisible,
      hasMore: querySnapshot.docs.length === videosPerPage
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// 특정 비디오 가져오기
export const getVideoById = async (videoId) => {
  try {
    const videoDoc = await getDoc(doc(db, 'videos', videoId));
    
    if (!videoDoc.exists()) {
      return { success: false, error: '비디오를 찾을 수 없습니다.' };
    }
    
    // 조회수 증가
    await updateDoc(doc(db, 'videos', videoId), {
      viewCount: increment(1)
    });
    
    const video = {
      id: videoDoc.id,
      ...videoDoc.data()
    };
    
    return { success: true, video };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// 비디오 수정
export const updateVideo = async (videoId, videoData, newThumbnailImage = null) => {
  try {
    const videoRef = doc(db, 'videos', videoId);
    const videoSnapshot = await getDoc(videoRef);
    
    if (!videoSnapshot.exists()) {
      return { success: false, error: '비디오를 찾을 수 없습니다.' };
    }
    
    const currentVideo = videoSnapshot.data();
    let updateData = { ...videoData, updatedAt: serverTimestamp() };
    
    // 새 썸네일 이미지가 있으면 업로드
    if (newThumbnailImage) {
      // 기존 썸네일이 있으면 삭제
      if (currentVideo.thumbnailUrl) {
        try {
          const oldImageRef = ref(storage, currentVideo.thumbnailUrl);
          await deleteObject(oldImageRef);
        } catch (error) {
          console.error('기존 썸네일 삭제 실패:', error);
          // 기존 썸네일 삭제 실패는 무시하고 계속 진행
        }
      }
      
      // 새 썸네일 업로드
      const storageRef = ref(storage, `videos/thumbnails/${currentVideo.authorId}/${Date.now()}_thumbnail`);
      await uploadBytes(storageRef, newThumbnailImage);
      const thumbnailUrl = await getDownloadURL(storageRef);
      
      updateData.thumbnailUrl = thumbnailUrl;
    }
    
    // 비디오 정보 업데이트
    await updateDoc(videoRef, updateData);
    
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// 비디오 삭제
export const deleteVideo = async (videoId) => {
  try {
    const videoRef = doc(db, 'videos', videoId);
    const videoSnapshot = await getDoc(videoRef);
    
    if (!videoSnapshot.exists()) {
      return { success: false, error: '비디오를 찾을 수 없습니다.' };
    }
    
    const videoData = videoSnapshot.data();
    
    // 썸네일 이미지 삭제
    if (videoData.thumbnailUrl) {
      try {
        const imageRef = ref(storage, videoData.thumbnailUrl);
        await deleteObject(imageRef);
      } catch (error) {
        console.error('썸네일 삭제 실패:', error);
        // 썸네일 삭제 실패는 무시하고 계속 진행
      }
    }
    
    // 비디오에 연결된 댓글 삭제
    const commentsQuery = query(
      collection(db, 'videos', videoId, 'comments')
    );
    const commentsSnapshot = await getDocs(commentsQuery);
    
    commentsSnapshot.forEach(async (commentDoc) => {
      await deleteDoc(doc(db, 'videos', videoId, 'comments', commentDoc.id));
    });
    
    // 비디오에 연결된 좋아요 삭제
    const likesQuery = query(
      collection(db, 'videos', videoId, 'likes')
    );
    const likesSnapshot = await getDocs(likesQuery);
    
    likesSnapshot.forEach(async (likeDoc) => {
      await deleteDoc(doc(db, 'videos', videoId, 'likes', likeDoc.id));
    });
    
    // 비디오 삭제
    await deleteDoc(videoRef);
    
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// 비디오 좋아요 추가
export const likeVideo = async (videoId, userId) => {
  try {
    const videoRef = doc(db, 'videos', videoId);
    const likeRef = doc(db, 'videos', videoId, 'likes', userId);
    
    // 좋아요 정보 저장
    await setDoc(likeRef, {
      userId,
      createdAt: serverTimestamp()
    });
    
    // 비디오의 좋아요 수 증가
    await updateDoc(videoRef, {
      likeCount: increment(1)
    });
    
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// 비디오 좋아요 취소
export const unlikeVideo = async (videoId, userId) => {
  try {
    const videoRef = doc(db, 'videos', videoId);
    const likeRef = doc(db, 'videos', videoId, 'likes', userId);
    
    // 좋아요 정보 삭제
    await deleteDoc(likeRef);
    
    // 비디오의 좋아요 수 감소
    await updateDoc(videoRef, {
      likeCount: increment(-1)
    });
    
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// 비디오 좋아요 상태 확인
export const checkVideoLike = async (videoId, userId) => {
  try {
    const likeRef = doc(db, 'videos', videoId, 'likes', userId);
    const likeDoc = await getDoc(likeRef);
    
    return { success: true, liked: likeDoc.exists() };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// 댓글 추가
export const addVideoComment = async (videoId, commentData) => {
  try {
    const commentRef = await addDoc(
      collection(db, 'videos', videoId, 'comments'),
      {
        ...commentData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }
    );
    
    // 비디오의 댓글 수 증가
    await updateDoc(doc(db, 'videos', videoId), {
      commentCount: increment(1)
    });
    
    return { success: true, commentId: commentRef.id };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// 댓글 목록 가져오기
export const getVideoComments = async (videoId) => {
  try {
    const commentsQuery = query(
      collection(db, 'videos', videoId, 'comments'),
      orderBy('createdAt', 'asc')
    );
    
    const querySnapshot = await getDocs(commentsQuery);
    
    const comments = [];
    querySnapshot.forEach((doc) => {
      comments.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return { success: true, comments };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// 댓글 수정
export const updateVideoComment = async (videoId, commentId, commentText) => {
  try {
    const commentRef = doc(db, 'videos', videoId, 'comments', commentId);
    
    await updateDoc(commentRef, {
      text: commentText,
      updatedAt: serverTimestamp(),
      isEdited: true
    });
    
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// 댓글 삭제
export const deleteVideoComment = async (videoId, commentId) => {
  try {
    await deleteDoc(doc(db, 'videos', videoId, 'comments', commentId));
    
    // 비디오의 댓글 수 감소
    await updateDoc(doc(db, 'videos', videoId), {
      commentCount: increment(-1)
    });
    
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// 특정 사용자의 비디오 가져오기
export const getUserVideos = async (userId, lastDoc = null, videosPerPage = 12) => {
  try {
    let videosQuery = query(
      collection(db, 'videos'),
      where('authorId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(videosPerPage)
    );
    
    if (lastDoc) {
      videosQuery = query(
        collection(db, 'videos'),
        where('authorId', '==', userId),
        orderBy('createdAt', 'desc'),
        startAfter(lastDoc),
        limit(videosPerPage)
      );
    }
    
    const querySnapshot = await getDocs(videosQuery);
    
    const videos = [];
    querySnapshot.forEach((doc) => {
      videos.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];
    
    return {
      success: true,
      videos,
      lastVisible,
      hasMore: querySnapshot.docs.length === videosPerPage
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// 인기 비디오 가져오기 (조회수 순)
export const getPopularVideos = async (limit = 6) => {
  try {
    const videosQuery = query(
      collection(db, 'videos'),
      orderBy('viewCount', 'desc'),
      limit(limit)
    );
    
    const querySnapshot = await getDocs(videosQuery);
    
    const videos = [];
    querySnapshot.forEach((doc) => {
      videos.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return { success: true, videos };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// 비디오 검색
export const searchVideos = async (searchTerm, lastDoc = null, videosPerPage = 12) => {
  try {
    // Firestore는 전체 텍스트 검색을 직접 지원하지 않으므로
    // 제목에서 검색하는 간단한 방식으로 구현
    
    let videosQuery = query(
      collection(db, 'videos'),
      where('title', '>=', searchTerm),
      where('title', '<=', searchTerm + '\uf8ff'), // 부분 일치 검색을 위한 트릭
      orderBy('title'),
      orderBy('createdAt', 'desc'),
      limit(videosPerPage)
    );
    
    if (lastDoc) {
      videosQuery = query(
        collection(db, 'videos'),
        where('title', '>=', searchTerm),
        where('title', '<=', searchTerm + '\uf8ff'),
        orderBy('title'),
        orderBy('createdAt', 'desc'),
        startAfter(lastDoc),
        limit(videosPerPage)
      );
    }
    
    const querySnapshot = await getDocs(videosQuery);
    
    const videos = [];
    querySnapshot.forEach((doc) => {
      videos.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];
    
    return {
      success: true,
      videos,
      lastVisible,
      hasMore: querySnapshot.docs.length === videosPerPage
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// 아이돌 관련 비디오 가져오기
export const getIdolVideos = async (idolId, limit = 4) => {
  try {
    const videosQuery = query(
      collection(db, 'videos'),
      where('idols', 'array-contains', { id: idolId }),
      orderBy('createdAt', 'desc'),
      limit(limit)
    );
    
    const querySnapshot = await getDocs(videosQuery);
    
    const videos = [];
    querySnapshot.forEach((doc) => {
      videos.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return { success: true, videos };
  } catch (error) {
    return { success: false, error: error.message };
  }
};