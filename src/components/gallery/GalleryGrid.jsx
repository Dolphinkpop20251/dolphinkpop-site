import React, { useState } from 'react';
import { FaHeart, FaRegHeart, FaExpand } from 'react-icons/fa';
import { formatRelativeTime } from '../../utils/formatters';

// 갤러리 그리드 컴포넌트
const GalleryGrid = ({ images, viewMode = 'grid', onImageClick }) => {
  const [hoveredImage, setHoveredImage] = useState(null);
  
  // 이미지 미리보기 클릭 핸들러
  const handleImageClick = (image) => {
    if (onImageClick) {
      onImageClick(image);
    }
  };
  
  // 좋아요 토글 핸들러
  const handleLikeToggle = (e, imageId) => {
    e.stopPropagation(); // 이미지 클릭 이벤트 방지
    // 실제 구현은 나중에
  };
  
  // 마소니 레이아웃 (높이가 다양한 그리드)
  if (viewMode === 'masonry') {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {images.map((image) => (
          <div 
            key={image.id} 
            className={`relative overflow-hidden rounded-lg cursor-pointer transition-all duration-300 hover:shadow-lg`}
            style={{ height: `${image.height || 300}px` }}
            onMouseEnter={() => setHoveredImage(image.id)}
            onMouseLeave={() => setHoveredImage(null)}
            onClick={() => handleImageClick(image)}
          >
            <img 
              src={image.url} 
              alt={image.title || 'Gallery image'} 
              className="w-full h-full object-cover"
            />
            
            {/* 오버레이 (호버 시 표시) */}
            <div 
              className={`absolute inset-0 bg-black bg-opacity-50 flex flex-col justify-between p-3 transition-opacity duration-300 ${
                hoveredImage === image.id ? 'opacity-100' : 'opacity-0'
              }`}
            >
              {/* 상단 정보 */}
              <div>
                <h3 className="text-white font-semibold truncate">
                  {image.title || '제목 없음'}
                </h3>
                {image.idolName && (
                  <p className="text-white text-sm opacity-90">
                    {image.idolName}
                  </p>
                )}
              </div>
              
              {/* 하단 정보 */}
              <div className="flex justify-between items-center">
                <span className="text-white text-xs">
                  {formatRelativeTime(image.createdAt)}
                </span>
                <div className="flex items-center space-x-3">
                  <button 
                    onClick={(e) => handleLikeToggle(e, image.id)}
                    className="text-white hover:text-red-500 transition-colors"
                  >
                    {image.liked ? (
                      <FaHeart className="text-red-500" />
                    ) : (
                      <FaRegHeart />
                    )}
                  </button>
                  <button className="text-white hover:text-blue-400 transition-colors">
                    <FaExpand />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }
  
  // 기본 그리드 레이아웃 (정사각형 그리드)
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {images.map((image) => (
        <div 
          key={image.id} 
          className="relative aspect-square overflow-hidden rounded-lg cursor-pointer transition-all duration-300 hover:shadow-lg"
          onMouseEnter={() => setHoveredImage(image.id)}
          onMouseLeave={() => setHoveredImage(null)}
          onClick={() => handleImageClick(image)}
        >
          <img 
            src={image.url} 
            alt={image.title || 'Gallery image'} 
            className="w-full h-full object-cover"
          />
          
          {/* 오버레이 (호버 시 표시) */}
          <div 
            className={`absolute inset-0 bg-black bg-opacity-50 flex flex-col justify-between p-3 transition-opacity duration-300 ${
              hoveredImage === image.id ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {/* 상단 정보 */}
            <div>
              <h3 className="text-white font-semibold truncate">
                {image.title || '제목 없음'}
              </h3>
              {image.idolName && (
                <p className="text-white text-sm opacity-90">
                  {image.idolName}
                </p>
              )}
            </div>
            
            {/* 하단 정보 */}
            <div className="flex justify-between items-center">
              <span className="text-white text-xs">
                {formatRelativeTime(image.createdAt)}
              </span>
              <div className="flex items-center space-x-3">
                <button 
                  onClick={(e) => handleLikeToggle(e, image.id)}
                  className="text-white hover:text-red-500 transition-colors"
                >
                  {image.liked ? (
                    <FaHeart className="text-red-500" />
                  ) : (
                    <FaRegHeart />
                  )}
                </button>
                <button className="text-white hover:text-blue-400 transition-colors">
                  <FaExpand />
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default GalleryGrid;