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

// 게시물 생성
export const createPost = async (postData, authorId, images = []) => {
  try {
    // 게시물 기본 데이터 생성
    const newPost = {
      ...postData,
      authorId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      viewCount: 0,
      likeCount: 0,
      commentCount: 0,
      imageUrls: []
    // 아이돌 관련 게시물 가져오기
export const getIdolPosts = async (idolId, limit = 5) => {
  try {
    const postsQuery = query(
      collection(db, 'posts'),
      where('idols', 'array-contains', idolId),
      orderBy('createdAt', 'desc'),
      limit(limit)
    );
    
    const querySnapshot = await getDocs(postsQuery);
    
    const posts = [];
    querySnapshot.forEach((doc) => {
      posts.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return { success: true, posts };
  } catch (error) {
    console.error('아이돌 관련 게시물 조회 오류:', error);
    return { success: false, error: error.message };
  }
};
    
    // 이미지가 있으면 업로드
    if (images && images.length > 0) {
      const imageUrls = await Promise.all(
        images.map(async (image, index) => {
          const storageRef = ref(storage, `posts/${authorId}/${Date.now()}_${index}`);
          await uploadBytes(storageRef, image);
          return getDownloadURL(storageRef);
        })
      );
      
      newPost.imageUrls = imageUrls;
    }
    
    // Firestore에 게시물 저장
    const postRef = await addDoc(collection(db, 'posts'), newPost);
    
    return { success: true, postId: postRef.id };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// 게시물 목록 가져오기 (페이지네이션)
export const getPosts = async (lastDoc = null, postsPerPage = 10, categoryFilter = null) => {
  try {
    let postsQuery;
    
    if (categoryFilter) {
      // 카테고리별 필터링
      postsQuery = query(
        collection(db, 'posts'),
        where('category', '==', categoryFilter),
        orderBy('createdAt', 'desc'),
        limit(postsPerPage)
      );
    } else {
      // 전체 게시물
      postsQuery = query(
        collection(db, 'posts'),
        orderBy('createdAt', 'desc'),
        limit(postsPerPage)
      );
    }
    
    // 페이지네이션을 위한 시작점 설정
    if (lastDoc) {
      if (categoryFilter) {
        postsQuery = query(
          collection(db, 'posts'),
          where('category', '==', categoryFilter),
          orderBy('createdAt', 'desc'),
          startAfter(lastDoc),
          limit(postsPerPage)
        );
      } else {
        postsQuery = query(
          collection(db, 'posts'),
          orderBy('createdAt', 'desc'),
          startAfter(lastDoc),
          limit(postsPerPage)
        );
      }
    }
    
    const querySnapshot = await getDocs(postsQuery);
    
    const posts = [];
    querySnapshot.forEach((doc) => {
      posts.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];
    
    return { 
      success: true, 
      posts, 
      lastVisible,
      hasMore: querySnapshot.docs.length === postsPerPage
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// 특정 게시물 가져오기
export const getPostById = async (postId) => {
  try {
    const postDoc = await getDoc(doc(db, 'posts', postId));
    
    if (!postDoc.exists()) {
      return { success: false, error: '게시물을 찾을 수 없습니다.' };
    }
    
    // 조회수 증가
    await updateDoc(doc(db, 'posts', postId), {
      viewCount: increment(1)
    });
    
    const post = {
      id: postDoc.id,
      ...postDoc.data()
    };
    
    return { success: true, post };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// 게시물 수정
export const updatePost = async (postId, postData, newImages = []) => {
  try {
    const postRef = doc(db, 'posts', postId);
    const postSnapshot = await getDoc(postRef);
    
    if (!postSnapshot.exists()) {
      return { success: false, error: '게시물을 찾을 수 없습니다.' };
    }
    
    const currentPost = postSnapshot.data();
    
    // 이미지 업로드
    let imageUrls = [...(currentPost.imageUrls || [])];
    
    if (newImages && newImages.length > 0) {
      const newImageUrls = await Promise.all(
        newImages.map(async (image, index) => {
          const storageRef = ref(storage, `posts/${currentPost.authorId}/${Date.now()}_${index}`);
          await uploadBytes(storageRef, image);
          return getDownloadURL(storageRef);
        })
      );
      
      imageUrls = [...imageUrls, ...newImageUrls];
    }
    
    // 게시물 업데이트
    await updateDoc(postRef, {
      ...postData,
      imageUrls,
      updatedAt: serverTimestamp()
    });
    
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// 게시물 삭제
export const deletePost = async (postId) => {
  try {
    const postRef = doc(db, 'posts', postId);
    const postSnapshot = await getDoc(postRef);
    
    if (!postSnapshot.exists()) {
      return { success: false, error: '게시물을 찾을 수 없습니다.' };
    }
    
    const postData = postSnapshot.data();
    
    // 게시물에 연결된 이미지 삭제
    if (postData.imageUrls && postData.imageUrls.length > 0) {
      await Promise.all(
        postData.imageUrls.map(async (imageUrl) => {
          try {
            const imageRef = ref(storage, imageUrl);
            await deleteObject(imageRef);
          } catch (error) {
            console.error('이미지 삭제 실패:', error);
            // 이미지 삭제 실패는 무시하고 계속 진행
          }
        })
      );
    }
    
    // 게시물에 연결된 댓글 삭제
    const commentsQuery = query(
      collection(db, 'posts', postId, 'comments')
    );
    const commentsSnapshot = await getDocs(commentsQuery);
    
    commentsSnapshot.forEach(async (commentDoc) => {
      await deleteDoc(doc(db, 'posts', postId, 'comments', commentDoc.id));
    });
    
    // 게시물에 연결된 좋아요 삭제
    const likesQuery = query(
      collection(db, 'posts', postId, 'likes')
    );
    const likesSnapshot = await getDocs(likesQuery);
    
    likesSnapshot.forEach(async (likeDoc) => {
      await deleteDoc(doc(db, 'posts', postId, 'likes', likeDoc.id));
    });
    
    // 게시물 삭제
    await deleteDoc(postRef);
    
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// 게시물 좋아요 추가
export const likePost = async (postId, userId) => {
  try {
    const postRef = doc(db, 'posts', postId);
    const likeRef = doc(db, 'posts', postId, 'likes', userId);
    
    // 좋아요 정보 저장
    await setDoc(likeRef, {
      userId,
      createdAt: serverTimestamp()
    });
    
    // 게시물의 좋아요 수 증가
    await updateDoc(postRef, {
      likeCount: increment(1)
    });
    
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// 게시물 좋아요 취소
export const unlikePost = async (postId, userId) => {
  try {
    const postRef = doc(db, 'posts', postId);
    const likeRef = doc(db, 'posts', postId, 'likes', userId);
    
    // 좋아요 정보 삭제
    await deleteDoc(likeRef);
    
    // 게시물의 좋아요 수 감소
    await updateDoc(postRef, {
      likeCount: increment(-1)
    });
    
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// 게시물 좋아요 상태 확인
export const checkPostLike = async (postId, userId) => {
  try {
    const likeRef = doc(db, 'posts', postId, 'likes', userId);
    const likeDoc = await getDoc(likeRef);
    
    return { success: true, liked: likeDoc.exists() };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// 댓글 추가
export const addComment = async (postId, commentData) => {
  try {
    const commentRef = await addDoc(
      collection(db, 'posts', postId, 'comments'),
      {
        ...commentData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }
    );
    
    // 게시물의 댓글 수 증가
    await updateDoc(doc(db, 'posts', postId), {
      commentCount: increment(1)
    });
    
    return { success: true, commentId: commentRef.id };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// 댓글 목록 가져오기
export const getComments = async (postId) => {
  try {
    const commentsQuery = query(
      collection(db, 'posts', postId, 'comments'),
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
export const updateComment = async (postId, commentId, commentText) => {
  try {
    const commentRef = doc(db, 'posts', postId, 'comments', commentId);
    
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
export const deleteComment = async (postId, commentId) => {
  try {
    await deleteDoc(doc(db, 'posts', postId, 'comments', commentId));
    
    // 게시물의 댓글 수 감소
    await updateDoc(doc(db, 'posts', postId), {
      commentCount: increment(-1)
    });
    
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// 특정 사용자의 게시물 가져오기
export const getUserPosts = async (userId, lastDoc = null, postsPerPage = 10) => {
  try {
    let postsQuery = query(
      collection(db, 'posts'),
      where('authorId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(postsPerPage)
    );
    
    if (lastDoc) {
      postsQuery = query(
        collection(db, 'posts'),
        where('authorId', '==', userId),
        orderBy('createdAt', 'desc'),
        startAfter(lastDoc),
        limit(postsPerPage)
      );
    }
    
    const querySnapshot = await getDocs(postsQuery);
    
    const posts = [];
    querySnapshot.forEach((doc) => {
      posts.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];
    
    return {
      success: true,
      posts,
      lastVisible,
      hasMore: querySnapshot.docs.length === postsPerPage
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// 게시물 검색
export const searchPosts = async (searchTerm, lastDoc = null, postsPerPage = 10) => {
  try {
    // Firestore는 전체 텍스트 검색을 직접 지원하지 않으므로
    // 제목에서 검색하는 간단한 방식으로 구현
    // 실제 프로덕션에서는 Algolia 같은 검색 서비스 통합을 고려
    
    // 이 방식은 정확히 일치하는 경우만 검색
    // 대소문자 구분 없이 searchTerm이 포함된 title 필드를 가진 문서를 찾기 위해
    // 좀 더 복잡한 인덱스나 Cloud Functions가 필요할 수 있음
    let postsQuery = query(
      collection(db, 'posts'),
      where('title', '>=', searchTerm),
      where('title', '<=', searchTerm + '\uf8ff'), // 부분 일치 검색을 위한 트릭
      orderBy('title'),
      orderBy('createdAt', 'desc'),
      limit(postsPerPage)
    );
    
    if (lastDoc) {
      postsQuery = query(
        collection(db, 'posts'),
        where('title', '>=', searchTerm),
        where('title', '<=', searchTerm + '\uf8ff'),
        orderBy('title'),
        orderBy('createdAt', 'desc'),
        startAfter(lastDoc),
        limit(postsPerPage)
      );
    }
    
    const querySnapshot = await getDocs(postsQuery);
    
    const posts = [];
    querySnapshot.forEach((doc) => {
      posts.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];
    
    return {
      success: true,
      posts,
      lastVisible,
      hasMore: querySnapshot.docs.length === postsPerPage
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// 아이돌 관련 게시물 가져오기
export const getIdolPosts = async (idolId, limit = 5) => {
  try {
    const postsQuery = query(
      collection(db, 'posts'),
      where('idols', 'array-contains', { id: idolId }),
      orderBy('createdAt', 'desc'),
      limit(limit)
    );
    
    const querySnapshot = await getDocs(postsQuery);
    
    const posts = [];
    querySnapshot.forEach((doc) => {
      posts.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return { success: true, posts };
  } catch (error) {
    return { success: false, error: error.message };
  }
};