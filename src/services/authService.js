import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  updateProfile,
  sendPasswordResetEmail,
  sendEmailVerification,
  GoogleAuthProvider,
  signInWithPopup,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth, db, storage } from './firebase';

// 이메일과 비밀번호로 회원가입
export const registerWithEmail = async (email, password, displayName) => {
  try {
    // 사용자 생성
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // 프로필 업데이트
    await updateProfile(user, {
      displayName: displayName
    });
    
    // Firestore에 사용자 정보 저장
    try {
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: user.email,
        displayName: displayName,
        role: 'user',
        photoURL: null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    } catch (dbError) {
      console.error('Firestore 사용자 저장 실패:', dbError);
      // Firestore 저장 실패해도 계속 진행 (기본 데이터만으로도 인증 가능)
    }
    
    // 이메일 인증 메일 발송 시도 (실패해도 계속 진행)
    try {
      await sendEmailVerification(user);
    } catch (emailError) {
      console.error('이메일 인증 발송 실패:', emailError);
      // 이메일 인증 실패해도 계속 진행
    }
    
    return { success: true, user };
  } catch (error) {
    console.error('회원가입 실패:', error);
    return { success: false, error: error.message };
  }
};

// 이메일과 비밀번호로 로그인
export const loginWithEmail = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { success: true, user: userCredential.user };
  } catch (error) {
    console.error('로그인 오류:', error.code, error.message);
    
    // 사용자 친화적 오류 메시지
    let errorMessage = '로그인에 실패했습니다.';
    
    switch (error.code) {
      case 'auth/invalid-email':
        errorMessage = '잘못된 이메일 형식입니다.';
        break;
      case 'auth/user-disabled':
        errorMessage = '일시적으로 비활성화된 계정입니다.';
        break;
      case 'auth/user-not-found':
      case 'auth/wrong-password':
        errorMessage = '이메일 또는 비밀번호가 일치하지 않습니다.';
        break;
      case 'auth/too-many-requests':
        errorMessage = '너무 많은 요청이 발생했습니다. 잠시 후 다시 시도해주세요.';
        break;
      case 'auth/network-request-failed':
        errorMessage = '네트워크 연결에 문제가 발생했습니다. 인터넷 연결을 확인해주세요.';
        break;
      default:
        errorMessage = '로그인에 실패했습니다. 다시 시도해주세요.';
    }
    
    return { success: false, error: errorMessage };
  }
};

// 구글 계정으로 로그인
export const loginWithGoogle = async () => {
  try {
    const provider = new GoogleAuthProvider();
    // 프로필 정보 및 이메일 요청
    provider.addScope('profile');
    provider.addScope('email');
    provider.setCustomParameters({
      prompt: 'select_account'
    });
    
    const userCredential = await signInWithPopup(auth, provider);
    const user = userCredential.user;
    
    // 사용자가 처음 로그인한 경우 Firestore에 정보 저장
    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      
      if (!userDoc.exists()) {
        await setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || '사용자',
          photoURL: user.photoURL,
          role: 'user',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }
    } catch (dbError) {
      console.error('Firestore 사용자 저장 실패:', dbError);
      // Firestore 저장 실패해도 계속 진행 (기본 데이터만으로도 인증 가능)
    }
    
    return { success: true, user };
  } catch (error) {
    console.error('구글 로그인 실패:', error.code, error.message);
    
    // 사용자 친화적 오류 메시지
    let errorMessage = '구글 로그인에 실패했습니다.';
    
    switch (error.code) {
      case 'auth/popup-closed-by-user':
        errorMessage = '로그인 창이 닫혔습니다. 다시 시도해주세요.';
        break;
      case 'auth/popup-blocked':
        errorMessage = '팝업이 차단되었습니다. 팝업 차단을 해제하고 다시 시도해주세요.';
        break;
      case 'auth/account-exists-with-different-credential':
        errorMessage = '동일한 이메일을 사용하는 다른 계정이 존재합니다.';
        break;
      case 'auth/cancelled-popup-request':
        // 일반적인 상황이므로 사용자에게 기본 메시지 표시
        errorMessage = '구글 로그인에 실패했습니다. 다시 시도해주세요.';
        break;
      case 'auth/network-request-failed':
        errorMessage = '네트워크 연결에 문제가 발생했습니다. 인터넷 연결을 확인해주세요.';
        break;
      default:
        errorMessage = '구글 로그인에 실패했습니다. 다시 시도해주세요.';
    }
    
    return { success: false, error: errorMessage };
  }
};

// 로그아웃
export const logout = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// 비밀번호 재설정 메일 발송
export const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// 사용자 프로필 업데이트
export const updateUserProfile = async (userId, profileData) => {
  try {
    const user = auth.currentUser;
    
    if (!user) {
      console.error('현재 로그인된 사용자를 찾을 수 없습니다.');
      return { success: false, error: '현재 로그인된 사용자를 찾을 수 없습니다.' };
    }
    
    // Firestore 업데이트를 위한 기본 데이터
    const updateData = {
      displayName: profileData.displayName,
      bio: profileData.bio || '',
      updatedAt: serverTimestamp()
    };
    
    // 프로필 이미지가 있으면 Storage에 업로드
    let photoURL = user.photoURL;
    
    if (profileData.photoFile) {
      try {
        const filename = `${userId}_${Date.now()}_${profileData.photoFile.name}`;
        const storageRef = ref(storage, `profiles/${userId}/${filename}`);
        await uploadBytes(storageRef, profileData.photoFile);
        photoURL = await getDownloadURL(storageRef);
        updateData.photoURL = photoURL;
      } catch (uploadError) {
        console.error('이미지 업로드 오류:', uploadError);
        // 이미지 업로드 실패해도 나머지 정보 업데이트는 계속 진행
      }
    }
    
    // 변경 사항이 없는 경우 (displayName이 같고 새 이미지도 없는 경우) 넘어감
    if (user.displayName === profileData.displayName && !profileData.photoFile) {
      // Firestore만 업데이트 (변경된 사항이 bio만 있는 경우)
      await updateDoc(doc(db, 'users', userId), updateData);
      return { success: true };
    }
    
    // Firebase Auth 프로필 업데이트
    try {
      await updateProfile(user, {
        displayName: profileData.displayName,
        ...(photoURL ? { photoURL } : {})
      });
    } catch (authError) {
      console.error('Auth 프로필 업데이트 오류:', authError);
      // Auth 업데이트 실패해도 Firestore 업데이트는 시도
    }
    
    // Firestore 프로필 업데이트
    await updateDoc(doc(db, 'users', userId), updateData);
    
    return { success: true };
  } catch (error) {
    console.error('프로필 업데이트 오류:', error);
    return { success: false, error: error.message || '프로필 업데이트 중 오류가 발생했습니다.' };
  }
};

// 비밀번호 변경
export const changePassword = async (currentPassword, newPassword) => {
  try {
    const user = auth.currentUser;
    
    // 현재 사용자 재인증
    const credential = EmailAuthProvider.credential(user.email, currentPassword);
    await reauthenticateWithCredential(user, credential);
    
    // 비밀번호 변경
    await updatePassword(user, newPassword);
    
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// 사용자 역할 확인 (관리자 여부)
export const checkUserRole = async (userId) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      return { success: true, role: userData.role || 'user' };
    }
    
    return { success: false, error: '사용자를 찾을 수 없습니다.' };
  } catch (error) {
    return { success: false, error: error.message };
  }
};