// 이메일 유효성 검사
export const validateEmail = (email) => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
};

// 비밀번호 강도 검사
export const validatePassword = (password) => {
  // 비밀번호 강도 점수
  let strength = 0;
  const feedback = [];
  
  // 길이 검사
  if (password.length < 6) {
    feedback.push('비밀번호는 최소 6자 이상이어야 합니다.');
  } else {
    strength += 1;
    
    // 8자 이상이면 추가 점수
    if (password.length >= 8) {
      strength += 1;
    }
  }
  
  // 대문자 포함 여부
  if (/[A-Z]/.test(password)) {
    strength += 1;
  } else {
    feedback.push('대문자를 포함하면 더 강력한 비밀번호가 됩니다.');
  }
  
  // 소문자 포함 여부
  if (/[a-z]/.test(password)) {
    strength += 1;
  } else {
    feedback.push('소문자를 포함하면 더 강력한 비밀번호가 됩니다.');
  }
  
  // 숫자 포함 여부
  if (/[0-9]/.test(password)) {
    strength += 1;
  } else {
    feedback.push('숫자를 포함하면 더 강력한 비밀번호가 됩니다.');
  }
  
  // 특수 문자 포함 여부
  if (/[^A-Za-z0-9]/.test(password)) {
    strength += 1;
  } else {
    feedback.push('특수 문자를 포함하면 더 강력한 비밀번호가 됩니다.');
  }
  
  return {
    strength,
    feedback,
    isValid: strength >= 3
  };
};

// 로그인 폼 유효성 검사
export const validateLoginForm = (values) => {
  const errors = {};
  
  // 이메일 검사
  if (!values.email) {
    errors.email = '이메일을 입력해주세요.';
  } else if (!validateEmail(values.email)) {
    errors.email = '유효한 이메일 주소를 입력해주세요.';
  }
  
  // 비밀번호 검사
  if (!values.password) {
    errors.password = '비밀번호를 입력해주세요.';
  }
  
  return errors;
};

// 회원가입 폼 유효성 검사
export const validateRegisterForm = (values) => {
  const errors = {};
  
  // 이름 검사
  if (!values.displayName) {
    errors.displayName = '이름을 입력해주세요.';
  } else if (values.displayName.length < 2) {
    errors.displayName = '이름은 2자 이상이어야 합니다.';
  } else if (values.displayName.length > 30) {
    errors.displayName = '이름은 30자 이하여야 합니다.';
  }
  
  // 이메일 검사
  if (!values.email) {
    errors.email = '이메일을 입력해주세요.';
  } else if (!validateEmail(values.email)) {
    errors.email = '유효한 이메일 주소를 입력해주세요.';
  }
  
  // 비밀번호 검사
  if (!values.password) {
    errors.password = '비밀번호를 입력해주세요.';
  } else {
    const passwordCheck = validatePassword(values.password);
    
    if (!passwordCheck.isValid) {
      errors.password = passwordCheck.feedback[0] || '더 강력한 비밀번호를 사용해주세요.';
    }
  }
  
  // 비밀번호 확인 검사
  if (!values.confirmPassword) {
    errors.confirmPassword = '비밀번호 확인을 입력해주세요.';
  } else if (values.password !== values.confirmPassword) {
    errors.confirmPassword = '비밀번호가 일치하지 않습니다.';
  }
  
  // 이용약관 동의 검사
  if (!values.agreeTerms) {
    errors.agreeTerms = '이용약관에 동의해주세요.';
  }
  
  return errors;
};

// 프로필 수정 폼 유효성 검사
export const validateProfileForm = (values) => {
  const errors = {};
  
  // 이름 검사
  if (!values.displayName) {
    errors.displayName = '이름을 입력해주세요.';
  } else if (values.displayName.length < 2) {
    errors.displayName = '이름은 2자 이상이어야 합니다.';
  } else if (values.displayName.length > 30) {
    errors.displayName = '이름은 30자 이하여야 합니다.';
  }
  
  // 자기소개 검사 (선택 사항이지만 길이 제한)
  if (values.bio && values.bio.length > 150) {
    errors.bio = '자기소개는 150자 이하여야 합니다.';
  }
  
  return errors;
};

// 비밀번호 변경 폼 유효성 검사
export const validatePasswordChangeForm = (values) => {
  const errors = {};
  
  // 현재 비밀번호 검사
  if (!values.currentPassword) {
    errors.currentPassword = '현재 비밀번호를 입력해주세요.';
  }
  
  // 새 비밀번호 검사
  if (!values.newPassword) {
    errors.newPassword = '새 비밀번호를 입력해주세요.';
  } else {
    const passwordCheck = validatePassword(values.newPassword);
    
    if (!passwordCheck.isValid) {
      errors.newPassword = passwordCheck.feedback[0] || '더 강력한 비밀번호를 사용해주세요.';
    }
  }
  
  // 새 비밀번호 확인 검사
  if (!values.confirmPassword) {
    errors.confirmPassword = '새 비밀번호 확인을 입력해주세요.';
  } else if (values.newPassword !== values.confirmPassword) {
    errors.confirmPassword = '비밀번호가 일치하지 않습니다.';
  }
  
  return errors;
};

// 비밀번호 재설정 폼 유효성 검사
export const validatePasswordResetForm = (values) => {
  const errors = {};
  
  // 이메일 검사
  if (!values.email) {
    errors.email = '이메일을 입력해주세요.';
  } else if (!validateEmail(values.email)) {
    errors.email = '유효한 이메일 주소를 입력해주세요.';
  }
  
  return errors;
};

// 게시물 폼 유효성 검사
export const validatePostForm = (values) => {
  const errors = {};
  
  // 카테고리 검사
  if (!values.category) {
    errors.category = '카테고리를 선택해주세요.';
  }
  
  // 제목 검사
  if (!values.title) {
    errors.title = '제목을 입력해주세요.';
  } else if (values.title.length < 2) {
    errors.title = '제목은 2자 이상이어야 합니다.';
  } else if (values.title.length > 100) {
    errors.title = '제목은 100자 이하여야 합니다.';
  }
  
  // 내용 검사
  if (!values.content) {
    errors.content = '내용을 입력해주세요.';
  } else if (values.content.length < 10) {
    errors.content = '내용은 10자 이상이어야 합니다.';
  } else if (values.content.length > 10000) {
    errors.content = '내용은 10000자 이하여야 합니다.';
  }
  
  return errors;
};

// 댓글 폼 유효성 검사
export const validateCommentForm = (values) => {
  const errors = {};
  
  // 내용 검사
  if (!values.content) {
    errors.content = '댓글 내용을 입력해주세요.';
  } else if (values.content.length < 1) {
    errors.content = '댓글 내용을 입력해주세요.';
  } else if (values.content.length > 1000) {
    errors.content = '댓글은 1000자 이하여야 합니다.';
  }
  
  return errors;
};

// 갤러리 폼 유효성 검사
export const validateGalleryForm = (values, imageCount) => {
  const errors = {};
  
  // 제목 검사
  if (!values.title) {
    errors.title = '제목을 입력해주세요.';
  } else if (values.title.length < 2) {
    errors.title = '제목은 2자 이상이어야 합니다.';
  } else if (values.title.length > 100) {
    errors.title = '제목은 100자 이하여야 합니다.';
  }
  
  // 설명 검사 (선택 사항이지만 길이 제한)
  if (values.description && values.description.length > 500) {
    errors.description = '설명은 500자 이하여야 합니다.';
  }
  
  // 이미지 검사
  if (!imageCount || imageCount === 0) {
    errors.images = '최소 1개 이상의 이미지를 업로드해주세요.';
  }
  
  return errors;
};

// 비디오 폼 유효성 검사
export const validateVideoForm = (values, hasVideo) => {
  const errors = {};
  
  // 제목 검사
  if (!values.title) {
    errors.title = '제목을 입력해주세요.';
  } else if (values.title.length < 2) {
    errors.title = '제목은 2자 이상이어야 합니다.';
  } else if (values.title.length > 100) {
    errors.title = '제목은 100자 이하여야 합니다.';
  }
  
  // 설명 검사 (선택 사항이지만 길이 제한)
  if (values.description && values.description.length > 500) {
    errors.description = '설명은 500자 이하여야 합니다.';
  }
  
  // 비디오 URL 또는 파일 검사
  if (!values.videoUrl && !hasVideo) {
    errors.videoUrl = '비디오 URL을 입력하거나 파일을 업로드해주세요.';
  } else if (values.videoUrl && !/^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be|vimeo\.com)\/.+/.test(values.videoUrl)) {
    errors.videoUrl = '유효한 YouTube 또는 Vimeo URL을 입력해주세요.';
  }
  
  return errors;
};

// 아이돌 폼 유효성 검사 (관리자용)
export const validateIdolForm = (values) => {
  const errors = {};
  
  // 이름 검사
  if (!values.name) {
    errors.name = '이름을 입력해주세요.';
  } else if (values.name.length < 2) {
    errors.name = '이름은 2자 이상이어야 합니다.';
  } else if (values.name.length > 50) {
    errors.name = '이름은 50자 이하여야 합니다.';
  }
  
  // 그룹 검사 (선택 사항이지만 길이 제한)
  if (values.group && values.group.length > 50) {
    errors.group = '그룹명은 50자 이하여야 합니다.';
  }
  
  // 소개 검사 (선택 사항이지만 길이 제한)
  if (values.bio && values.bio.length > 500) {
    errors.bio = '소개는 500자 이하여야 합니다.';
  }
  
  // 소셜 미디어 검사 (형식 검사)
  if (values.instagram && !/^[a-zA-Z0-9._]+$/.test(values.instagram)) {
    errors.instagram = '유효한 Instagram 사용자명을 입력해주세요.';
  }
  
  if (values.twitter && !/^[a-zA-Z0-9_]+$/.test(values.twitter)) {
    errors.twitter = '유효한 Twitter 사용자명을 입력해주세요.';
  }
  
  if (values.youtube && !/^(https?:\/\/)?(www\.)?youtube\.com\/.+/.test(values.youtube)) {
    errors.youtube = '유효한 YouTube URL을 입력해주세요.';
  }
  
  return errors;
};