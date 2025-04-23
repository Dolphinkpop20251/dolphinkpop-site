import { useContext } from 'react';
import { ThemeContext } from '../contexts/ThemeContext';

// 테마 관련 커스텀 훅
export const useTheme = () => {
  const themeContext = useContext(ThemeContext);
  
  if (!themeContext) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  
  return themeContext;
};

export default useTheme;