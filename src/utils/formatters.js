import { format, formatDistance, formatRelative, subDays } from 'date-fns';
import { ko } from 'date-fns/locale';

// 날짜 포맷 (YYYY.MM.DD)
export const formatDate = (date) => {
  if (!date) return '';
  
  // Firestore 타임스탬프 처리
  const dateObj = typeof date === 'object' && date.toDate ? date.toDate() : new Date(date);
  
  return format(dateObj, 'yyyy.MM.dd', { locale: ko });
};

// 날짜 및 시간 포맷 (YYYY.MM.DD HH:mm)
export const formatDateTime = (date) => {
  if (!date) return '';
  
  // Firestore 타임스탬프 처리
  const dateObj = typeof date === 'object' && date.toDate ? date.toDate() : new Date(date);
  
  return format(dateObj, 'yyyy.MM.dd HH:mm', { locale: ko });
};

// 상대적 시간 포맷 (ex: '3시간 전', '어제', '2일 전')
export const formatRelativeTime = (date) => {
  if (!date) return '';
  
  // Firestore 타임스탬프 처리
  const dateObj = typeof date === 'object' && date.toDate ? date.toDate() : new Date(date);
  
  const now = new Date();
  
  // 24시간 이내인지 확인
  const isWithin24Hours = now - dateObj < 24 * 60 * 60 * 1000;
  
  if (isWithin24Hours) {
    return formatDistance(dateObj, now, { addSuffix: true, locale: ko });
  } else {
    // 일주일 이내면 요일 표시, 그 외에는 날짜 표시
    const isWithinWeek = now - dateObj < 7 * 24 * 60 * 60 * 1000;
    
    if (isWithinWeek) {
      return formatRelative(dateObj, now, { locale: ko });
    } else {
      return formatDate(dateObj);
    }
  }
};

// 숫자 포맷 (천 단위 쉼표)
export const formatNumber = (number) => {
  if (number === undefined || number === null) return '0';
  
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

// 조회수 포맷 (K, M 단위로 축약)
export const formatViewCount = (count) => {
  if (!count) return '0 views';
  
  if (count < 1000) {
    return `${count} views`;
  } else if (count < 1000000) {
    return `${(count / 1000).toFixed(1).replace(/\.0$/, '')}K views`;
  } else {
    return `${(count / 1000000).toFixed(1).replace(/\.0$/, '')}M views`;
  }
};

// 파일 크기 포맷 (B, KB, MB, GB)
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// 시간 길이 포맷 (HH:MM:SS)
export const formatDuration = (seconds) => {
  if (!seconds) return '00:00';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  if (hours > 0) {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  } else {
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
};

// 문자열 자르기 (말줄임표 추가)
export const truncateText = (text, maxLength) => {
  if (!text) return '';
  
  if (text.length <= maxLength) return text;
  
  return text.substring(0, maxLength) + '...';
};

// HTML 태그 제거
export const stripHtml = (html) => {
  if (!html) return '';
  
  return html.replace(/<[^>]*>/g, '');
};

// 유저네임 포맷 (이메일에서 유저네임 추출)
export const formatUsername = (email) => {
  if (!email) return '';
  
  return email.split('@')[0];
};

// 이름의 첫 글자 추출 (아바타 대체용)
export const getInitials = (name) => {
  if (!name) return '';
  
  const names = name.split(' ');
  
  if (names.length === 1) {
    return names[0].charAt(0).toUpperCase();
  } else {
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  }
};