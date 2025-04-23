import React, { useState } from 'react';
import { FaEdit, FaTrash, FaExternalLinkAlt, FaInstagram, FaTwitter, FaYoutube } from 'react-icons/fa';
import { useModal } from '../../hooks/useModal';

const IdolList = ({ idols, isLoading, onEdit, onDelete }) => {
  const { showModal } = useModal();
  const [expandedIdol, setExpandedIdol] = useState(null);
  
  // 로딩 UI
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, index) => (
          <div key={index} className="border rounded-lg p-4 animate-pulse">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gray-200 dark:bg-gray-600 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-1/3"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }
  
  // 비어있는 경우
  if (idols.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 dark:text-gray-400 mb-2">등록된 아이돌이 없습니다.</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">왼쪽 폼에서 새 아이돌을 추가해보세요.</p>
      </div>
    );
  }
  
  // 삭제 확인 다이얼로그
  const confirmDelete = (idol) => {
    showModal({
      title: '아이돌 삭제',
      message: `정말 "${idol.name}"을(를) 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`,
      confirmText: '삭제',
      cancelText: '취소',
      confirmVariant: 'danger',
      onConfirm: () => {
        if (onDelete) onDelete(idol.id);
      }
    });
  };
  
  // 상세 정보 토글
  const toggleExpand = (idolId) => {
    setExpandedIdol(expandedIdol === idolId ? null : idolId);
  };
  
  return (
    <div className="space-y-4">
      {idols.map(idol => (
        <div key={idol.id} className="border border-gray-200 dark:border-dark-600 rounded-lg overflow-hidden">
          {/* 기본 정보 카드 */}
          <div className="flex p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-dark-600" onClick={() => toggleExpand(idol.id)}>
            <div className="flex-shrink-0 mr-4">
              {idol.photoURL ? (
                <img 
                  src={idol.photoURL} 
                  alt={idol.name} 
                  className="w-16 h-16 rounded-full object-cover"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                  <span className="text-lg font-semibold text-gray-500 dark:text-gray-400">
                    {idol.name.charAt(0)}
                  </span>
                </div>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                    {idol.name} {idol.engName && <span className="text-sm text-gray-500">({idol.engName})</span>}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {idol.group}
                  </p>
                </div>
                
                {/* 수정/삭제 버튼 */}
                <div className="flex space-x-2" onClick={e => e.stopPropagation()}>
                  <button
                    type="button"
                    onClick={() => onEdit && onEdit(idol)}
                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                    title="수정"
                  >
                    <FaEdit size={18} />
                  </button>
                  <button
                    type="button"
                    onClick={() => confirmDelete(idol)}
                    className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                    title="삭제"
                  >
                    <FaTrash size={18} />
                  </button>
                </div>
              </div>
              
              <div className="mt-1 flex items-center text-xs text-gray-500 dark:text-gray-400">
                <span className="mr-3">{idol.position || '포지션 정보 없음'}</span>
                {idol.debutYear && <span>데뷔: {idol.debutYear}년</span>}
              </div>
            </div>
          </div>
          
          {/* 상세 정보 영역 (접었다 펼치기) */}
          {expandedIdol === idol.id && (
            <div className="p-4 bg-gray-50 dark:bg-dark-800 border-t border-gray-200 dark:border-dark-600">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">소속사</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{idol.company || '정보 없음'}</p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">생년월일</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {idol.birthdate || '정보 없음'}
                  </p>
                </div>
              </div>
              
              {idol.bio && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">소개</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-line">
                    {idol.bio}
                  </p>
                </div>
              )}
              
              {/* 소셜 미디어 링크 */}
              {idol.socialLinks && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">소셜 미디어</h4>
                  <div className="flex space-x-2">
                    {idol.socialLinks.instagram && (
                      <a 
                        href={idol.socialLinks.instagram} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-pink-600 hover:text-pink-700 dark:text-pink-400 dark:hover:text-pink-300"
                        title="인스타그램"
                      >
                        <FaInstagram size={20} />
                      </a>
                    )}
                    {idol.socialLinks.twitter && (
                      <a 
                        href={idol.socialLinks.twitter} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
                        title="트위터"
                      >
                        <FaTwitter size={20} />
                      </a>
                    )}
                    {idol.socialLinks.youtube && (
                      <a 
                        href={idol.socialLinks.youtube} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                        title="유튜브"
                      >
                        <FaYoutube size={20} />
                      </a>
                    )}
                  </div>
                </div>
              )}
              
              {/* 아이돌 상세 페이지 링크 */}
              <div className="mt-4 text-right">
                <a 
                  href={`/idols/${idol.id}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  <span>상세 페이지 보기</span>
                  <FaExternalLinkAlt size={12} className="ml-1" />
                </a>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default IdolList;