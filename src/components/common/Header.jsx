import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaSearch, FaBars, FaTimes, FaUser, FaBell, FaMoon, FaSun } from 'react-icons/fa';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import { ROUTES } from '../../utils/constants';

const Header = () => {
  const { currentUser, isAdmin, logout } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [scrollY, setScrollY] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);

  // 스크롤 이벤트 처리
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // 모바일 메뉴 토글
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // 사용자 드롭다운 토글
  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  // 검색 처리
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
      setSearchTerm('');
    }
  };

  // 로그아웃 처리
  const handleLogout = async () => {
    await logout();
    navigate('/');
    setShowDropdown(false);
  };

  // 메뉴 아이템 클래스 (선택된 메뉴 강조)
  const getMenuItemClass = (path) => {
    const isActive = location.pathname === path || location.pathname.startsWith(`${path}/`);
    return `px-3 py-2 text-sm font-medium rounded-md transition-colors
      ${isActive 
      ? 'text-gray-900 bg-secondary-200 hover:bg-secondary-300 dark:bg-primary-600 dark:text-white dark:hover:bg-primary-700' 
      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-dark-600 dark:hover:text-white'}`;
  };

  return (
    <header className={`bg-white dark:bg-dark-700 fixed w-full z-50 transition-all duration-300 ${scrollY > 10 ? 'header-shadow' : ''}`}>
      <div className="container-custom mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* 로고 */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <img src="/asset/icons/logo.png" alt="돌핀 로고" className="h-8 w-auto" />
              <span className="ml-2 text-xl font-bold text-primary-300 dark:text-primary-200">돌핀</span>
            </Link>
          </div>

          {/* 데스크톱 메뉴 */}
          <nav className="hidden md:flex space-x-1">
            <Link to={ROUTES.COMMUNITY} className={getMenuItemClass(ROUTES.COMMUNITY)}>
              커뮤니티
            </Link>
            <Link to={ROUTES.IDOLS} className={getMenuItemClass(ROUTES.IDOLS)}>
              아이돌
            </Link>
            <Link to={ROUTES.GALLERY} className={getMenuItemClass(ROUTES.GALLERY)}>
              갤러리
            </Link>
            <Link to={ROUTES.VIDEOS} className={getMenuItemClass(ROUTES.VIDEOS)}>
              비디오
            </Link>
          </nav>

          {/* 검색 및 사용자 메뉴 */}
          <div className="hidden md:flex items-center space-x-4">
            {/* 검색 폼 */}
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                placeholder="검색"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="py-1 pl-3 pr-8 text-sm border border-gray-300 rounded-full dark:bg-dark-600 dark:border-dark-500 dark:text-white"
              />
              <button type="submit" className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300">
                <FaSearch size={14} />
              </button>
            </form>

            {/* 다크 모드 토글 */}
            <button 
              onClick={toggleDarkMode} 
              className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
              aria-label="토글 다크 모드"
            >
              {darkMode ? <FaSun size={18} /> : <FaMoon size={18} />}
            </button>

            {/* 로그인/유저 메뉴 */}
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={toggleDropdown}
                  className="flex items-center space-x-1 text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                >
                  {currentUser.photoURL ? (
                    <img src={currentUser.photoURL} alt="프로필" className="w-8 h-8 rounded-full object-cover" />
                  ) : (
                    <FaUser size={18} />
                  )}
                </button>

                {/* 드롭다운 메뉴 */}
                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 dark:bg-dark-600">
                    <Link
                      to={ROUTES.MY_PAGE}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-dark-500"
                      onClick={() => setShowDropdown(false)}
                    >
                      마이페이지
                    </Link>
                    
                    {isAdmin && (
                      <Link
                        to={ROUTES.ADMIN}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-dark-500"
                        onClick={() => setShowDropdown(false)}
                      >
                        관리자 페이지
                      </Link>
                    )}
                    
                    <button
                      onClick={handleLogout}
                      className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-dark-500"
                    >
                      로그아웃
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to={ROUTES.LOGIN} className="text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300">
                로그인
              </Link>
            )}
          </div>

          {/* 모바일 메뉴 버튼 */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMenu}
              className="text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
              aria-label="토글 메뉴"
            >
              {isMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* 모바일 메뉴 */}
      {isMenuOpen && (
        <div className="md:hidden bg-white dark:bg-dark-700 shadow-lg">
          <div className="container-custom mx-auto px-4 py-3">
            {/* 검색 폼 */}
            <form onSubmit={handleSearch} className="mb-4 relative">
              <input
                type="text"
                placeholder="검색"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full py-2 pl-4 pr-10 text-sm border border-gray-300 rounded-md dark:bg-dark-600 dark:border-dark-500 dark:text-white"
              />
              <button type="submit" className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300">
                <FaSearch size={18} />
              </button>
            </form>

            {/* 메뉴 링크 */}
            <nav className="flex flex-col space-y-2">
              <Link 
                to={ROUTES.COMMUNITY} 
                className={getMenuItemClass(ROUTES.COMMUNITY)}
                onClick={() => setIsMenuOpen(false)}
              >
                커뮤니티
              </Link>
              <Link 
                to={ROUTES.IDOLS} 
                className={getMenuItemClass(ROUTES.IDOLS)}
                onClick={() => setIsMenuOpen(false)}
              >
                아이돌
              </Link>
              <Link 
                to={ROUTES.GALLERY} 
                className={getMenuItemClass(ROUTES.GALLERY)}
                onClick={() => setIsMenuOpen(false)}
              >
                갤러리
              </Link>
              <Link 
                to={ROUTES.VIDEOS} 
                className={getMenuItemClass(ROUTES.VIDEOS)}
                onClick={() => setIsMenuOpen(false)}
              >
                비디오
              </Link>
            </nav>

            {/* 사용자 메뉴 */}
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-dark-500">
              {currentUser ? (
                <>
                  <div className="flex items-center mb-3">
                    {currentUser.photoURL ? (
                      <img src={currentUser.photoURL} alt="프로필" className="w-8 h-8 rounded-full object-cover" />
                    ) : (
                      <FaUser size={18} className="text-gray-700 dark:text-gray-300" />
                    )}
                    <span className="ml-2 text-gray-800 dark:text-gray-200">{currentUser.displayName || currentUser.email}</span>
                  </div>
                  <div className="flex flex-col space-y-2">
                    <Link 
                      to={ROUTES.MY_PAGE} 
                      className="text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      마이페이지
                    </Link>
                    
                    {isAdmin && (
                      <Link 
                        to={ROUTES.ADMIN} 
                        className="text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        관리자 페이지
                      </Link>
                    )}
                    
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsMenuOpen(false);
                      }}
                      className="text-left text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                    >
                      로그아웃
                    </button>
                  </div>
                </>
              ) : (
                <Link 
                  to={ROUTES.LOGIN} 
                  className="block text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300"
                  onClick={() => setIsMenuOpen(false)}
                >
                  로그인
                </Link>
              )}
              
              {/* 다크 모드 토글 */}
              <button 
                onClick={toggleDarkMode} 
                className="mt-3 flex items-center text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
              >
                {darkMode ? <FaSun size={18} className="mr-2" /> : <FaMoon size={18} className="mr-2" />}
                {darkMode ? '라이트 모드로 전환' : '다크 모드로 전환'}
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;