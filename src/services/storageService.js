import { ref, uploadBytes, getDownloadURL, deleteObject, listAll } from 'firebase/storage';
import { storage } from './firebase';

// 이미지 업로드
export const uploadImage = async (file, path) => {
  try {
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);
    
    return { success: true, url: downloadURL };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// 이미지 여러 개 업로드
export const uploadMultipleImages = async (files, basePath) => {
  try {
    const uploadPromises = files.map(async (file, index) => {
      const fileName = `${Date.now()}_${index}_${file.name}`;
      const filePath = `${basePath}/${fileName}`;
      const storageRef = ref(storage, filePath);
      
      await uploadBytes(storageRef, file);
      return getDownloadURL(storageRef);
    });
    
    const downloadURLs = await Promise.all(uploadPromises);
    
    return { success: true, urls: downloadURLs };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// 파일 삭제
export const deleteFile = async (url) => {
  try {
    const fileRef = ref(storage, url);
    await deleteObject(fileRef);
    
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// 여러 파일 삭제
export const deleteMultipleFiles = async (urls) => {
  try {
    const deletePromises = urls.map(async (url) => {
      const fileRef = ref(storage, url);
      return deleteObject(fileRef);
    });
    
    await Promise.all(deletePromises);
    
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// 디렉토리 내 모든 파일 삭제
export const deleteDirectory = async (path) => {
  try {
    const dirRef = ref(storage, path);
    const fileList = await listAll(dirRef);
    
    // 모든 파일 삭제
    const deletePromises = fileList.items.map(async (fileRef) => {
      return deleteObject(fileRef);
    });
    
    // 하위 디렉토리 삭제 (재귀적으로)
    const dirDeletePromises = fileList.prefixes.map(async (subDirRef) => {
      return deleteDirectory(subDirRef.fullPath);
    });
    
    await Promise.all([...deletePromises, ...dirDeletePromises]);
    
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// 파일 크기 제한 확인 (MB 단위)
export const checkFileSize = (file, maxSizeMB = 10) => {
  const fileSizeMB = file.size / (1024 * 1024);
  return fileSizeMB <= maxSizeMB;
};

// 파일 확장자 확인
export const checkFileType = (file, allowedTypes = ['image/jpeg', 'image/png', 'image/gif']) => {
  return allowedTypes.includes(file.type);
};

// 이미지 URL에서 참조 경로 추출
export const getPathFromURL = (url) => {
  try {
    // Firebase 스토리지 URL에서 경로 추출
    // 예: https://firebasestorage.googleapis.com/v0/b/project-id.appspot.com/o/path%2Fto%2Ffile.jpg?alt=media&token=...
    const decodedUrl = decodeURIComponent(url);
    const urlObj = new URL(decodedUrl);
    const pathMatch = urlObj.pathname.match(/\/o\/(.+)$/);
    
    if (pathMatch && pathMatch[1]) {
      return pathMatch[1];
    }
    
    return null;
  } catch (error) {
    return null;
  }
};

// 파일 이름 생성 (고유한 파일명 보장)
export const generateFileName = (originalName) => {
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(2, 8);
  const extension = originalName.split('.').pop();
  
  return `${timestamp}_${randomStr}.${extension}`;
};

// 이미지 메타데이터 설정
export const uploadImageWithMetadata = async (file, path, metadata) => {
  try {
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, file, metadata);
    const downloadURL = await getDownloadURL(storageRef);
    
    return { success: true, url: downloadURL };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// 프로필 이미지 업로드 (최적화된 경로와 설정)
export const uploadProfileImage = async (file, userId) => {
  try {
    // 고유한 파일명 생성
    const fileName = generateFileName(file.name);
    const path = `profiles/${userId}/${fileName}`;
    
    // 이미지 메타데이터 설정
    const metadata = {
      contentType: file.type,
      customMetadata: {
        'purpose': 'profile',
        'userId': userId
      }
    };
    
    return uploadImageWithMetadata(file, path, metadata);
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// 게시물 이미지 업로드 (최적화된 경로와 설정)
export const uploadPostImage = async (file, userId, postId) => {
  try {
    // 고유한 파일명 생성
    const fileName = generateFileName(file.name);
    const path = `posts/${userId}/${postId}/${fileName}`;
    
    // 이미지 메타데이터 설정
    const metadata = {
      contentType: file.type,
      customMetadata: {
        'purpose': 'post',
        'userId': userId,
        'postId': postId
      }
    };
    
    return uploadImageWithMetadata(file, path, metadata);
  } catch (error) {
    return { success: false, error: error.message };
  }
};