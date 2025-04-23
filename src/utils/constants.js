// 라우트 경로
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  COMMUNITY: '/community',
  IDOLS: '/idols',
  GALLERY: '/gallery',
  VIDEOS: '/videos',
  MY_PAGE: '/mypage',
  ADMIN: '/admin'
};

// 게시물 카테고리
export const POST_CATEGORIES = [
  { id: 'general', name: '일반 토론' },
  { id: 'news', name: '뉴스/소식' },
  { id: 'review', name: '리뷰/감상' },
  { id: 'photo', name: '사진/이미지' },
  { id: 'video', name: '영상/클립' },
  { id: 'event', name: '행사/이벤트' },
  { id: 'merch', name: '굿즈/상품' },
  { id: 'music', name: '음악/앨범' },
  { id: 'question', name: '질문/도움' }
];

// 사용자 역할
export const USER_ROLES = {
  USER: 'user',
  ADMIN: 'admin',
  MODERATOR: 'moderator'
};

// 알림 타입
export const NOTIFICATION_TYPES = {
  LIKE: 'like',
  COMMENT: 'comment',
  FOLLOW: 'follow',
  MENTION: 'mention',
  SYSTEM: 'system'
};

// 게시물 정렬 옵션
export const POST_SORT_OPTIONS = {
  LATEST: 'latest',
  POPULAR: 'popular',
  COMMENTS: 'comments',
  VIEWS: 'views'
};

// 최대 업로드 제한
export const MAX_UPLOAD_LIMITS = {
  POST_IMAGES: 5,
  GALLERY_IMAGES: 20,
  VIDEO_SIZE_MB: 100,
  PROFILE_PHOTO_SIZE_MB: 5
};

// 아이돌 데뷔 연도 범위
export const DEBUT_YEAR_RANGE = {
  MIN: 1990,
  MAX: new Date().getFullYear()
};

// 이미지 크기
export const IMAGE_SIZES = {
  THUMBNAIL: {
    WIDTH: 300,
    HEIGHT: 300
  },
  PROFILE: {
    WIDTH: 200,
    HEIGHT: 200
  },
  BANNER: {
    WIDTH: 1200,
    HEIGHT: 400
  }
};

// 소셜 미디어 타입
export const SOCIAL_MEDIA_TYPES = {
  INSTAGRAM: 'instagram',
  TWITTER: 'twitter',
  YOUTUBE: 'youtube',
  FACEBOOK: 'facebook',
  TIKTOK: 'tiktok'
};

// 로그인 제공업체
export const AUTH_PROVIDERS = {
  EMAIL: 'email',
  GOOGLE: 'google',
  FACEBOOK: 'facebook',
  TWITTER: 'twitter'
};

// 테마 타입
export const THEME_TYPES = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system'
};

// 토스트 메시지 타입
export const TOAST_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  INFO: 'info',
  WARNING: 'warning'
};

// 로딩 크기
export const LOADING_SIZES = {
  SMALL: 'small',
  MEDIUM: 'medium',
  LARGE: 'large'
};

// 스토리지 경로
export const STORAGE_PATHS = {
  PROFILE_IMAGES: 'profiles',
  POST_IMAGES: 'posts',
  GALLERY_IMAGES: 'galleries',
  VIDEO_THUMBNAILS: 'videos/thumbnails',
  IDOL_IMAGES: 'idols'
};

// 기본 컬렉션 이름
export const COLLECTIONS = {
  USERS: 'users',
  POSTS: 'posts',
  COMMENTS: 'comments',
  IDOLS: 'idols',
  GALLERIES: 'galleries',
  VIDEOS: 'videos',
  NOTIFICATIONS: 'notifications'
};

// 페이지네이션 기본값
export const PAGINATION = {
  DEFAULT_LIMIT: 10,
  SMALL_LIMIT: 5,
  LARGE_LIMIT: 20
};

// 사이트 정보
export const SITE_INFO = {
  NAME: '돌핀',
  SLOGAN: 'K-POP 아이돌 팬들을 위한 커뮤니티',
  COPYRIGHT: '© 2025 돌핀 커뮤니티. All Rights Reserved.',
  VERSION: '1.0.0',
  CONTACT_EMAIL: 'contact@dolphin-kpop.com',
  description: 'K-POP 팬들을 위한 종합 커뮤니티 플랫폼',
  SOCIAL: {
    TWITTER: 'https://twitter.com/dolphin_kpop',
    INSTAGRAM: 'https://instagram.com/dolphin_kpop',
    YOUTUBE: 'https://youtube.com/dolphin_kpop'
  }
};