import { useState, useCallback } from 'react';

// 폼 상태 관리 커스텀 훅
export const useForm = (initialValues = {}, validate) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 필드 값 변경 처리
  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    
    // 체크박스인 경우 checked 값을, 그 외에는 value 값을 사용
    const fieldValue = type === 'checkbox' ? checked : value;
    
    setValues(prevValues => ({
      ...prevValues,
      [name]: fieldValue
    }));
    
    // 이미 터치된 필드라면 유효성 검사 실행
    if (touched[name] && validate) {
      const validation = validate({ ...values, [name]: fieldValue });
      setErrors(prevErrors => ({
        ...prevErrors,
        [name]: validation[name]
      }));
    }
  }, [values, touched, validate]);

  // 필드 블러(포커스 아웃) 처리
  const handleBlur = useCallback((e) => {
    const { name } = e.target;
    
    // 필드를 터치 상태로 표시
    setTouched(prevTouched => ({
      ...prevTouched,
      [name]: true
    }));
    
    // 유효성 검사 실행
    if (validate) {
      const validation = validate(values);
      setErrors(prevErrors => ({
        ...prevErrors,
        [name]: validation[name]
      }));
    }
  }, [values, validate]);

  // 직접 값 설정 (파일 입력 등에 사용)
  const setValue = useCallback((name, value) => {
    setValues(prevValues => ({
      ...prevValues,
      [name]: value
    }));
  }, []);

  // 폼 제출 처리
  const handleSubmit = useCallback((onSubmit) => {
    return async (e) => {
      e.preventDefault();
      
      // 모든 필드를 터치 상태로 표시
      const allTouched = Object.keys(values).reduce((acc, key) => {
        acc[key] = true;
        return acc;
      }, {});
      
      setTouched(allTouched);
      
      // 유효성 검사 실행
      let formErrors = {};
      if (validate) {
        formErrors = validate(values);
        setErrors(formErrors);
      }
      
      // 에러가 없으면 제출 함수 실행
      const hasErrors = Object.values(formErrors).some(error => error);
      if (!hasErrors) {
        setIsSubmitting(true);
        try {
          await onSubmit(values);
        } finally {
          setIsSubmitting(false);
        }
      }
    };
  }, [values, validate]);

  // 폼 초기화
  const resetForm = useCallback((newValues = initialValues) => {
    setValues(newValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);

  // 특정 필드 에러 설정
  const setFieldError = useCallback((name, error) => {
    setErrors(prevErrors => ({
      ...prevErrors,
      [name]: error
    }));
  }, []);

  // 모든 필드가 유효한지 확인
  const isValid = Object.keys(errors).length === 0 || !Object.values(errors).some(error => error);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    isValid,
    handleChange,
    handleBlur,
    handleSubmit,
    resetForm,
    setValue,
    setFieldError
  };
};
