import React, { useState, useRef } from 'react';
import s from './admin.module.css';

interface CategoryItem {
  id: number;
  name: string;
  icon: string;
  order: number;
  visible: boolean;
}

const INITIAL_CATEGORIES: CategoryItem[] = [
  { id: 1,  name: '디지털/가전',   icon: '💻', order: 1,  visible: true  },
  { id: 2,  name: '패션/의류',     icon: '👕', order: 2,  visible: true  },
  { id: 3,  name: '명품',          icon: '👜', order: 3,  visible: true  },
  { id: 4,  name: '시계/주얼리',   icon: '⌚', order: 4,  visible: true  },
  { id: 5,  name: '신발',          icon: '👟', order: 5,  visible: true  },
  { id: 6,  name: '스포츠/레저',   icon: '🏋️', order: 6,  visible: true  },
  { id: 7,  name: '뷰티/미용',     icon: '💄', order: 7,  visible: true  },
  { id: 8,  name: '게임/취미',     icon: '🎮', order: 8,  visible: true  },
  { id: 9,  name: '음향/악기',     icon: '🎸', order: 9,  visible: true  },
  { id: 10, name: '한정판',        icon: '🏷️', order: 10, visible: true  },
  { id: 11, name: '이월상품',      icon: '📦', order: 11, visible: false },
];

const BannerPage: React.FC = () => {
  const [categories, setCategories] = useState<CategoryItem[]>(INITIAL_CATEGORIES);
  const [dragOverId, setDragOverId] = useState<number | null>(null);
  const dragIdRef = useRef<number | null>(null);

  const handleDragStart = (id: number) => { dragIdRef.current = id; };

  const handleDrop = (targetId: number) => {
    const fromId = dragIdRef.current;
    if (fromId == null || fromId === targetId) return;
    setCategories(prev => {
      const sorted = [...prev].sort((a, b) => a.order - b.order);
      const fromIdx  = sorted.findIndex(c => c.id === fromId);
      const toIdx    = sorted.findIndex(c => c.id === targetId);
      const reordered = [...sorted];
      const [moved] = reordered.splice(fromIdx, 1);
      reordered.splice(toIdx, 0, moved);
      return reordered.map((c, i) => ({ ...c, order: i + 1 }));
    });
    dragIdRef.current = null;
    setDragOverId(null);
  };

  const toggleCategoryVisible = (id: number) => {
    setCategories(prev => prev.map(c => c.id === id ? { ...c, visible: !c.visible } : c));
  };

  const sortedCategories = [...categories].sort((a, b) => a.order - b.order);

  return (
    <div className={s.page}>
      <div className={s.header}>
        <div className={s.title}>카테고리 관리</div>
        <div className={s.subtitle}>카테고리 노출 순서와 표시 여부를 관리합니다.</div>
      </div>

      <table className={s.table}>
        <thead>
          <tr><th>순서</th><th>아이콘</th><th>카테고리명</th><th>노출</th><th>순서 변경</th></tr>
        </thead>
        <tbody>
          {sortedCategories.map(c => (
            <tr
              key={c.id}
              draggable
              onDragStart={() => handleDragStart(c.id)}
              onDragOver={e => { e.preventDefault(); setDragOverId(c.id); }}
              onDragLeave={() => setDragOverId(null)}
              onDrop={() => handleDrop(c.id)}
              style={{
                background: dragOverId === c.id ? '#EEF4FF' : undefined,
                borderTop: dragOverId === c.id ? '2px solid #1565C0' : undefined,
                cursor: 'grab',
              }}
            >
              <td style={{ color: '#8B8FA8', fontWeight: 600 }}>{c.order}</td>
              <td style={{ fontSize: 22 }}>{c.icon}</td>
              <td style={{ fontWeight: 600 }}>{c.name}</td>
              <td>
                <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer' }}>
                  <input type="checkbox" checked={c.visible} onChange={() => toggleCategoryVisible(c.id)} />
                  <span style={{ fontSize: 12, color: c.visible ? '#2E7D32' : '#8B8FA8' }}>{c.visible ? '노출중' : '숨김'}</span>
                </label>
              </td>
              <td style={{ color: '#B0B4C8', fontSize: 16 }}>⠿</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default BannerPage;
