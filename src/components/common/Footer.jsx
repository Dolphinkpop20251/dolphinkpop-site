import React from 'react';
import { Link } from 'react-router-dom';
import { FaTwitter, FaInstagram, FaYoutube, FaFacebook, FaEnvelope } from 'react-icons/fa';
import { ROUTES, SITE_INFO } from '../../utils/constants';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-primary-50 dark:bg-dark-800 py-8 mt-auto">
      <div className="container-custom mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* 사이트 정보 */}
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="flex items-center mb-4">
              <img src="/asset/icons/logo.png" alt="돌핀 로고" className="h-8 w-auto" />
              <span className="ml-2 text-xl font-bold text-primary-300 dark:text-primary-200">돌핀</span>
            </Link>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              {SITE_INFO.description} - K-POP 팬들을 위한 종합 커뮤니티 플랫폼
            </p>
            <div className="flex space-x-4">
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400"
                aria-label="Twitter"
              >
                <FaTwitter size={20} />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400"
                aria-label="Instagram"
              >
                <FaInstagram size={20} />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400"
                aria-label="YouTube"
              >
                <FaYoutube size={20} />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400"
                aria-label="Facebook"
              >
                <FaFacebook size={20} />
              </a>
            </div>
          </div>

          {/* 빠른 링크 */}
          <div className="col-span-1">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wider mb-4">
              바로가기
            </h3>
            <ul className="space-y-2">
              <li>
                <Link to={ROUTES.COMMUNITY} className="text-gray-600 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 text-sm">
                  커뮤니티
                </Link>
              </li>
              <li>
                <Link to={ROUTES.IDOLS} className="text-gray-600 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 text-sm">
                  아이돌
                </Link>
              </li>
              <li>
                <Link to={ROUTES.GALLERY} className="text-gray-600 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 text-sm">
                  갤러리
                </Link>
              </li>
              <li>
                <Link to={ROUTES.VIDEOS} className="text-gray-600 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 text-sm">
                  비디오
                </Link>
              </li>
            </ul>
          </div>

          {/* 정보 */}
          <div className="col-span-1">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wider mb-4">
              사이트 정보
            </h3>
            <ul className="space-y-2">
              <li>
                <Link to="/about" className="text-gray-600 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 text-sm">
                  소개
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-gray-600 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 text-sm">
                  개인정보처리방침
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-gray-600 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 text-sm">
                  이용약관
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-gray-600 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 text-sm">
                  자주 묻는 질문
                </Link>
              </li>
            </ul>
          </div>

          {/* 문의하기 */}
          <div className="col-span-1">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wider mb-4">
              문의하기
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              문의사항이 있으시면 아래 이메일로 연락주세요.
            </p>
            <a
              href="mailto:contact@dolphin-kpop.com"
              className="flex items-center text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300 text-sm"
            >
              <FaEnvelope className="mr-2" />
              contact@dolphin-kpop.com
            </a>
          </div>
        </div>

        {/* 카피라이트 */}
        <div className="border-t border-gray-200 dark:border-gray-700 mt-8 pt-8">
          <p className="text-sm text-center text-gray-500 dark:text-gray-400">
            &copy; {currentYear} {SITE_INFO.name}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;