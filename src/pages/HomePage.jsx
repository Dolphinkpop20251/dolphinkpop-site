import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaArrowRight, FaFire, FaStar, FaVideo, FaImage, FaUsers } from 'react-icons/fa';
import { getPopularIdols } from '../services/idolService';
import { getPopularVideos } from '../services/videoService';
import { getPopularGalleries } from '../services/galleryService';
import { getPosts } from '../services/postService';
import { ROUTES } from '../utils/constants';
import Banner from '../components/common/Banner';
import SliderBanner from '../components/common/SliderBanner';
import { bannerSlides } from '../utils/bannerData';

const HomePage = () => {
  const [latestPosts, setLatestPosts] = useState([]);
  const [popularIdols, setPopularIdols] = useState([]);
  const [popularVideos, setPopularVideos] = useState([]);
  const [popularGalleries, setPopularGalleries] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // 데이터 불러오기
  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setLoading(true);
        
        // 인기 아이돌 불러오기
        const idolsResponse = await getPopularIdols(5);
        if (idolsResponse.success) {
          setPopularIdols(idolsResponse.idols);
        }
        
        // 인기 비디오 불러오기
        const videosResponse = await getPopularVideos(4);
        if (videosResponse.success) {
          setPopularVideos(videosResponse.videos);
        }
        
        // 인기 갤러리 불러오기
        const galleriesResponse = await getPopularGalleries(4);
        if (galleriesResponse.success) {
          setPopularGalleries(galleriesResponse.galleries);
        }
        
        // 최신 게시물 불러오기
        const postsResponse = await getPosts(null, 5);
        if (postsResponse.success) {
          setLatestPosts(postsResponse.posts);
        }
      } catch (error) {
        console.error('홈페이지 데이터 로딩 오류:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchHomeData();
  }, []);
  
  // 섹션 헤더 컴포넌트
  const SectionHeader = ({ title, icon, linkTo, linkText = '더 보기' }) => (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
        {icon}
        <span className="ml-2">{title}</span>
      </h2>
      {linkTo && (
        <Link 
          to={linkTo} 
          className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 text-sm flex items-center"
        >
          {linkText}
          <FaArrowRight className="ml-1" size={12} />
        </Link>
      )}
    </div>
  );
  
  // 로딩 중이면 로딩 표시
  if (loading) {
    return (
      <div className="container-custom mx-auto px-4 py-8 mt-20">
        <div className="text-center py-12">
          <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">홈페이지를 불러오는 중...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container-custom mx-auto px-4 py-8 mt-20">
      {/* 슬라이드 배너 (최상단에 추가) */}
      <div className="mb-10">
        <SliderBanner slides={bannerSlides} />
      </div>
      
      {/* 공지 배너 */}
      <div className="mb-8">
        <Banner 
          message="돌핀과 함께 K-POP 아이돌 팬 활동을 더욱 즐겁게 즐겨보세요! 새로운 기능이 추가되었습니다."
          type="primary"
          link="/about"
          linkText="자세히 알아보기"
          dismissible={true}
        />
      </div>
      
      {/* 히어로 섹션 */}
      <div className="bg-gradient-to-r from-primary-300 to-secondary-300 rounded-xl p-8 mb-12 text-gray-800">
        <div className="max-w-2xl">
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">
            K-POP 아이돌 팬들을 위한 커뮤니티
          </h1>
          <p className="text-lg mb-6">
            돌핀에서 좋아하는 아이돌의 최신 소식을 확인하고 다른 팬들과 소통하세요.
            갤러리, 비디오, 커뮤니티를 한 곳에서 만나보세요.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link 
              to={ROUTES.COMMUNITY} 
              className="btn bg-white text-primary-600 hover:bg-gray-100"
            >
              커뮤니티 시작하기
            </Link>
            <Link 
              to={ROUTES.IDOLS} 
              className="btn bg-white/20 text-white hover:bg-white/30"
            >
              아이돌 둘러보기
            </Link>
          </div>
        </div>
      </div>
      
      {/* 인기 아이돌 섹션 */}
      <section className="mb-12">
        <SectionHeader 
          title="인기 아이돌" 
          icon={<FaStar className="text-yellow-500" />}
          linkTo={ROUTES.IDOLS}
        />
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {popularIdols.map(idol => (
            <Link 
              key={idol.id} 
              to={`${ROUTES.IDOLS}/${idol.id}`}
              className="group"
            >
              <div className="relative overflow-hidden rounded-lg">
                <img 
                  src={idol.profileImage || '/asset/images/default-idol.png'} 
                  alt={idol.name}
                  className="w-full aspect-[3/4] object-cover transition-transform group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                <div className="absolute bottom-0 left-0 p-3">
                  <h3 className="text-white font-bold">{idol.name}</h3>
                  <p className="text-white/80 text-sm">{idol.group}</p>
                </div>
              </div>
            </Link>
          ))}
          
          {popularIdols.length === 0 && (
            <div className="col-span-full text-center py-8 text-gray-500 dark:text-gray-400">
              아직 등록된 아이돌이 없습니다.
            </div>
          )}
        </div>
      </section>
      
      {/* 최신 게시글 섹션 */}
      <section className="mb-12">
        <SectionHeader 
          title="최신 게시글" 
          icon={<FaFire className="text-red-500" />}
          linkTo={ROUTES.COMMUNITY}
        />
        
        <div className="bg-white dark:bg-dark-700 rounded-lg shadow-sm">
          {latestPosts.map((post, index) => (
            <Link 
              key={post.id} 
              to={`${ROUTES.COMMUNITY}/${post.id}`}
              className={`block p-4 ${
                index !== latestPosts.length - 1 ? 'border-b border-gray-100 dark:border-dark-600' : ''
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
          
          {latestPosts.length === 0 && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              아직 작성된 게시글이 없습니다.
            </div>
          )}
        </div>
      </section>
      
      {/* 인기 비디오 섹션 */}
      <section className="mb-12">
        <SectionHeader 
          title="인기 비디오" 
          icon={<FaVideo className="text-blue-500" />}
          linkTo={ROUTES.VIDEOS}
        />
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {popularVideos.map(video => (
            <Link 
              key={video.id} 
              to={`${ROUTES.VIDEOS}/${video.id}`}
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
          
          {popularVideos.length === 0 && (
            <div className="col-span-full text-center py-8 text-gray-500 dark:text-gray-400">
              아직 등록된 비디오가 없습니다.
            </div>
          )}
        </div>
      </section>
      
      {/* 인기 갤러리 섹션 */}
      <section className="mb-12">
        <SectionHeader 
          title="인기 갤러리" 
          icon={<FaImage className="text-purple-500" />}
          linkTo={ROUTES.GALLERY}
        />
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {popularGalleries.map(gallery => (
            <Link 
              key={gallery.id} 
              to={`${ROUTES.GALLERY}/${gallery.id}`}
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
          
          {popularGalleries.length === 0 && (
            <div className="col-span-full text-center py-8 text-gray-500 dark:text-gray-400">
              아직 등록된 갤러리가 없습니다.
            </div>
          )}
        </div>
      </section>
      
      {/* 회원가입 유도 섹션 */}
      <section className="bg-primary-50 dark:bg-dark-800 rounded-xl p-8 text-center border border-primary-100 dark:border-primary-700">
        <FaUsers className="mx-auto text-primary-300 mb-4" size={40} />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          아직 돌핀의 회원이 아니신가요?
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-2xl mx-auto">
          지금 회원가입하고 좋아하는 아이돌을 팔로우하고, 다양한 콘텐츠를 공유하며 
          전 세계 K-POP 팬들과 소통하세요!
        </p>
        <div className="flex justify-center gap-4">
          <Link 
            to={ROUTES.REGISTER} 
            className="btn btn-primary"
          >
            회원가입
          </Link>
          <Link 
            to={ROUTES.LOGIN}
            className="btn btn-outline"
          >
            로그인
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;