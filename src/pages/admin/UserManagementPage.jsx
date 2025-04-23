import React, { useState, useEffect } from 'react';
import { getAllUsers, promoteToAdmin, demoteFromAdmin } from '../../services/userService';
import { useToast } from '../../hooks/useToast';
import { useLoading } from '../../hooks/useLoading';
import { useAuth } from '../../hooks/useAuth';
import { FaUserPlus, FaUserMinus, FaSearch, FaShieldAlt, FaUser } from 'react-icons/fa';

const UserManagementPage = () => {
  const { showToast } = useToast();
  const { startLoading, stopLoading } = useLoading();
  const { currentUser } = useAuth();
  
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // 사용자 목록 로드
  useEffect(() => {
    const loadUsers = async () => {
      setIsLoading(true);
      try {
        const result = await getAllUsers();
        if (result.success) {
          setUsers(result.users);
          setFilteredUsers(result.users);
        } else {
          showToast('사용자 목록을 불러오는데 실패했습니다.', 'error');
        }
      } catch (error) {
        console.error('사용자 목록 로드 오류:', error);
        showToast('사용자 목록을 불러오는 중 오류가 발생했습니다.', 'error');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadUsers();
  }, []);
  
  // 검색어 필터링
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredUsers(users);
      return;
    }
    
    const filtered = users.filter(user => 
      (user.displayName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (user.email?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    );
    
    setFilteredUsers(filtered);
  }, [searchTerm, users]);
  
  // 관리자 권한 부여
  const handlePromoteToAdmin = async (userId) => {
    // 자기 자신의 권한을 변경하려 하는 경우 방지
    if (userId === currentUser?.uid) {
      showToast('자신의 관리자 권한을 변경할 수 없습니다.', 'error');
      return;
    }
    
    startLoading();
    try {
      const result = await promoteToAdmin(userId);
      if (result.success) {
        // 사용자 목록 업데이트
        setUsers(users.map(user => 
          user.id === userId ? { ...user, role: 'admin' } : user
        ));
        setFilteredUsers(filteredUsers.map(user => 
          user.id === userId ? { ...user, role: 'admin' } : user
        ));
        
        showToast('관리자 권한이 부여되었습니다.', 'success');
      } else {
        showToast(result.error || '관리자 권한 부여에 실패했습니다.', 'error');
      }
    } catch (error) {
      console.error('관리자 권한 부여 오류:', error);
      showToast('관리자 권한 부여 중 오류가 발생했습니다.', 'error');
    } finally {
      stopLoading();
    }
  };
  
  // 관리자 권한 해제
  const handleDemoteFromAdmin = async (userId) => {
    // 자기 자신의 권한을 변경하려 하는 경우 방지
    if (userId === currentUser?.uid) {
      showToast('자신의 관리자 권한을 변경할 수 없습니다.', 'error');
      return;
    }
    
    startLoading();
    try {
      const result = await demoteFromAdmin(userId);
      if (result.success) {
        // 사용자 목록 업데이트
        setUsers(users.map(user => 
          user.id === userId ? { ...user, role: 'user' } : user
        ));
        setFilteredUsers(filteredUsers.map(user => 
          user.id === userId ? { ...user, role: 'user' } : user
        ));
        
        showToast('관리자 권한이 해제되었습니다.', 'success');
      } else {
        showToast(result.error || '관리자 권한 해제에 실패했습니다.', 'error');
      }
    } catch (error) {
      console.error('관리자 권한 해제 오류:', error);
      showToast('관리자 권한 해제 중 오류가 발생했습니다.', 'error');
    } finally {
      stopLoading();
    }
  };
  
  // 사용자 카드 렌더링
  const renderUserCard = (user) => {
    const isCurrentUser = user.id === currentUser?.uid;
    const joinDate = user.createdAt
      ? new Date(user.createdAt.seconds * 1000).toLocaleDateString()
      : '알 수 없음';
      
    return (
      <div key={user.id} className="bg-white dark:bg-dark-700 rounded-lg shadow p-4 flex flex-col">
        {/* 사용자 기본 정보 */}
        <div className="flex items-center mb-3">
          <div className="flex-shrink-0 mr-3">
            {user.photoURL ? (
              <img 
                src={user.photoURL} 
                alt={user.displayName || '사용자'} 
                className="h-12 w-12 rounded-full object-cover"
              />
            ) : (
              <div className="h-12 w-12 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                <span className="text-gray-500 dark:text-gray-400 text-lg font-semibold">
                  {user.displayName ? user.displayName.charAt(0).toUpperCase() : '?'}
                </span>
              </div>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
              {user.displayName || '(이름 없음)'}
            </h4>
            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
              {user.email}
            </p>
          </div>
          
          {/* 역할 배지 */}
          <div>
            {user.role === 'admin' ? (
              <span className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 px-2 py-1 rounded-full text-xs font-semibold flex items-center">
                <FaShieldAlt className="mr-1" />
                관리자
              </span>
            ) : (
              <span className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 px-2 py-1 rounded-full text-xs font-semibold flex items-center">
                <FaUser className="mr-1" />
                일반 사용자
              </span>
            )}
          </div>
        </div>
        
        {/* 사용자 메타 데이터 */}
        <div className="text-xs text-gray-500 dark:text-gray-400 mb-3">
          <p><span className="font-medium">ID:</span> {user.id.substring(0, 12)}...</p>
          <p><span className="font-medium">가입일:</span> {joinDate}</p>
        </div>
        
        {/* 관리자 액션 버튼 */}
        <div className="mt-auto pt-2 border-t border-gray-100 dark:border-dark-600">
          {user.role === 'admin' ? (
            <button 
              onClick={() => handleDemoteFromAdmin(user.id)}
              disabled={isCurrentUser}
              className={`w-full py-2 px-3 text-sm rounded flex items-center justify-center ${
                isCurrentUser
                  ? 'bg-gray-100 text-gray-400 dark:bg-dark-600 dark:text-gray-500 cursor-not-allowed'
                  : 'bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50'
              }`}
            >
              <FaUserMinus className="mr-1.5" />
              {isCurrentUser ? '현재 사용자' : '관리자 해제'}
            </button>
          ) : (
            <button 
              onClick={() => handlePromoteToAdmin(user.id)}
              className="w-full py-2 px-3 text-sm rounded flex items-center justify-center bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50"
            >
              <FaUserPlus className="mr-1.5" />
              관리자 지정
            </button>
          )}
        </div>
      </div>
    );
  };
  
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">사용자 관리</h2>
      
      {/* 검색 */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaSearch className="text-gray-400" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="이름 또는 이메일로 검색"
            className="form-input pl-10 py-2 w-full"
          />
        </div>
      </div>
      
      {/* 사용자 목록 */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="bg-white dark:bg-dark-700 rounded-lg shadow p-4 animate-pulse">
              <div className="flex items-center mb-3">
                <div className="w-12 h-12 bg-gray-200 dark:bg-gray-600 rounded-full mr-3"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-1/2"></div>
                </div>
              </div>
              <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-full mb-2"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-2/3 mb-3"></div>
              <div className="h-8 bg-gray-200 dark:bg-gray-600 rounded w-full mt-2"></div>
            </div>
          ))}
        </div>
      ) : filteredUsers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredUsers.map(user => renderUserCard(user))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white dark:bg-dark-700 rounded-lg shadow">
          <p className="text-gray-500 dark:text-gray-400">
            {searchTerm ? '검색 결과가 없습니다.' : '사용자가 없습니다.'}
          </p>
        </div>
      )}
    </div>
  );
};

export default UserManagementPage;