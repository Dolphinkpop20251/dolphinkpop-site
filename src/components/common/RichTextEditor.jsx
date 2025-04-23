import React, { useState, useEffect } from 'react';
import { 
  FaBold, FaItalic, FaUnderline, FaStrikethrough, 
  FaListUl, FaListOl, FaQuoteRight, FaLink, FaImage,
  FaAlignLeft, FaAlignCenter, FaAlignRight 
} from 'react-icons/fa';

const RichTextEditor = ({ 
  initialValue = '', 
  onChange, 
  placeholder = '내용을 입력하세요',
  minHeight = '200px'
}) => {
  const [value, setValue] = useState(initialValue);
  
  useEffect(() => {
    // 외부에서 에디터 값을 변경한 경우
    if (initialValue !== value) {
      setValue(initialValue);
    }
  }, [initialValue]);

  // 초기 값 설정
  useEffect(() => {
    if (initialValue) {
      setValue(initialValue);
    }
  }, []);

  // 에디터 명령 실행 함수
  const execCommand = (command, value = null) => {
    document.execCommand(command, false, value);
  };
  
  // 버튼 핸들러
  const handleBold = () => execCommand('bold');
  const handleItalic = () => execCommand('italic');
  const handleUnderline = () => execCommand('underline');
  const handleStrikethrough = () => execCommand('strikeThrough');
  const handleOrderedList = () => execCommand('insertOrderedList');
  const handleUnorderedList = () => execCommand('insertUnorderedList');
  const handleBlockquote = () => execCommand('formatBlock', '<blockquote>');
  
  // 정렬 명령
  const handleAlignLeft = () => execCommand('justifyLeft');
  const handleAlignCenter = () => execCommand('justifyCenter');
  const handleAlignRight = () => execCommand('justifyRight');
  
  // 링크 삽입
  const handleInsertLink = () => {
    const url = prompt('링크 URL을 입력하세요:', 'https://');
    if (url) {
      execCommand('createLink', url);
    }
  };
  
  // 이미지 삽입
  const handleInsertImage = () => {
    const url = prompt('이미지 URL을 입력하세요:', 'https://');
    if (url) {
      execCommand('insertImage', url);
    }
  };
  
  // 컨텐츠 변경 핸들러
  const handleContentChange = (e) => {
    const content = e.target.innerHTML;
    setValue(content);
    
    if (onChange) {
      onChange(content);
    }
  };

  return (
    <div className="border border-gray-300 dark:border-gray-700 rounded-md overflow-hidden">
      {/* 툴바 */}
      <div className="bg-gray-100 dark:bg-gray-800 p-2 border-b border-gray-300 dark:border-gray-700 flex flex-wrap gap-1">
        <button
          type="button"
          onClick={handleBold}
          className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
          title="굵게"
        >
          <FaBold />
        </button>
        <button
          type="button"
          onClick={handleItalic}
          className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
          title="기울임"
        >
          <FaItalic />
        </button>
        <button
          type="button"
          onClick={handleUnderline}
          className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
          title="밑줄"
        >
          <FaUnderline />
        </button>
        <button
          type="button"
          onClick={handleStrikethrough}
          className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
          title="취소선"
        >
          <FaStrikethrough />
        </button>
        
        <div className="border-l border-gray-300 dark:border-gray-600 mx-1"></div>
        
        <button
          type="button"
          onClick={handleOrderedList}
          className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
          title="번호 목록"
        >
          <FaListOl />
        </button>
        <button
          type="button"
          onClick={handleUnorderedList}
          className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
          title="글머리 기호 목록"
        >
          <FaListUl />
        </button>
        <button
          type="button"
          onClick={handleBlockquote}
          className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
          title="인용구"
        >
          <FaQuoteRight />
        </button>
        
        <div className="border-l border-gray-300 dark:border-gray-600 mx-1"></div>
        
        <button
          type="button"
          onClick={handleAlignLeft}
          className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
          title="왼쪽 정렬"
        >
          <FaAlignLeft />
        </button>
        <button
          type="button"
          onClick={handleAlignCenter}
          className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
          title="가운데 정렬"
        >
          <FaAlignCenter />
        </button>
        <button
          type="button"
          onClick={handleAlignRight}
          className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
          title="오른쪽 정렬"
        >
          <FaAlignRight />
        </button>
        
        <div className="border-l border-gray-300 dark:border-gray-600 mx-1"></div>
        
        <button
          type="button"
          onClick={handleInsertLink}
          className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
          title="링크 삽입"
        >
          <FaLink />
        </button>
        <button
          type="button"
          onClick={handleInsertImage}
          className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
          title="이미지 삽입"
        >
          <FaImage />
        </button>
      </div>
      
      {/* 에디터 영역 */}
      <div
        contentEditable
        dangerouslySetInnerHTML={{ __html: value }}
        onInput={handleContentChange}
        className="p-3 focus:outline-none bg-white dark:bg-dark-800 text-gray-800 dark:text-gray-200 overflow-auto"
        style={{ minHeight }}
        placeholder={placeholder}
      />
    </div>
  );
};

export default RichTextEditor;