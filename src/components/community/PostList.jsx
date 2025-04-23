import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaPlus, FaSearch, FaSort, FaSortUp, FaSortDown, FaFilter } from 'react-icons/fa';
import { useAuth } from '../../hooks/useAuth';
import { useLoading } from '../../hooks/useLoading';
import { useToast } from '../../hooks/useToast';
import PostCard from './PostCard';
import Loading from '../common/Loading';
import { getPosts, searchPosts } from '../../services/postService';
import { POST_CATEGORIES } from '../../utils/constants';

const PostList = ({ category = null }) => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { startLoading, stopLoading } = useLoading();
  const { showToast } = useToast();

  const [posts, setPosts] = useState([]);
  const [lastDoc, setLastDoc] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState('desc');
  const [selectedCategory, setSelectedCategory] = useState(category || '');
  const [showFilters, setShowFilters] = useState(false);

  // 게시물 불러오기
  const fetchPosts = async (reset = false) => {
    try {
      setLoading(true);
      
      // 새로운 조회인 경우 상태 초기화
      if (reset) {
        setPosts([]);
        setLastDoc(null);
      }
      
      // 검색 여부에 따라 API 호출
      const response = searchTerm
        ? await searchPosts(searchTerm, reset ? null : lastDoc)
        : await getPosts(reset ? null : lastDoc, 10, selectedCategory);
      
      if (response.success) {
        // 정렬 적용
        const sortedPosts = sortPosts(
          reset ? response.posts : [...posts, ...response.posts],
          sortOption,
          sortDirection
        );
        
        setPosts(sortedPosts);
        setLastDoc(response.lastVisible);
        setHasMore(response.hasMore);
      } else {
        showToast('게시물을 불러오는 중 오류가 발생했습니다.', 'error');
      }
    } catch (error) {
      console.error('게시물 조회 오류:', error);
      showToast('게시물을 불러오는 중 오류가 발생했습니다.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // 초기 로딩
  useEffect(() => {
    fetchPosts(true);
  }, [selectedCategory]);

  // 검색 처리
  const handleSearch = (e) => {
    e.preventDefault();
    fetchPosts(true);
  };

  // 더 불러오기
  const loadMore = () => {
    if (!loading && hasMore) {
      fetchPosts();
    }
  };

  // 새 게시물 작성 페이지로 이동
  const handleNewPost = () => {
    if (!currentUser) {
      showToast('로그인 후 게시물을 작성할 수 있습니다.', 'info');
      navigate('/login', { state: { from: '/community' } });
      return;
    }
    
    navigate('/community/write');
  };

  // 정렬 변경
  const handleSort = (option) => {
    if (sortOption === option) {
      // 같은 옵션 클릭 시 방향 전환
      const newDirection = sortDirection === 'desc' ? 'asc' : 'desc';
      setSortDirection(newDirection);
      
      // 정렬 적용
      const sortedPosts = sortPosts([...posts], option, newDirection);
      setPosts(sortedPosts);
    } else {
      // 새 옵션 선택
      setSortOption(option);
      
      // 정렬 적용
      const sortedPosts = sortPosts([...posts], option, sortDirection);
      setPosts(sortedPosts);
    }
  };

  // 게시물 정렬 함수
  const sortPosts = (postsToSort, option, direction) => {
    return [...postsToSort].sort((a, b) => {
      let valueA, valueB;
      
      // 날짜 필드 처리
      if (option === 'createdAt') {
        valueA = a.createdAt?.toDate?.() || new Date(a.createdAt);
        valueB = b.createdAt?.toDate?.() || new Date(b.createdAt);
      } else {
        valueA = a[option] || 0;
        valueB = b[option] || 0;
      }
      
      // 정렬 방향에 따라 비교
      if (direction === 'desc') {
        return valueB - valueA;
      } else {
        return valueA - valueB;
      }
    });
  };

  // 카테고리 필터 변경
  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
  };

  // 정렬 아이콘 표시
  const getSortIcon = (option) => {
    if (sortOption !== option) {
      return <FaSort className="ml-1" />;
    }
    
    return sortDirection === 'desc' 
      ? <FaSortDown className="ml-1 text-primary-600 dark:text-primary-400" /> 
      : <FaSortUp className="ml-1 text-primary-600 dark:text-primary-400" />;
  };

  return (
    <div className="w-full">
      {/* 상단 컨트롤 영역 */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* 제목 영역 */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {selectedCategory 
              ? POST_CATEGORIES.find(c => c.id === selectedCategory)?.name || '게시판'
              : '전체 게시판'}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
            {posts.length}개의 게시물
          </p>
        </div>
        
        {/* 버튼 영역 */}
        <div className="flex items-center gap-2 self-end">
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className="btn btn-outline btn-sm flex items-center"
          >
            <FaFilter className="mr-1" />
            필터
          </button>
          
          <button
            type="button"
            onClick={handleNewPost}
            className="btn btn-primary btn-sm flex items-center"
          >
            <FaPlus className="mr-1" />
            글쓰기
          </button>
        </div>
      </div>
      
      {/* 필터 및 검색 영역 */}
      <div className={`bg-gray-50 dark:bg-dark-800 p-4 rounded-lg mb-6 transition-all ${showFilters ? 'block' : 'hidden'}`}>
        <div className="flex flex-col md:flex-row gap-4">
          {/* 카테고리 필터 */}
          <div className="w-full md:w-1/3">
            <label htmlFor="category-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              카테고리
            </label>
            <select
              id="category-filter"
              value={selectedCategory}
              onChange={handleCategoryChange}
              className="form-select"
            >
              <option value="">전체</option>
              {POST_CATEGORIES.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          
          {/* 검색 */}
          <div className="w-full md:w-2/3">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              검색
            </label>
            <form onSubmit={handleSearch} className="flex">
              <input
                type="text"
                id="search"
                placeholder="제목, 내용, 작성자 검색"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-input rounded-r-none"
              />
              <button type="submit" className="btn btn-primary rounded-l-none px-4">
                <FaSearch />
              </button>
            </form>
          </div>
        </div>
      </div>
      
      {/* 정렬 옵션 */}
      <div className="mb-4 border-b border-gray-200 dark:border-dark-600 pb-2">
        <div className="flex space-x-4 text-sm">
          <button
            onClick={() => handleSort('createdAt')}
            className={`flex items-center ${
              sortOption === 'createdAt' ? 'text-primary-600 dark:text-primary-400 font-semibold' : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            최신순
            {getSortIcon('createdAt')}
          </button>
          <button
            onClick={() => handleSort('viewCount')}
            className={`flex items-center ${
              sortOption === 'viewCount' ? 'text-primary-600 dark:text-primary-400 font-semibold' : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            조회순
            {getSortIcon('viewCount')}
          </button>
          <button
            onClick={() => handleSort('likeCount')}
            className={`flex items-center ${
              sortOption === 'likeCount' ? 'text-primary-600 dark:text-primary-400 font-semibold' : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            인기순
            {getSortIcon('likeCount')}
          </button>
          <button
            onClick={() => handleSort('commentCount')}
            className={`flex items-center ${
              sortOption === 'commentCount' ? 'text-primary-600 dark:text-primary-400 font-semibold' : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            댓글순
            {getSortIcon('commentCount')}
          </button>
        </div>
      </div>
      
      {/* 게시물 목록 */}
      {loading && posts.length === 0 ? (
        <Loading size="medium" message="게시물을 불러오는 중..." />
      ) : posts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400 mb-4">게시물이 없습니다.</p>
          <button
            onClick={handleNewPost}
            className="btn btn-primary"
          >
            첫 게시물을 작성해보세요!
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
          
          {/* 더 불러오기 버튼 */}
          {hasMore && (
            <div className="text-center mt-6">
              <button
                onClick={loadMore}
                disabled={loading}
                className="btn btn-outline"
              >
                {loading ? '로딩 중...' : '더 보기'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PostList;