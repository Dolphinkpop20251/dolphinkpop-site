import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaSearch, FaFilter, FaStar } from 'react-icons/fa';
import IdolList from '../components/idols/IdolList';
import IdolSearch from '../components/idols/IdolSearch';
import { getIdolGroups } from '../services/idolService';
import Loading from '../components/common/Loading';

const IdolsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // URL 쿼리 파라미터 처리
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const groupParam = searchParams.get('group');
    const searchParam = searchParams.get('search');
    
    if (groupParam) {
      setSelectedGroup(groupParam);
    }
    
    if (searchParam) {
      setSearchTerm(searchParam);
    }
  }, [location.search]);
  
  // 그룹 목록 가져오기
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        setLoading(true);
        const response = await getIdolGroups();
        
        if (response.success) {
          setGroups(response.groups);
        }
      } catch (error) {
        console.error('그룹 목록 가져오기 오류:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchGroups();
  }, []);
  
  // 검색 처리
  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    
    if (searchTerm) {
      params.set('search', searchTerm);
    }
    
    if (selectedGroup) {
      params.set('group', selectedGroup);
    }
    
    navigate({ search: params.toString() });
  };
  
  // 그룹 필터 변경
  const handleGroupChange = (e) => {
    const group = e.target.value;
    setSelectedGroup(group);
    
    const params = new URLSearchParams(location.search);
    
    if (group) {
      params.set('group', group);
    } else {
      params.delete('group');
    }
    
    navigate({ search: params.toString() });
  };
  
  // 필터 초기화
  const clearFilters = () => {
    setSearchTerm('');
    setSelectedGroup('');
    navigate('/idols');
  };
  
  // 필터 적용 여부
  const hasFilters = searchTerm || selectedGroup;
  
  return (
    <div className="container-custom mx-auto px-4 py-8 mt-20">
      {/* 페이지 헤더 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          K-POP 아이돌
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          좋아하는 아이돌을 찾아보고 팔로우하세요!
        </p>
      </div>
      
      {/* 검색 및 필터 */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
          {/* 검색 폼 */}
          <div className="flex-grow">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                placeholder="아이돌 또는 그룹 이름으로 검색"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-input pr-10 w-full"
              />
              <button
                type="submit"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <FaSearch size={18} />
              </button>
            </form>
          </div>
          
          {/* 필터 버튼 */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className={`btn ${showFilters ? 'btn-primary' : 'btn-outline'} btn-sm flex items-center`}
            >
              <FaFilter className="mr-1" />
              필터
            </button>
            
            {hasFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="btn btn-outline btn-sm"
              >
                초기화
              </button>
            )}
          </div>
        </div>
        
        {/* 필터 패널 */}
        {showFilters && (
          <div className="bg-gray-50 dark:bg-dark-800 p-4 rounded-lg mb-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 그룹 필터 */}
              <div>
                <label htmlFor="group-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  그룹
                </label>
                <select
                  id="group-filter"
                  value={selectedGroup}
                  onChange={handleGroupChange}
                  className="form-select"
                >
                  <option value="">모든 그룹</option>
                  {groups.map((group) => (
                    <option key={group} value={group}>
                      {group}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* 추가 필터 (향후 확장을 위한 공간) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  정렬 방식
                </label>
                <select
                  className="form-select"
                  defaultValue="name"
                >
                  <option value="name">이름순</option>
                  <option value="followers">팔로워순</option>
                  <option value="newest">최근 추가순</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* 검색 결과가 있는 경우 */}
      {searchTerm && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            '{searchTerm}' 검색 결과
          </h2>
          <IdolSearch searchTerm={searchTerm} />
        </div>
      )}
      
      {/* 아이돌 목록 */}
      {loading ? (
        <Loading size="large" message="아이돌 정보를 불러오는 중..." />
      ) : (
        <div>
          {selectedGroup ? (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <span className="mr-2">{selectedGroup}</span>
              </h2>
              <IdolList groupFilter={selectedGroup} />
            </div>
          ) : !searchTerm && (
            <div className="space-y-12">
              {/* 인기 아이돌 섹션 */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <FaStar className="text-yellow-500 mr-2" />
                  인기 아이돌
                </h2>
                <IdolList popular={true} limit={10} />
              </div>
              
              {/* 전체 아이돌 섹션 */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  전체 아이돌
                </h2>
                <IdolList />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default IdolsPage;