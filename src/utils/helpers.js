// 랜덤 ID 생성
export const generateId = (length = 10) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return result;
};

// 배열 셔플 (Fisher-Yates 알고리즘)
export const shuffleArray = (array) => {
  const shuffled = [...array];
  
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  
  return shuffled;
};

// 딥 클론 (깊은 복사)
export const deepClone = (obj) => {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  
  if (obj instanceof Date) {
    return new Date(obj);
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => deepClone(item));
  }
  
  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) => [key, deepClone(value)])
  );
};

// 객체 병합 (깊은 병합)
export const deepMerge = (target, source) => {
  const output = { ...target };
  
  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach(key => {
      if (isObject(source[key])) {
        if (!(key in target)) {
          Object.assign(output, { [key]: source[key] });
        } else {
          output[key] = deepMerge(target[key], source[key]);
        }
      } else {
        Object.assign(output, { [key]: source[key] });
      }
    });
  }
  
  return output;
};

// 객체 여부 확인
export const isObject = (item) => {
  return item && typeof item === 'object' && !Array.isArray(item);
};

// 쿠키 가져오기
export const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  
  if (parts.length === 2) {
    return parts.pop().split(';').shift();
  }
  
  return null;
};

// 쿠키 설정
export const setCookie = (name, value, days = 7) => {
  const date = new Date();
  date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
  const expires = `expires=${date.toUTCString()}`;
  
  document.cookie = `${name}=${value};${expires};path=/;SameSite=Strict`;
};

// 쿠키 삭제
export const deleteCookie = (name) => {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;SameSite=Strict`;
};

// URL 쿼리 파라미터 파싱
export const parseQueryParams = (queryString) => {
  if (!queryString || queryString.trim() === '') {
    return {};
  }
  
  // '?' 제거
  const sanitizedQueryString = queryString.startsWith('?') 
    ? queryString.substring(1) 
    : queryString;
  
  const queryParams = {};
  const pairs = sanitizedQueryString.split('&');
  
  for (const pair of pairs) {
    const [key, value] = pair.split('=');
    
    if (key && value) {
      queryParams[decodeURIComponent(key)] = decodeURIComponent(value);
    }
  }
  
  return queryParams;
};

// URL 쿼리 파라미터 생성
export const buildQueryString = (params) => {
  if (!params || Object.keys(params).length === 0) {
    return '';
  }
  
  const queryParts = [];
  
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      queryParts.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
    }
  }
  
  return queryParts.length > 0 ? `?${queryParts.join('&')}` : '';
};

// 이메일 마스킹 (privacy@example.com -> pr****@example.com)
export const maskEmail = (email) => {
  if (!email) return '';
  
  const [username, domain] = email.split('@');
  
  if (username.length <= 2) {
    return `${username}@${domain}`;
  }
  
  const visible = username.substring(0, 2);
  const masked = '*'.repeat(username.length - 2);
  
  return `${visible}${masked}@${domain}`;
};

// 휴대폰 번호 포맷 (01012345678 -> 010-1234-5678)
export const formatPhoneNumber = (phoneNumber) => {
  if (!phoneNumber) return '';
  
  // 숫자만 추출
  const cleaned = phoneNumber.replace(/\D/g, '');
  
  // 패턴에 따라 포맷
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  } else if (cleaned.length === 11) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}-${cleaned.slice(7)}`;
  }
  
  return phoneNumber;
};

// 디바운스 함수
export const debounce = (func, delay = 300) => {
  let timeoutId;
  
  return function(...args) {
    const context = this;
    
    clearTimeout(timeoutId);
    
    timeoutId = setTimeout(() => {
      func.apply(context, args);
    }, delay);
  };
};

// 스로틀 함수
export const throttle = (func, limit = 300) => {
  let inThrottle;
  
  return function(...args) {
    const context = this;
    
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
};

// 이미지 파일 확장자 확인
export const isValidImageFile = (file) => {
  const validImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
  return validImageTypes.includes(file.type);
};

// 비디오 파일 확장자 확인
export const isValidVideoFile = (file) => {
  const validVideoTypes = ['video/mp4', 'video/webm', 'video/ogg'];
  return validVideoTypes.includes(file.type);
};

// YouTube URL에서 비디오 ID 추출
export const getYoutubeVideoId = (url) => {
  if (!url) return null;
  
  // YouTube URL 패턴
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^?&/]+)/i,
    /youtube\.com\/watch\?.*v=([^&]+)/i
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  
  return null;
};

// Vimeo URL에서 비디오 ID 추출
export const getVimeoVideoId = (url) => {
  if (!url) return null;
  
  // Vimeo URL 패턴
  const pattern = /vimeo\.com\/(?:video\/)?(\d+)/i;
  const match = url.match(pattern);
  
  return match && match[1] ? match[1] : null;
};

// YouTube 썸네일 URL 생성
export const getYoutubeThumbnailUrl = (videoId, quality = 'high') => {
  if (!videoId) return null;
  
  // 썸네일 품질 옵션
  const qualityMap = {
    high: 'hqdefault',
    medium: 'mqdefault',
    standard: 'sddefault',
    max: 'maxresdefault'
  };
  
  const thumbnailType = qualityMap[quality] || 'hqdefault';
  
  return `https://img.youtube.com/vi/${videoId}/${thumbnailType}.jpg`;
};

// 문자열에서 해시태그 추출
export const extractHashtags = (text) => {
  if (!text) return [];
  
  const hashtagRegex = /#[^\s#]+/g;
  const matches = text.match(hashtagRegex);
  
  if (!matches) return [];
  
  return matches.map(tag => tag.substring(1)); // '#' 제거
};