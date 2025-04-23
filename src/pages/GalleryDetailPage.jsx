import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaRegHeart, FaHeart, FaDownload, FaShare, FaTrash, FaEdit, FaTimes, FaUser, FaRegClock, FaRegEye } from 'react-icons/fa';
import { useAuth } from '../hooks/useAuth';
import { useLoading } from '../hooks/useLoading';
import { useToast } from '../hooks/useToast';
import { useModal } from '../hooks/useModal';
import { getGalleryImage, deleteGalleryImage, likeGalleryImage, unlikeGalleryImage, checkGalleryImageLike } from '../services/galleryService';
import { getUserBasicProfile } from '../services/userService';
import { formatRelativeTime } from '../utils/formatters';

const GalleryDetailPage = () => {
  const { imageId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { startLoading, stopLoading } = useLoading();
  const { showToast } = useToast();
  const { showModal } = useModal();
  
  const [image, setImage] = useState(null);
  const [uploader, setUploader] = useState(null);
  const [liked, setLiked] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  
  // 이미지 정보 불러오기
  useEffect(() => {
    const fetchImage = async () => {
      try {
        startLoading();
        
        const result = await getGalleryImage(imageId);
        if (result.success) {
          setImage(result.image);
          
          // 업로더 정보 가져오기
          if (result.image.uploadedBy) {
            const uploaderResult = await getUserBasicProfile(result.image.uploadedBy);
            if (uploaderResult.success) {
              setUploader(uploaderResult.profile);
            }
          }
          
          // 로그인한 경우 좋아요 상태 확인
          if (currentUser) {
            const likeResult = await checkGalleryImageLike(imageId, currentUser.uid);
            if (likeResult.success) {
              setLiked(likeResult.liked);
            }
          }
        } else {
          showToast('이미지를 불러올 수 없습니다.', 'error');
          navigate('/gallery');
        }
      } catch (error) {
        console.error('이미지 불러오기 오류:', error);
        showToast('이미지를 불러오는 중 오류가 발생했습니다.', 'error');
        navigate('/gallery');
      } finally {
        stopLoading();
      }
    };
    
    fetchImage();
  }, [imageId, currentUser, navigate, showToast, startLoading, stopLoading]);
  
  // 좋아요 토글 핸들러
  const handleLikeToggle = async () => {
    if (!currentUser) {
      showToast('로그인 후 좋아요를 누를 수 있습니다.', 'info');
      return;
    }
    
    try {
      if (liked) {
        await unlikeGalleryImage(imageId, currentUser.uid);
        setLiked(false);
        setImage(prev => ({
          ...prev,
          likeCount: (prev.likeCount || 0) - 1
        }));
      } else {
        await likeGalleryImage(imageId, currentUser.uid);
        setLiked(true);
        setImage(prev => ({
          ...prev,
          likeCount: (prev.likeCount || 0) + 1
        }));
      }
    } catch (error) {
      console.error('좋아요 처리 중 오류:', error);
      showToast('좋아요 처리 중 오류가 발생했습니다.', 'error');
    }
  };
  
  // 이미지 다운로드 핸들러
  const handleDownload = () => {
    if (!image || !image.url) return;
    
    const link = document.createElement('a');
    link.href = image.url;
    link.download = image.title || 'image';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  // 이미지 공유 핸들러
  const handleShare = () => {
    if (!image) return;
    
    if (navigator.share) {
      navigator.share({
        title: image.title || '이미지 공유',
        text: image.description || '',
        url: window.location.href
      }).catch(error => {
        console.error('공유 중 오류:', error);
      });
    } else {
      // 클립보드에 URL 복사
      navigator.clipboard.writeText(window.location.href)
        .then(() => {
          showToast('URL이 클립보드에 복사되었습니다.', 'success');
        })
        .catch(error => {
          console.error('클립보드 복사 오류:', error);
          showToast('URL 복사에 실패했습니다.', 'error');
        });
    }
  };
  
  // 이미지 삭제 핸들러
  const handleDelete = () => {
    if (!currentUser || !image) return;
    
    // 작성자 확인
    if (image.uploadedBy !== currentUser.uid) {
      showToast('본인이 업로드한 이미지만 삭제할 수 있습니다.', 'error');
      return;
    }
    
    showModal({
      title: '이미지 삭제',
      message: '정말 이 이미지를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.',
      confirmText: '삭제',
      cancelText: '취소',
      confirmVariant: 'danger',
      onConfirm: async () => {
        try {
          startLoading();
          
          const result = await deleteGalleryImage(imageId);
          
          if (result.success) {
            showToast('이미지가 삭제되었습니다.', 'success');
            navigate('/gallery');
          } else {
            showToast(result.error || '이미지 삭제에 실패했습니다.', 'error');
          }
        } catch (error) {
          console.error('이미지 삭제 오류:', error);
          showToast('이미지 삭제 중 오류가 발생했습니다.', 'error');
        } finally {
          stopLoading();
        }
      }
    });
  };
  
  // 이미지 수정 페이지로 이동
  const handleEdit = () => {
    if (!currentUser || !image) return;
    
    // 작성자 확인
    if (image.uploadedBy !== currentUser.uid) {
      showToast('본인이 업로드한 이미지만 수정할 수 있습니다.', 'error');
      return;
    }
    
    navigate(`/gallery/edit/${imageId}`);
  };
  
  // 전체화면 토글
  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };
  
  if (!image) {
    return null; // 로딩 중이거나 이미지가 없는 경우
  }
  
  // 날짜 포맷팅
  const formattedDate = image.createdAt ? formatRelativeTime(image.createdAt) : '';
  
  return (
    <>
      {/* 전체화면 모드 */}
      {isFullScreen && (
        <div className="fixed inset-0 z-50 bg-black flex items-center justify-center" onClick={toggleFullScreen}>
          <button 
            className="absolute top-4 right-4 text-white bg-gray-800 rounded-full p-2 hover:bg-gray-700"
            onClick={(e) => {
              e.stopPropagation();
              toggleFullScreen();
            }}
          >
            <FaTimes size={24} />
          </button>
          <img 
            src={image.url} 
            alt={image.title || '갤러리 이미지'} 
            className="max-h-screen max-w-full object-contain"
          />
        </div>
      )}
      
      {/* 이미지 상세 페이지 */}
      <div className="container-custom mx-auto px-4 py-8 mt-20">
        <div className="max-w-5xl mx-auto">
          {/* 이미지 및 정보 컨테이너 */}
          <div className="bg-white dark:bg-dark-800 rounded-lg shadow-md overflow-hidden">
            {/* 이미지 영역 */}
            <div className="relative cursor-pointer" onClick={toggleFullScreen}>
              <img 
                src={image.url} 
                alt={image.title || '갤러리 이미지'} 
                className="w-full object-contain max-h-[70vh]"
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-opacity flex items-center justify-center opacity-0 hover:opacity-100">
                <span className="text-white text-lg font-medium">클릭하여 전체화면으로 보기</span>
              </div>
            </div>
            
            {/* 이미지 정보 영역 */}
            <div className="p-6">
              {/* 제목 및 작성자 정보 */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {image.title || '제목 없음'}
                  </h1>
                  {uploader && (
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full overflow-hidden mr-2">
                        {uploader.photoURL ? (
                          <img 
                            src={uploader.photoURL} 
                            alt={uploader.displayName} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center">
                            <FaUser className="text-gray-500 dark:text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {uploader.displayName}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* 작성자인 경우 수정/삭제 버튼 */}
                {currentUser && image.uploadedBy === currentUser.uid && (
                  <div className="flex space-x-2">
                    <button
                      onClick={handleEdit}
                      className="btn btn-sm btn-outline flex items-center"
                    >
                      <FaEdit className="mr-1" />
                      수정
                    </button>
                    <button
                      onClick={handleDelete}
                      className="btn btn-sm btn-danger flex items-center"
                    >
                      <FaTrash className="mr-1" />
                      삭제
                    </button>
                  </div>
                )}
              </div>
              
              {/* 설명 */}
              {image.description && (
                <div className="mb-4">
                  <p className="text-gray-700 dark:text-gray-300">
                    {image.description}
                  </p>
                </div>
              )}
              
              {/* 통계 정보 */}
              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-4 space-x-4">
                <div className="flex items-center">
                  <FaRegClock className="mr-1" />
                  <span>{formattedDate}</span>
                </div>
                <div className="flex items-center">
                  <FaRegEye className="mr-1" />
                  <span>{image.viewCount || 0} 조회</span>
                </div>
                <div className="flex items-center">
                  {liked ? (
                    <FaHeart className="mr-1 text-red-500" />
                  ) : (
                    <FaRegHeart className="mr-1" />
                  )}
                  <span>{image.likeCount || 0} 좋아요</span>
                </div>
              </div>
              
              {/* 태그 목록 */}
              {image.tags && image.tags.length > 0 && (
                <div className="mb-4">
                  <div className="flex flex-wrap gap-2">
                    {image.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2.5 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {/* 액션 버튼 */}
              <div className="mt-6 flex space-x-2">
                <button
                  onClick={handleLikeToggle}
                  className={`btn ${liked ? 'btn-primary' : 'btn-outline'} flex items-center`}
                >
                  {liked ? (
                    <FaHeart className="mr-2" />
                  ) : (
                    <FaRegHeart className="mr-2" />
                  )}
                  좋아요
                </button>
                <button
                  onClick={handleDownload}
                  className="btn btn-outline flex items-center"
                >
                  <FaDownload className="mr-2" />
                  다운로드
                </button>
                <button
                  onClick={handleShare}
                  className="btn btn-outline flex items-center"
                >
                  <FaShare className="mr-2" />
                  공유
                </button>
              </div>
            </div>
          </div>
          
          {/* 뒤로 가기 버튼 */}
          <div className="mt-6">
            <button
              onClick={() => navigate('/gallery')}
              className="btn btn-outline"
            >
              갤러리로 돌아가기
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default GalleryDetailPage;