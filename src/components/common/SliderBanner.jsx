import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const SliderBanner = ({ slides = [], autoPlayInterval = 5000 }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // 다음 슬라이드로 이동
  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  }, [slides.length]);

  // 이전 슬라이드로 이동
  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  }, [slides.length]);

  // 특정 슬라이드로 이동
  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  // 자동 재생
  useEffect(() => {
    if (!isPaused && slides.length > 1) {
      const interval = setInterval(nextSlide, autoPlayInterval);
      return () => clearInterval(interval);
    }
    return undefined;
  }, [isPaused, nextSlide, slides.length, autoPlayInterval]);
  
  // 슬라이드가 없으면 렌더링하지 않음
  if (!slides || slides.length === 0) {
    return null;
  }

  // 현재 슬라이드 데이터
  const currentSlideData = slides[currentSlide];

  return (
    <div 
      className="relative w-full overflow-hidden rounded-xl shadow-md"
      style={{ height: '400px' }} // 고정 높이 설정, 필요에 따라 수정 가능
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* 슬라이드 컨테이너 */}
      <div 
        className="h-full w-full transition-all duration-500 ease-in-out"
        style={{ 
          backgroundImage: `url(${currentSlideData.imageUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        {/* 배경 오버레이 */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent dark:from-black/70"></div>
        
        {/* 슬라이드 컨텐츠 */}
        <div className="absolute inset-0 flex items-center p-8 md:p-12">
          <div className="max-w-md text-white">
            <h2 className="text-2xl md:text-3xl font-bold mb-2">
              {currentSlideData.title}
            </h2>
            <p className="mb-4 text-sm md:text-base text-gray-100">
              {currentSlideData.description}
            </p>
            {currentSlideData.buttonLink && (
              <Link 
                to={currentSlideData.buttonLink} 
                className="btn bg-primary-500 hover:bg-primary-600 text-white inline-flex items-center"
              >
                {currentSlideData.buttonText || '자세히 보기'}
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* 이전/다음 화살표 버튼 */}
      {slides.length > 1 && (
        <>
          <button 
            onClick={prevSlide}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full bg-black/30 text-white hover:bg-black/50 transition-colors"
            aria-label="이전 슬라이드"
          >
            <FaChevronLeft />
          </button>
          <button 
            onClick={nextSlide}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full bg-black/30 text-white hover:bg-black/50 transition-colors"
            aria-label="다음 슬라이드"
          >
            <FaChevronRight />
          </button>
        </>
      )}

      {/* 인디케이터 (점) */}
      {slides.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                currentSlide === index 
                  ? 'bg-white scale-125' 
                  : 'bg-white/50 hover:bg-white/70'
              }`}
              aria-label={`슬라이드 ${index + 1}로 이동`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default SliderBanner;