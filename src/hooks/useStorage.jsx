import { useState, useCallback } from 'react';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '../services/firebase';
import { useToast } from './useToast';

// Firebase Storage 파일 업로드 관리를 위한 커스텀 훅
export const useStorage = () => {
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  const [url, setUrl] = useState(null);
  const { showToast } = useToast();

  // 단일 파일 업로드
  const uploadFile = useCallback((file, path) => {
    return new Promise((resolve, reject) => {
      if (!file) {
        reject(new Error('파일이 선택되지 않았습니다.'));
        return;
      }

      setIsUploading(true);
      setProgress(0);
      setError(null);

      // Storage 경로 참조 생성
      const storageRef = ref(storage, path);
      
      // 업로드 작업 생성
      const uploadTask = uploadBytesResumable(storageRef, file);

      // 업로드 진행 상태 리스너 등록
      uploadTask.on(
        'state_changed',
        // 진행 중
        (snapshot) => {
          const progress = Math.round(
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          );
          setProgress(progress);
        },
        // 에러 발생
        (error) => {
          setError(error);
          setIsUploading(false);
          showToast('파일 업로드 실패: ' + error.message, 'error');
          reject(error);
        },
        // 완료
        async () => {
          try {
            // 다운로드 URL 가져오기
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            setUrl(downloadURL);
            setIsUploading(false);
            resolve({ url: downloadURL, path });
          } catch (error) {
            setError(error);
            setIsUploading(false);
            showToast('URL 가져오기 실패: ' + error.message, 'error');
            reject(error);
          }
        }
      );
    });
  }, [showToast]);

  // 다중 파일 업로드
  const uploadMultipleFiles = useCallback(async (files, basePath) => {
    if (!files || files.length === 0) {
      setError(new Error('파일이 선택되지 않았습니다.'));
      return [];
    }

    setIsUploading(true);
    setError(null);

    try {
      const results = [];
      let totalProgress = 0;

      // 각 파일을 순차적으로 업로드
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileName = `${Date.now()}_${i}_${file.name}`;
        const filePath = `${basePath}/${fileName}`;

        // 개별 파일 업로드
        const result = await uploadFile(file, filePath);
        results.push(result);

        // 전체 진행률 업데이트
        totalProgress = Math.round(((i + 1) / files.length) * 100);
        setProgress(totalProgress);
      }

      return results;
    } catch (error) {
      setError(error);
      showToast('일부 파일 업로드 실패', 'error');
      return [];
    } finally {
      setIsUploading(false);
    }
  }, [uploadFile, showToast]);

  // 파일 삭제
  const deleteFile = useCallback(async (fileUrl) => {
    try {
      if (!fileUrl) return false;

      // Storage 참조 생성
      const fileRef = ref(storage, fileUrl);
      
      // 파일 삭제
      await deleteObject(fileRef);
      setUrl(null);
      return true;
    } catch (error) {
      setError(error);
      showToast('파일 삭제 실패: ' + error.message, 'error');
      return false;
    }
  }, [showToast]);

  return {
    progress,
    isUploading,
    error,
    url,
    uploadFile,
    uploadMultipleFiles,
    deleteFile
  };
};
