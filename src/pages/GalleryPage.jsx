import React, { useState, useEffect } from 'react';
import { FaSearch, FaFilter, FaCloudUploadAlt } from 'react-icons/fa';
import GalleryGrid from '../components/gallery/GalleryGrid';
import { useAuth } from '../hooks/useAuth';
import { useLoading } from '../hooks/useLoading';
import { useToast } from '../hooks/useToast';
import { useNavigate } from 'react-router-dom';
import Loading from '../components/common/Loading';
import { getGallery, searchGalleryByIdol } from '../services/galleryService';

const GalleryPage = () => {
  const { currentUser } = useAuth();
  const { isLoading, startLoading, stopLoading } = useLoading();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [images, setImages] = useState([]);
  const [lastVisible, setLastVisible] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIdol, setSelectedIdol] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' 또는 'masonry'

  // 이미지 불러오기
  const fetchImages = async (reset = false) => {
    try {
      startLoading();
      
      let result;
      if (selectedIdol) {
        result = await searchGalleryByIdol(selectedIdol, reset ? null : lastVisible);
      } else {
        result = await getGallery(reset ? null : lastVisible);
      }
      
      if (result.success) {
        if (reset) {
          setImages(result.images);
        } else {
          setImages(prev => [...prev, ...result.images]);
        }
        
        setLastVisible(result.lastVisible);
        setHasMore(result.hasMore);
      } else {
        showToast('이미지를 불러오는데 실패했습니다', 'error');
      }
    } catch (error) {
      console.error('갤러리 불러오기 오류:', error);
      showToast('이미지를 불러오는 중 오류가 발생했습니다', 'error');
    } finally {
      stopLoading();
    }
  };

  // 초기 로딩
  useEffect(() => {
    fetchImages(true);
  }, [selectedIdol]);

  // 더 많은 이미지 로드
  const loadMore = () => {
    if (!isLoading && hasMore) {
      fetchImages();
    }
  };

  // 검색 처리
  const handleSearch = (e) => {
    e.preventDefault();
    // 현재는 아이돌 이름 기반 검색만 구현
    fetchImages(true);
  };

  // 아이돌 선택 처리
  const handleIdolChange = (e) => {
    setSelectedIdol(e.target.value);
  };

  // 이미지 업로드 페이지로 이동
  const handleUpload = () => {
    if (!currentUser) {
      showToast('로그인 후 이미지를 업로드할 수 있습니다', 'info');
      navigate('/login', { state: { from: '/gallery' } });
      return;
    }
    
    navigate('/gallery/upload');
  };

  return (
    <div className="container-custom mx-auto px-4 py-8 mt-20">
      {/* 페이지 헤더 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          갤러리
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          K-POP 아이돌의 다양한 이미지를 감상하세요
        </p>
      </div>
      
      {/* 컨트롤 영역 */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* 뷰 모드 토글 */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setViewMode('grid')}
            className={`px-3 py-1 text-sm rounded ${
              viewMode === 'grid'
                ? 'bg-primary-500 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            그리드
          </button>
          <button
            onClick={() => setViewMode('masonry')}
            className={`px-3 py-1 text-sm rounded ${
              viewMode === 'masonry'
                ? 'bg-primary-500 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            마소니
          </button>
        </div>
        
        {/* 버튼 영역 */}
        <div className="flex items-center gap-2 self-end">
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className="btn btn-outline btn-sm flex items-center"
          >
            <FaFilter className="mr-1" />
            필터
          </button>
          
          <button
            type="button"
            onClick={handleUpload}
            className="btn btn-primary btn-sm flex items-center"
          >
            <FaCloudUploadAlt className="mr-1" />
            이미지 업로드
          </button>
        </div>
      </div>
      
      {/* 필터 및 검색 영역 */}
      <div className={`bg-gray-50 dark:bg-dark-800 p-4 rounded-lg mb-6 transition-all ${
        showFilters ? 'block' : 'hidden'
      }`}>
        <div className="flex flex-col md:flex-row gap-4">
          {/* 아이돌 필터 */}
          <div className="w-full md:w-1/3">
            <label htmlFor="idol-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              아이돌 선택
            </label>
            <select
              id="idol-filter"
              value={selectedIdol}
              onChange={handleIdolChange}
              className="form-select"
            >
              <option value="">모든 아이돌</option>
              {/* 실제 데이터베이스에서 아이돌 목록을 가져와 채울 예정 */}
              <option value="blackpink">블랙핑크</option>
              <option value="bts">BTS</option>
              <option value="twice">트와이스</option>
              <option value="aespa">에스파</option>
              <option value="ive">아이브</option>
            </select>
          </div>
          
          {/* 검색 */}
          <div className="w-full md:w-2/3">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              검색
            </label>
            <form onSubmit={handleSearch} className="flex">
              <input
                type="text"
                id="search"
                placeholder="이미지 제목, 태그 검색"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-input rounded-r-none"
              />
              <button type="submit" className="btn btn-primary rounded-l-none px-4">
                <FaSearch />
              </button>
            </form>
          </div>
        </div>
      </div>
      
      {/* 갤러리 그리드 */}
      {isLoading && images.length === 0 ? (
        <Loading size="medium" message="이미지를 불러오는 중..." />
      ) : images.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400 mb-4">이미지가 없습니다.</p>
          <button
            onClick={handleUpload}
            className="btn btn-primary"
          >
            첫 이미지를 업로드해보세요!
          </button>
        </div>
      ) : (
        <>
          <GalleryGrid 
            images={images} 
            viewMode={viewMode} 
            onImageClick={(image) => navigate(`/gallery/${image.id}`)}
          />
          
          {/* 더 불러오기 버튼 */}
          {hasMore && (
            <div className="text-center mt-8">
              <button
                onClick={loadMore}
                disabled={isLoading}
                className="btn btn-outline"
              >
                {isLoading ? '로딩 중...' : '더 보기'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default GalleryPage;