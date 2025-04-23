import React, { useState, useEffect } from 'react';
import { FaUsers, FaIdCard, FaImage, FaNewspaper, FaChartLine } from 'react-icons/fa';
import { getUserCount } from '../../services/userService';
import { getIdolCount } from '../../services/idolService';
import { getPostCount } from '../../services/postService';
import { getGalleryCount } from '../../services/galleryService';

const DashboardPage = () => {
  const [stats, setStats] = useState({
    userCount: 0,
    idolCount: 0,
    postCount: 0,
    galleryCount: 0,
    loading: true
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // 병렬로 각 통계 데이터 가져오기
        const [userResult, idolResult, postResult, galleryResult] = await Promise.all([
          getUserCount(),
          getIdolCount(),
          getPostCount(),
          getGalleryCount()
        ]);

        setStats({
          userCount: userResult.success ? userResult.count : 0,
          idolCount: idolResult.success ? idolResult.count : 0,
          postCount: postResult.success ? postResult.count : 0,
          galleryCount: galleryResult.success ? galleryResult.count : 0,
          loading: false
        });
      } catch (error) {
        console.error('통계 데이터 로딩 오류:', error);
        setStats(prev => ({ ...prev, loading: false }));
      }
    };

    fetchStats();
  }, []);

  const StatCard = ({ title, value, icon, color, isLoading }) => (
    <div className={`bg-white dark:bg-dark-700 rounded-lg shadow-md p-6 border-l-4 ${color}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{title}</p>
          {isLoading ? (
            <div className="h-8 w-16 bg-gray-200 dark:bg-gray-600 rounded animate-pulse"></div>
          ) : (
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{value.toLocaleString()}</p>
          )}
        </div>
        <div className={`p-3 rounded-full ${color.replace('border', 'bg')}`}>
          {icon}
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">대시보드</h2>
      
      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          title="전체 사용자" 
          value={stats.userCount} 
          icon={<FaUsers className="h-6 w-6 text-white" />} 
          color="border-blue-500 dark:border-blue-400" 
          isLoading={stats.loading} 
        />
        <StatCard 
          title="등록된 아이돌" 
          value={stats.idolCount} 
          icon={<FaIdCard className="h-6 w-6 text-white" />} 
          color="border-purple-500 dark:border-purple-400" 
          isLoading={stats.loading} 
        />
        <StatCard 
          title="게시글" 
          value={stats.postCount} 
          icon={<FaNewspaper className="h-6 w-6 text-white" />} 
          color="border-green-500 dark:border-green-400" 
          isLoading={stats.loading} 
        />
        <StatCard 
          title="갤러리 이미지" 
          value={stats.galleryCount} 
          icon={<FaImage className="h-6 w-6 text-white" />} 
          color="border-amber-500 dark:border-amber-400" 
          isLoading={stats.loading} 
        />
      </div>
      
      {/* 관리자 안내 */}
      <div className="bg-white dark:bg-dark-700 rounded-lg shadow-md p-6 mb-8">
        <h3 className="text-xl font-semibold mb-4">관리자 기능 안내</h3>
        <div className="space-y-3 text-gray-700 dark:text-gray-300">
          <p>왼쪽 메뉴를 통해 다음과 같은 관리 기능을 사용할 수 있습니다:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>사용자 관리</strong>: 계정 관리 및 관리자 권한 부여</li>
            <li><strong>아이돌 관리</strong>: 아이돌 정보 추가, 수정, 삭제</li>
            <li><strong>게시글 관리</strong>: 게시글 모니터링 및 관리</li>
            <li><strong>갤러리 관리</strong>: 이미지 관리 및 부적절한 콘텐츠 삭제</li>
          </ul>
        </div>
      </div>
      
      {/* 최근 활동 (추후 구현) */}
      <div className="bg-white dark:bg-dark-700 rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold">최근 활동</h3>
          <FaChartLine className="text-gray-400" />
        </div>
        <p className="text-gray-500 dark:text-gray-400 text-center py-4">
          최근 관리자 활동 내역이 표시됩니다.
        </p>
      </div>
    </div>
  );
};

export default DashboardPage;