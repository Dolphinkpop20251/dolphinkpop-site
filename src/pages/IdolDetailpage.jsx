import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaHeart, FaUsers, FaCalendar, FaBirthdayCake, FaGlobe, FaInstagram, FaTwitter, FaYoutube } from 'react-icons/fa';
import { getIdolById } from '../services/idolService';
import { getIdolGalleries } from '../services/galleryService';
import { getIdolVideos } from '../services/videoService';
import { getIdolPosts } from '../services/postService';
import IdolFollowButton from '../components/idols/IdolFollowButton';
import Loading from '../components/common/Loading';
import { formatDate } from '../utils/formatters';
import { ROUTES } from '../utils/constants';

const IdolDetailPage = () => {
  const { idolId } = useParams();
  const navigate = useNavigate();
  const [idol, setIdol] = useState(null);
  const [galleries, setGalleries] = useState([]);
  const [videos, setVideos] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('info');
  
  // 아이돌 정보 가져오기
  useEffect(() => {
    const fetchIdolData = async () => {
      if (!idolId) {
        setError('아이돌 ID가 유효하지 않습니다.');
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        setError(null);
        
        // 아이돌 정보 가져오기
        const idolResponse = await getIdolById(idolId);
        
        if (!idolResponse.success) {
          setError(idolResponse.error || '아이돌 정보를 가져오는데 실패했습니다.');
          return;
        }
        
        setIdol(idolResponse.idol);
        
        // 갤러리 가져오기
        const galleriesResponse = await getIdolGalleries(idolId, 4);
        if (galleriesResponse.success) {
          setGalleries(galleriesResponse.galleries);
        }
        
        // 비디오 가져오기
        const videosResponse = await getIdolVideos(idolId, 4);
        if (videosResponse.success) {
          setVideos(videosResponse.videos);
        }
        
        // 게시글 가져오기
        const postsResponse = await getIdolPosts(idolId, 5);
        if (postsResponse.success) {
          setPosts(postsResponse.posts);
        }
      } catch (error) {
        console.error('아이돌 데이터 로딩 오류:', error);
        setError('데이터 로딩 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchIdolData();
  }, [idolId]);
  
  // 로딩 중 표시
  if (loading) {
    return (
      <div className="container-custom mx-auto px-4 py-12">
        <Loading size="large" message="아이돌 정보를 불러오는 중..." />
      </div>
    );
  }
  
  // 에러 표시
  if (error) {
    return (
      <div className="container-custom mx-auto px-4 py-12">
        <div className="text-center py-8">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">오류가 발생했습니다</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="btn btn-primary"
          >
            이전 페이지로 돌아가기
          </button>
        </div>
      </div>
    );
  }
  
  // 아이돌이 없는 경우
  if (!idol) {
    return (
      <div className="container-custom mx-auto px-4 py-12">
        <div className="text-center py-8">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">아이돌을 찾을 수 없습니다</h2>
          <button
            onClick={() => navigate(ROUTES.IDOLS)}
            className="btn btn-primary"
          >
            아이돌 목록으로 돌아가기
          </button>
        </div>
      </div>
    );
  }
  
  // 소셜 미디어 링크 렌더링
  const renderSocialLinks = () => {
    const socialLinks = [];
    
    if (idol.instagram) {
      socialLinks.push(
        <a
          key="instagram"
          href={`https://instagram.com/${idol.instagram}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-700 hover:text-pink-600 dark:text-gray-300 dark:hover:text-pink-400"
          aria-label="Instagram"
        >
          <FaInstagram size={24} />
        </a>
      );
    }
    
    if (idol.twitter) {
      socialLinks.push(
        <a
          key="twitter"
          href={`https://twitter.com/${idol.twitter}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-700 hover:text-blue-400 dark:text-gray-300 dark:hover:text-blue-400"
          aria-label="Twitter"
        >
          <FaTwitter size={24} />
        </a>
      );
    }
    
    if (idol.youtube) {
      socialLinks.push(
        <a
          key="youtube"
          href={idol.youtube}
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-700 hover:text-red-600 dark:text-gray-300 dark:hover:text-red-400"
          aria-label="YouTube"
        >
          <FaYoutube size={24} />
        </a>
      );
    }
    
    if (idol.website) {
      socialLinks.push(
        <a
          key="website"
          href={idol.website}
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400"
          aria-label="웹사이트"
        >
          <FaGlobe size={22} />
        </a>
      );
    }
    
    return socialLinks.length > 0 ? (
      <div className="flex items-center space-x-4 mt-4">
        {socialLinks}
      </div>
    ) : null;
  };
  
  return (
    <div className="container-custom mx-auto px-4 py-8 mt-20">
      {/* 이전 페이지 링크 */}
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white flex items-center"
        >
          <FaArrowLeft className="mr-2" />
          <span>돌아가기</span>
        </button>
      </div>
      
      {/* 아이돌 프로필 헤더 */}
      <div className="bg-white dark:bg-dark-700 rounded-lg shadow-sm p-6 mb-8">
        <div className="flex flex-col md:flex-row gap-6">
          {/* 프로필 이미지 */}
          <div className="w-full md:w-1/3 lg:w-1/4">
            <div className="relative overflow-hidden rounded-lg">
              <img
                src={idol.profileImage || '/asset/images/default-idol.png'}
                alt={idol.name}
                className="idol-img w-full"
              />
            </div>
          </div>
          
          {/* 아이돌 정보 */}
          <div className="w-full md:w-2/3 lg:w-3/4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 md:mb-0">
                {idol.name}
              </h1>
              
              <IdolFollowButton 
                idolId={idol.id} 
                size="large" 
                showCount={true}
                followerCount={idol.followerCount || 0}
              />
            </div>
            
            <div className="mb-4">
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-4">
                {idol.group || '솔로 아티스트'}
              </p>
              
              {idol.bio && (
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line mb-4">
                  {idol.bio}
                </p>
              )}
              
              {renderSocialLinks()}
            </div>
            
            {/* 기본 정보 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
              {idol.birthdate && (
                <div className="flex items-center">
                  <FaBirthdayCake className="text-gray-500 mr-2" />
                  <span className="text-gray-700 dark:text-gray-300">
                    {formatDate(idol.birthdate?.toDate?.() || idol.birthdate)}
                  </span>
                </div>
              )}
              
              {idol.debutDate && (
                <div className="flex items-center">
                  <FaCalendar className="text-gray-500 mr-2" />
                  <span className="text-gray-700 dark:text-gray-300">
                    데뷔: {formatDate(idol.debutDate?.toDate?.() || idol.debutDate)}
                  </span>
                </div>
              )}
              
              {idol.company && (
                <div className="flex items-center">
                  <FaUsers className="text-gray-500 mr-2" />
                  <span className="text-gray-700 dark:text-gray-300">
                    {idol.company}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* 탭 메뉴 */}
      <div className="mb-6 border-b border-gray-200 dark:border-dark-600">
        <div className="flex flex-wrap -mb-px">
          <button
            className={`inline-block py-3 px-4 font-medium text-sm border-b-2 transition-colors mr-1
              ${activeTab === 'info' 
                ? 'border-primary-600 text-primary-600 dark:border-primary-400 dark:text-primary-400' 
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            onClick={() => setActiveTab('info')}
          >
            정보
          </button>
          <button
            className={`inline-block py-3 px-4 font-medium text-sm border-b-2 transition-colors mr-1
              ${activeTab === 'galleries' 
                ? 'border-primary-600 text-primary-600 dark:border-primary-400 dark:text-primary-400' 
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            onClick={() => setActiveTab('galleries')}
          >
            갤러리
          </button>
          <button
            className={`inline-block py-3 px-4 font-medium text-sm border-b-2 transition-colors mr-1
              ${activeTab === 'videos' 
                ? 'border-primary-600 text-primary-600 dark:border-primary-400 dark:text-primary-400' 
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            onClick={() => setActiveTab('videos')}
          >
            비디오
          </button>
          <button
            className={`inline-block py-3 px-4 font-medium text-sm border-b-2 transition-colors
              ${activeTab === 'posts' 
                ? 'border-primary-600 text-primary-600 dark:border-primary-400 dark:text-primary-400' 
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            onClick={() => setActiveTab('posts')}
          >
            게시글
          </button>
        </div>
      </div>
      
      {/* 탭 콘텐츠 */}
      <div className="mb-8">
        {/* 정보 탭 */}
        {activeTab === 'info' && (
          <div className="space-y-6">
            {/* 상세 정보 */}
            <div className="bg-white dark:bg-dark-700 rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">상세 정보</h2>
              
              {idol.details ? (
                <div className="whitespace-pre-line text-gray-700 dark:text-gray-300">
                  {idol.details}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400">
                  상세 정보가 없습니다.
                </p>
              )}
            </div>
            
            {/* 약력 */}
            {idol.history && (
              <div className="bg-white dark:bg-dark-700 rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">약력</h2>
                <div className="whitespace-pre-line text-gray-700 dark:text-gray-300">
                  {idol.history}
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* 갤러리 탭 */}
        {activeTab === 'galleries' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">갤러리</h2>
              <Link 
                to={`/gallery?idol=${idol.name}`}
                className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 text-sm"
              >
                더 보기
              </Link>
            </div>
            
            {galleries.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {galleries.map(gallery => (
                  <Link 
                    key={gallery.id} 
                    to={`/gallery/${gallery.id}`}
                    className="group"
                  >
                    <div className="relative overflow-hidden rounded-lg">
                      <img 
                        src={gallery.thumbnailUrl || (gallery.imageUrls && gallery.imageUrls[0]) || '/asset/images/default-gallery.png'} 
                        alt={gallery.title}
                        className="w-full aspect-square object-cover transition-transform group-hover:scale-105"
                      />
                      {gallery.imageCount > 1 && (
                        <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                          +{gallery.imageCount - 1}
                        </div>
                      )}
                    </div>
                    <h3 className="mt-2 font-medium text-gray-900 dark:text-white line-clamp-1">
                      {gallery.title}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      좋아요 {gallery.likeCount || 0}
                    </p>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 dark:bg-dark-800 rounded-lg">
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  갤러리가 없습니다.
                </p>
                <Link 
                  to={`/gallery/upload?idol=${idol.name}`}
                  className="btn btn-primary"
                >
                  첫 번째 갤러리 업로드하기
                </Link>
              </div>
            )}
          </div>
        )}
        
        {/* 비디오 탭 */}
        {activeTab === 'videos' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">비디오</h2>
              <Link 
                to={`/videos?idol=${idol.name}`}
                className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 text-sm"
              >
                더 보기
              </Link>
            </div>
            
            {videos.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {videos.map(video => (
                  <Link 
                    key={video.id} 
                    to={`/videos/${video.id}`}
                    className="group"
                  >
                    <div className="relative overflow-hidden rounded-lg">
                      <img 
                        src={video.thumbnailUrl || '/asset/images/default-thumbnail.png'} 
                        alt={video.title}
                        className="w-full aspect-video object-cover transition-transform group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-12 h-12 rounded-full bg-white/80 flex items-center justify-center">
                          <div className="w-0 h-0 border-y-8 border-y-transparent border-l-12 border-l-primary-600 ml-1"></div>
                        </div>
                      </div>
                    </div>
                    <h3 className="mt-2 font-medium text-gray-900 dark:text-white line-clamp-2">
                      {video.title}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      조회수 {video.viewCount || 0}회
                    </p>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 dark:bg-dark-800 rounded-lg">
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  비디오가 없습니다.
                </p>
                <Link 
                  to={`/videos/upload?idol=${idol.name}`}
                  className="btn btn-primary"
                >
                  첫 번째 비디오 업로드하기
                </Link>
              </div>
            )}
          </div>
        )}
        
        {/* 게시글 탭 */}
        {activeTab === 'posts' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">게시글</h2>
              <Link 
                to={`/community?search=${idol.name}`}
                className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 text-sm"
              >
                더 보기
              </Link>
            </div>
            
            {posts.length > 0 ? (
              <div className="bg-white dark:bg-dark-700 rounded-lg shadow-sm">
                {posts.map((post, index) => (
                  <Link 
                    key={post.id} 
                    to={`/community/${post.id}`}
                    className={`block p-4 ${
                      index !== posts.length - 1 ? 'border-b border-gray-100 dark:border-dark-600' : ''
                    } hover:bg-gray-50 dark:hover:bg-dark-600 transition-colors`}
                  >
                    <h3 className="text-gray-900 dark:text-white font-medium mb-1 line-clamp-1">
                      {post.title}
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-2 line-clamp-1">
                      {post.content?.replace(/<[^>]*>/g, '').substring(0, 100)}
                    </p>
                    <div className="flex items-center text-xs text-gray-400 dark:text-gray-500">
                      <span>댓글 {post.commentCount || 0}</span>
                      <span className="mx-2">•</span>
                      <span>좋아요 {post.likeCount || 0}</span>
                      <span className="mx-2">•</span>
                      <span>조회 {post.viewCount || 0}</span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 dark:bg-dark-800 rounded-lg">
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  게시글이 없습니다.
                </p>
                <Link 
                  to={`/community/write?idol=${idol.name}`}
                  className="btn btn-primary"
                >
                  첫 번째 게시글 작성하기
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* 관련 아이돌 */}
      {idol.group && (
        <div className="bg-white dark:bg-dark-700 rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            {idol.group} 멤버
          </h2>
          <p className="text-gray-500 dark:text-gray-400">
            같은 그룹 멤버 목록은 준비 중입니다.
          </p>
        </div>
      )}
    </div>
  );
};

export default IdolDetailPage;