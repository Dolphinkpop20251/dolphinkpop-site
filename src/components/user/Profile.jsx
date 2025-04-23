import React, { useState, useEffect } from 'react';
import { FaCalendarAlt, FaEnvelope, FaPen, FaHeart, FaNewspaper, FaImage, FaVideo } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { getUserById } from '../../services/userService';
import { getUserPosts } from '../../services/postService';
import { getUserGalleries } from '../../services/galleryService';
import { getUserVideos } from '../../services/videoService';
import { getFollowedIdols } from '../../services/idolService';
import { formatDate } from '../../utils/formatters';

const Profile = () => {
  const { currentUser } = useAuth();
  const [userData, setUserData] = useState(null);
  const [userStats, setUserStats] = useState({
    posts: 0,
    photos: 0,
    videos: 0,
    idols: 0
  });
  const [loading, setLoading] = useState(true);
  
  // 사용자 정보 및 통계 불러오기
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        
        if (currentUser) {
          // 사용자 기본 정보
          const userResponse = await getUserById(currentUser.uid);
          if (userResponse.success) {
            setUserData(userResponse.user);
          }
          
          // 사용자 통계 정보
          const [postsResponse, galleriesResponse, videosResponse, idolsResponse] = await Promise.all([
            getUserPosts(currentUser.uid),
            getUserGalleries(currentUser.uid),
            getUserVideos(currentUser.uid),
            getFollowedIdols(currentUser.uid)
          ]);
          
          setUserStats({
            posts: postsResponse.success ? postsResponse.posts.length : 0,
            photos: galleriesResponse.success ? galleriesResponse.galleries.length : 0,
            videos: videosResponse.success ? videosResponse.videos.length : 0,
            idols: idolsResponse.success ? idolsResponse.idols.length : 0
          });
        }
      } catch (error) {
        console.error('사용자 정보 로딩 오류:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, [currentUser]);
  
  // 로딩 중
  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">프로필을 불러오는 중...</p>
      </div>
    );
  }
  
  // 사용자 정보가 없는 경우
  if (!userData) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-400">프로필 정보를 불러올 수 없습니다.</p>
      </div>
    );
  }
  
  // 계정 생성일 포맷팅
  const createdAtDate = userData.createdAt ? formatDate(userData.createdAt, 'YYYY년 MM월 DD일') : '알 수 없음';
  
  return (
    <div>
      {/* 프로필 헤더 */}
      <div className="flex flex-col md:flex-row items-center md:items-start">
        {/* 프로필 이미지 */}
        <div className="relative mb-4 md:mb-0 md:mr-6">
          {userData.photoURL ? (
            <img
              src={userData.photoURL}
              alt={userData.displayName}
              className="w-32 h-32 rounded-full object-cover border-4 border-white dark:border-dark-600 shadow-md"
            />
          ) : (
            <div className="w-32 h-32 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center border-4 border-white dark:border-dark-600 shadow-md">
              <span className="text-4xl font-bold text-gray-500 dark:text-gray-400">
                {userData.displayName ? userData.displayName.charAt(0).toUpperCase() : '?'}
              </span>
            </div>
          )}
          
          <Link
            to="/mypage/edit"
            className="absolute bottom-0 right-0 bg-primary-600 text-white p-2 rounded-full hover:bg-primary-700 dark:bg-primary-700 dark:hover:bg-primary-800"
            title="프로필 수정"
          >
            <FaPen size={12} />
          </Link>
        </div>
        
        {/* 사용자 정보 */}
        <div className="text-center md:text-left flex-1">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {userData.displayName || '이름 없음'}
          </h2>
          
          <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-3 text-sm text-gray-600 dark:text-gray-400 mb-4">
            <div className="flex items-center">
              <FaEnvelope className="mr-2" />
              {userData.email}
            </div>
            <div className="flex items-center">
              <FaCalendarAlt className="mr-2" />
              가입일: {createdAtDate}
            </div>
          </div>
          
          {/* 자기 소개 */}
          <div className="max-w-lg">
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
              {userData.bio || '자기소개가 없습니다. 프로필을 수정하여 자기소개를 추가해보세요.'}
            </p>
          </div>
        </div>
      </div>
      
      {/* 통계 카드 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
        <Link to="/mypage/idols" className="group bg-white dark:bg-dark-600 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-dark-700 hover:border-primary-500 dark:hover:border-primary-500 transition-colors">
          <div className="flex items-center">
            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center text-red-600 dark:text-red-400 mr-4">
              <FaHeart size={20} />
            </div>
            <div>
              <p className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                {userStats.idols}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                팔로우한 아이돌
              </p>
            </div>
          </div>
        </Link>
        
        <Link to="/mypage/posts" className="group bg-white dark:bg-dark-600 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-dark-700 hover:border-primary-500 dark:hover:border-primary-500 transition-colors">
          <div className="flex items-center">
            <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-400 mr-4">
              <FaNewspaper size={20} />
            </div>
            <div>
              <p className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                {userStats.posts}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                내 게시글
              </p>
            </div>
          </div>
        </Link>
        
        <Link to="/mypage/photos" className="group bg-white dark:bg-dark-600 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-dark-700 hover:border-primary-500 dark:hover:border-primary-500 transition-colors">
          <div className="flex items-center">
            <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center text-purple-600 dark:text-purple-400 mr-4">
              <FaImage size={20} />
            </div>
            <div>
              <p className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                {userStats.photos}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                내 사진
              </p>
            </div>
          </div>
        </Link>
        
        <Link to="/mypage/videos" className="group bg-white dark:bg-dark-600 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-dark-700 hover:border-primary-500 dark:hover:border-primary-500 transition-colors">
          <div className="flex items-center">
            <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center text-green-600 dark:text-green-400 mr-4">
              <FaVideo size={20} />
            </div>
            <div>
              <p className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                {userStats.videos}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                내 비디오
              </p>
            </div>
          </div>
        </Link>
      </div>
      
      {/* 최근 활동 (추가 개발 예정) */}
      <div className="mt-8">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          최근 활동
        </h3>
        <div className="bg-gray-50 dark:bg-dark-800 rounded-lg p-6 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            최근 활동 내역이 곧 이곳에 표시됩니다.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Profile;