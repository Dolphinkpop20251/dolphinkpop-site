import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { useLoading } from '../../hooks/useLoading';
import IdolForm from '../../components/admin/IdolForm';
import IdolList from '../../components/admin/IdolList';
import { getAllIdols, deleteIdol } from '../../services/idolService';
import { FaSearch } from 'react-icons/fa';

const IdolManagementPage = () => {
  const { isAdmin } = useAuth();
  const { showToast } = useToast();
  const { startLoading, stopLoading } = useLoading();
  
  const [idols, setIdols] = useState([]);
  const [filteredIdols, setFilteredIdols] = useState([]);
  const [selectedIdol, setSelectedIdol] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  // 아이돌 목록 로드
  const loadIdols = async () => {
    try {
      startLoading();
      const result = await getAllIdols();
      
      if (result.success) {
        setIdols(result.idols);
        setFilteredIdols(result.idols);
        setIsDataLoaded(true);
      } else {
        showToast('아이돌 목록을 불러오는데 실패했습니다.', 'error');
      }
    } catch (error) {
      console.error('아이돌 목록 로드 오류:', error);
      showToast('아이돌 목록을 불러오는 중 오류가 발생했습니다.', 'error');
    } finally {
      stopLoading();
    }
  };
  
  // 초기 데이터 로드
  useEffect(() => {
    loadIdols();
  }, []);

  // 검색어 필터링
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredIdols(idols);
      return;
    }
    
    const filtered = idols.filter(idol => 
      idol.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      idol.engName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      idol.group?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    setFilteredIdols(filtered);
  }, [searchTerm, idols]);

  // 아이돌 선택 핸들러
  const handleEditIdol = (idol) => {
    setSelectedIdol(idol);
    // 폼이 있는 영역으로 스크롤
    const formElement = document.getElementById('idol-form');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // 아이돌 삭제 핸들러
  const handleDeleteIdol = async (idolId) => {
    try {
      startLoading();
      const result = await deleteIdol(idolId);
      
      if (result.success) {
        showToast('아이돌이 삭제되었습니다.', 'success');
        // 현재 선택된 아이돌이 삭제된 경우 선택 해제
        if (selectedIdol && selectedIdol.id === idolId) {
          setSelectedIdol(null);
        }
        // 목록 새로고침
        await loadIdols();
      } else {
        showToast(result.error || '아이돌 삭제에 실패했습니다.', 'error');
      }
    } catch (error) {
      console.error('아이돌 삭제 오류:', error);
      showToast('아이돌 삭제 중 오류가 발생했습니다.', 'error');
    } finally {
      stopLoading();
    }
  };

  // 폼 성공 핸들러
  const handleFormSuccess = () => {
    setSelectedIdol(null);
    loadIdols();
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">아이돌 관리</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 왼쪽: 아이돌 폼 */}
        <div className="lg:col-span-1">
          <div id="idol-form" className="bg-white dark:bg-dark-700 rounded-lg shadow-md p-6 sticky top-4">
            <h3 className="text-xl font-semibold mb-4">
              {selectedIdol ? '아이돌 수정' : '새 아이돌 추가'}
            </h3>
            <IdolForm 
              initialData={selectedIdol}
              onSuccess={handleFormSuccess}
              onCancel={() => setSelectedIdol(null)}
            />
          </div>
        </div>
        
        {/* 오른쪽: 아이돌 목록 */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-dark-700 rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">아이돌 목록</h3>
              
              {/* 검색 */}
              <div className="relative w-64">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaSearch className="text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="아이돌 또는 그룹 검색"
                  className="form-input pl-10 py-2 w-full"
                />
              </div>
            </div>
            
            <IdolList 
              idols={filteredIdols}
              isLoading={!isDataLoaded}
              onEdit={handleEditIdol}
              onDelete={handleDeleteIdol}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default IdolManagementPage;