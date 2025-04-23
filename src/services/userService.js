import { 
  doc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  setDoc, 
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  serverTimestamp,
  addDoc
} from 'firebase/firestore';
import { db, storage } from './firebase';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

// 사용자 정보 갱신 명승적 함수 제공
export async function refreshUserAuthData(userId) {
  try {
    // 사용자 데이터 가져오기
    const userDoc = await getDoc(doc(db, 'users', userId));
    
    if (!userDoc.exists()) {
      console.error('사용자 데이터 없음:', userId);
      return false;
    }
    
    // Firebase Auth에도 업데이트 시도
    const { auth } = await import('./firebase');
    const { updateProfile } = await import('firebase/auth');
    
    if (auth.currentUser) {
      const userData = userDoc.data();
      
      await updateProfile(auth.currentUser, {
        displayName: userData.displayName,
        photoURL: userData.photoURL
      });
      
      console.log('사용자 인증 데이터 업데이트 완료');
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('사용자 인증 데이터 업데이트 오류:', error);
    return false;
  }
}

// 사용자 정보 가져오기
export const getUserById = async (userId) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    
    if (!userDoc.exists()) {
      return { success: false, error: '사용자를 찾을 수 없습니다.' };
    }
    
    const userData = userDoc.data();
    
    // 민감한 정보 제외
    delete userData.fcmTokens;
    
    return { success: true, user: { id: userDoc.id, ...userData } };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// 사용자 프로필 업데이트
export const updateUserProfile = async (userId, profileData) => {
  try {
    // 네트워크 연결 먼저 확인
    if (!navigator.onLine) {
      console.error('네트워크 연결 없음');
      return { success: false, error: '인터넷 연결이 없습니다. 네트워크 상태를 확인해주세요.' };
    }
    
    // 사용자 문서 확인
    const userRef = doc(db, 'users', userId);
    let userDoc;
    
    try {
      userDoc = await getDoc(userRef);
    } catch (fetchError) {
      console.error('사용자 데이터 가져오기 오류:', fetchError);
      if (fetchError.message && (fetchError.message.includes('offline') || fetchError.message.includes('failed to get'))) {
        return { success: false, error: '오프라인 상태에서는 프로필을 업데이트할 수 없습니다.' };
      }
      return { success: false, error: '사용자 정보를 가져오는 중 오류가 발생했습니다.' };
    }
    
    // 사용자 문서가 존재하지 않는 경우 생성
    if (!userDoc.exists()) {
      console.warn('사용자 문서가 없어서 생성 시도:', userId);
      try {
        // 기본 사용자 문서 생성
        await setDoc(userRef, {
          uid: userId,
          displayName: profileData.displayName,
          bio: profileData.bio || '',
          role: 'user',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        // 재검색 시도
        userDoc = await getDoc(userRef);
        if (!userDoc.exists()) {
          return { success: false, error: '사용자 문서 생성에 실패했습니다.' };
        }
      } catch (createError) {
        console.error('사용자 문서 생성 오류:', createError);
        return { success: false, error: '사용자 정보를 생성하는 중 오류가 발생했습니다.' };
      }
    }
    
    // 프로필 데이터 준비
    const updateData = {
      displayName: profileData.displayName,
      bio: profileData.bio || '',
      updatedAt: serverTimestamp()
    };
    
    // 프로필 이미지 처리
    if (profileData.photoFile) {
      try {
        // 고유한 파일명 생성(충돌 방지)
        const filename = `${userId}_${Date.now()}_${profileData.photoFile.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
        
        // 기존 이미지가 있는 경우 삭제 시도
        const currentUser = userDoc.data();
        if (currentUser.photoURL && currentUser.photoURL.includes('firebasestorage')) {
          try {
            // URL에서 Storage 경로 추출 시도
            const oldImagePath = decodeURIComponent(currentUser.photoURL.split('/o/')[1].split('?')[0]);
            const oldImageRef = ref(storage, oldImagePath);
            await deleteObject(oldImageRef);
          } catch (deleteError) {
            console.warn('기존 이미지 삭제 실패 (계속 진행):', deleteError);
          }
        }
        
        // 새 이미지 업로드
        const storageRef = ref(storage, `profiles/${userId}/${filename}`);
        await uploadBytes(storageRef, profileData.photoFile);
        const photoURL = await getDownloadURL(storageRef);
        
        updateData.photoURL = photoURL;
      } catch (imageError) {
        console.error('이미지 업로드 오류:', imageError);
        // 이미지 오류는 무시하고 다른 데이터 업데이트
      }
    }
    
    // 사용자 정보 업데이트 (타임아웃 적용)
    try {
      // 오프라인 상태에서 저장 동작 시도하지 않음
      if (!navigator.onLine) {
        return { success: false, error: '인터넷이 연결되지 않았습니다.' };
      }
      
      await updateDoc(userRef, updateData);
      
      // Firebase Auth 데이터도 동기화
      try {
        const { auth } = await import('./firebase');
        const { updateProfile } = await import('firebase/auth');
        
        if (auth.currentUser) {
          await updateProfile(auth.currentUser, {
            displayName: updateData.displayName,
            ...(updateData.photoURL ? { photoURL: updateData.photoURL } : {})
          });
        }
      } catch (authError) {
        console.warn('Auth 프로필 업데이트 실패 (계속 진행):', authError);
      }
      
      return { success: true, data: updateData };
    } catch (updateError) {
      console.error('문서 업데이트 오류:', updateError);
      throw updateError; // 상위 catch 블록에서 처리
    }
  } catch (error) {
    console.error('사용자 프로필 업데이트 오류:', error);
    
    if (error.message && error.message.includes('timeout')) {
      return { success: false, error: '서버 응답이 지연되고 있습니다. 잠시 후 다시 시도해주세요.' };
    }
    
    if (error.message && error.message.includes('offline')) {
      return { success: false, error: '인터넷 연결이 끊겼습니다. 네트워크 연결을 확인해주세요.' };
    }
    
    return { success: false, error: error.message || '프로필 업데이트 중 오류가 발생했습니다.' };
  }
};

// 사용자 설정 업데이트
export const updateUserSettings = async (userId, settings) => {
  try {
    const userRef = doc(db, 'users', userId);
    
    await updateDoc(userRef, {
      settings: settings,
      updatedAt: serverTimestamp()
    });
    
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// 사용자 알림 설정 업데이트
export const updateNotificationSettings = async (userId, notificationSettings) => {
  try {
    const userRef = doc(db, 'users', userId);
    
    await updateDoc(userRef, {
      'settings.notifications': notificationSettings,
      updatedAt: serverTimestamp()
    });
    
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// FCM 토큰 저장 (푸시 알림용)
export const saveFcmToken = async (userId, token) => {
  try {
    const userRef = doc(db, 'users', userId);
    
    await updateDoc(userRef, {
      fcmTokens: {
        [token]: true
      },
      updatedAt: serverTimestamp()
    });
    
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// FCM 토큰 삭제
export const removeFcmToken = async (userId, token) => {
  try {
    const userRef = doc(db, 'users', userId);
    
    await updateDoc(userRef, {
      [`fcmTokens.${token}`]: null,
      updatedAt: serverTimestamp()
    });
    
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// 사용자 활동 기록 저장
export const logUserActivity = async (userId, activity) => {
  try {
    await addDoc(collection(db, 'users', userId, 'activities'), {
      ...activity,
      timestamp: serverTimestamp()
    });
    
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// 사용자 활동 기록 가져오기
export const getUserActivities = async (userId, limit = 20) => {
  try {
    const activitiesQuery = query(
      collection(db, 'users', userId, 'activities'),
      orderBy('timestamp', 'desc'),
      limit(limit)
    );
    
    const querySnapshot = await getDocs(activitiesQuery);
    
    const activities = [];
    querySnapshot.forEach((doc) => {
      activities.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return { success: true, activities };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// 사용자 이름으로 검색
export const searchUsersByName = async (searchTerm, limit = 10) => {
  try {
    const usersQuery = query(
      collection(db, 'users'),
      where('displayName', '>=', searchTerm),
      where('displayName', '<=', searchTerm + '\uf8ff'),
      orderBy('displayName'),
      limit(limit)
    );
    
    const querySnapshot = await getDocs(usersQuery);
    
    const users = [];
    querySnapshot.forEach((doc) => {
      const userData = doc.data();
      users.push({
        id: doc.id,
        displayName: userData.displayName,
        photoURL: userData.photoURL,
        bio: userData.bio
      });
    });
    
    return { success: true, users };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// 특정 사용자의 간단한 프로필 정보 가져오기
export const getUserBasicProfile = async (userId) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    
    if (!userDoc.exists()) {
      return { success: false, error: '사용자를 찾을 수 없습니다.' };
    }
    
    const userData = userDoc.data();
    
    // 필요한 기본 정보만 반환
    return { 
      success: true, 
      profile: {
        id: userDoc.id,
        displayName: userData.displayName,
        photoURL: userData.photoURL,
        bio: userData.bio || '',
        createdAt: userData.createdAt
      }
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// 사용자 역할 확인 (관리자 여부)
export const checkUserRole = async (userId) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    
    if (!userDoc.exists()) {
      return { success: false, error: '사용자를 찾을 수 없습니다.' };
    }
    
    const userData = userDoc.data();
    
    return { success: true, role: userData.role || 'user' };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// 모든 사용자 목록 가져오기 (관리자용)
export const getAllUsers = async () => {
  try {
    const usersQuery = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(usersQuery);
    
    const users = [];
    querySnapshot.forEach((doc) => {
      users.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return { success: true, users };
  } catch (error) {
    console.error('사용자 목록 조회 오류:', error);
    return { success: false, error: error.message };
  }
};

// 관리자 권한 부여
export const promoteToAdmin = async (userId) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      return { success: false, error: '사용자를 찾을 수 없습니다.' };
    }
    
    await updateDoc(userRef, {
      role: 'admin',
      updatedAt: serverTimestamp()
    });
    
    return { success: true };
  } catch (error) {
    console.error('관리자 권한 부여 오류:', error);
    return { success: false, error: error.message };
  }
};

// 관리자 권한 해제
export const demoteFromAdmin = async (userId) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      return { success: false, error: '사용자를 찾을 수 없습니다.' };
    }
    
    await updateDoc(userRef, {
      role: 'user',
      updatedAt: serverTimestamp()
    });
    
    return { success: true };
  } catch (error) {
    console.error('관리자 권한 해제 오류:', error);
    return { success: false, error: error.message };
  }
};

// 사용자 개수 가져오기
export const getUserCount = async () => {
  try {
    const snapshot = await getDocs(collection(db, 'users'));
    return { success: true, count: snapshot.size };
  } catch (error) {
    console.error('사용자 개수 조회 오류:', error);
    return { success: false, error: error.message, count: 0 };
  }
};

// 사용자의 알림 목록 가져오기
export const getUserNotifications = async (userId, limit = 20) => {
  try {
    const notificationsQuery = query(
      collection(db, 'notifications'),
      where('recipientId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(limit)
    );
    
    const querySnapshot = await getDocs(notificationsQuery);
    
    const notifications = [];
    querySnapshot.forEach((doc) => {
      notifications.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return { success: true, notifications };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// 알림 읽음 처리
export const markNotificationAsRead = async (notificationId) => {
  try {
    const notificationRef = doc(db, 'notifications', notificationId);
    
    await updateDoc(notificationRef, {
      read: true,
      readAt: serverTimestamp()
    });
    
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// 모든 알림 읽음 처리
export const markAllNotificationsAsRead = async (userId) => {
  try {
    const notificationsQuery = query(
      collection(db, 'notifications'),
      where('recipientId', '==', userId),
      where('read', '==', false)
    );
    
    const querySnapshot = await getDocs(notificationsQuery);
    
    // 모든 알림을 읽음 처리
    const batch = db.batch();
    
    querySnapshot.forEach((doc) => {
      const notificationRef = doc(db, 'notifications', doc.id);
      batch.update(notificationRef, {
        read: true,
        readAt: serverTimestamp()
      });
    });
    
    await batch.commit();
    
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};