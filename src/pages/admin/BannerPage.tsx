import React, { useState } from 'react';
import s from './admin.module.css';

interface Banner {
  id: number;
  title: string;
  linkUrl: string;
  position: '메인 상단' | '메인 중간' | '팝업';
  status: '게시중' | '숨김';
  order: number;
  startDate: string;
  endDate: string;
}

interface CategoryItem {
  id: number;
  name: string;
  icon: string;
  order: number;
  visible: boolean;
}

const INITIAL_BANNERS: Banner[] = [
  { id: 1, title: '봄맞이 경매 수수료 50% 할인 이벤트', linkUrl: '/auction', position: '메인 상단', status: '게시중', order: 1, startDate: '2026.04.25', endDate: '2026.05.10' },
  { id: 2, title: '황금연휴 특가 중고거래 기획전',       linkUrl: '/popular', position: '메인 상단', status: '게시중', order: 2, startDate: '2026.04.30', endDate: '2026.05.05' },
  { id: 3, title: '명품 정품 인증 서비스 오픈',           linkUrl: '/guide',   position: '메인 중간', status: '게시중', order: 1, startDate: '2026.04.20', endDate: '2026.05.31' },
  { id: 4, title: '앱 업데이트 안내 팝업',                linkUrl: '/notice',  position: '팝업',     status: '숨김',   order: 1, startDate: '2026.05.01', endDate: '2026.05.07' },
];

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
  const [tab, setTab] = useState<'banner' | 'category'>('banner');
  const [banners, setBanners] = useState<Banner[]>(INITIAL_BANNERS);
  const [categories, setCategories] = useState<CategoryItem[]>(INITIAL_CATEGORIES);
  const [editBanner, setEditBanner] = useState<Banner | null>(null);
  const [isNewBanner, setIsNewBanner] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Banner>>({});
  const [deleteTarget, setDeleteTarget] = useState<Banner | null>(null);

  const positionColor: Record<Banner['position'], string> = {
    '메인 상단': '#1565C0',
    '메인 중간': '#2E7D32',
    '팝업':     '#6A3DA8',
  };
  const positionBg: Record<Banner['position'], string> = {
    '메인 상단': '#E3F0FF',
    '메인 중간': '#EAF7EC',
    '팝업':     '#F3EEFF',
  };

  const openNewBanner = () => {
    setEditForm({ title: '', linkUrl: '', position: '메인 상단', status: '게시중', order: 1, startDate: '2026.05.01', endDate: '2026.05.31' });
    setEditBanner(null);
    setIsNewBanner(true);
  };

  const openEditBanner = (b: Banner) => {
    setEditForm({ ...b });
    setEditBanner(b);
    setIsNewBanner(true);
  };

  const saveBanner = () => {
    if (!editForm.title?.trim()) return;
    if (editBanner) {
      setBanners(prev => prev.map(b => b.id === editBanner.id ? { ...b, ...editForm } as Banner : b));
    } else {
      const newId = Math.max(...banners.map(b => b.id)) + 1;
      setBanners(prev => [...prev, { id: newId, title: editForm.title!, linkUrl: editForm.linkUrl ?? '', position: editForm.position ?? '메인 상단', status: editForm.status ?? '게시중', order: editForm.order ?? 1, startDate: editForm.startDate ?? '', endDate: editForm.endDate ?? '' }]);
    }
    setIsNewBanner(false);
    setEditBanner(null);
  };

  const toggleBannerStatus = (id: number) => {
    setBanners(prev => prev.map(b => b.id === id ? { ...b, status: b.status === '게시중' ? '숨김' : '게시중' } : b));
  };

  const moveCategoryOrder = (id: number, dir: 'up' | 'down') => {
    setCategories(prev => {
      const sorted = [...prev].sort((a, b) => a.order - b.order);
      const idx = sorted.findIndex(c => c.id === id);
      if (dir === 'up' && idx === 0) return prev;
      if (dir === 'down' && idx === sorted.length - 1) return prev;
      const swapIdx = dir === 'up' ? idx - 1 : idx + 1;
      const newArr = [...sorted];
      [newArr[idx].order, newArr[swapIdx].order] = [newArr[swapIdx].order, newArr[idx].order];
      return newArr;
    });
  };

  const toggleCategoryVisible = (id: number) => {
    setCategories(prev => prev.map(c => c.id === id ? { ...c, visible: !c.visible } : c));
  };

  const sortedCategories = [...categories].sort((a, b) => a.order - b.order);

  return (
    <div className={s.page}>
      <div className={s.header}>
        <div className={s.title}>카테고리 / 배너 관리</div>
        <div className={s.subtitle}>메인 배너 및 카테고리 노출을 관리합니다.</div>
      </div>

      {/* 탭 */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 16, borderBottom: '2px solid #E8E8EF', paddingBottom: 0 }}>
        {(['banner', 'category'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ padding: '10px 20px', fontWeight: tab === t ? 700 : 500, fontSize: 14, color: tab === t ? '#E24B4A' : '#8B8FA8', background: 'none', border: 'none', borderBottom: tab === t ? '2px solid #E24B4A' : '2px solid transparent', cursor: 'pointer', fontFamily: 'Noto Sans KR, sans-serif', marginBottom: -2 }}>
            {t === 'banner' ? '🖼️ 배너 관리' : '📂 카테고리 관리'}
          </button>
        ))}
      </div>

      {/* 배너 탭 */}
      {tab === 'banner' && (
        <>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
            <button className={s.actionBtnPrimary} style={{ padding: '8px 18px', borderRadius: 8, border: 'none', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'Noto Sans KR, sans-serif' }} onClick={openNewBanner}>+ 배너 추가</button>
          </div>
          <table className={s.table}>
            <thead>
              <tr><th>노출 위치</th><th>배너 제목</th><th>기간</th><th>순서</th><th>상태</th><th>관리</th></tr>
            </thead>
            <tbody>
              {banners.map(b => (
                <tr key={b.id}>
                  <td><span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 6, background: positionBg[b.position], color: positionColor[b.position] }}>{b.position}</span></td>
                  <td style={{ fontWeight: 600 }}>{b.title}</td>
                  <td style={{ fontSize: 12, color: '#8B8FA8' }}>{b.startDate} ~ {b.endDate}</td>
                  <td style={{ textAlign: 'center' }}>{b.order}</td>
                  <td>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 9px', borderRadius: 20, background: b.status === '게시중' ? '#EAF7EC' : '#F0F1F4', color: b.status === '게시중' ? '#2E7D32' : '#8B8FA8' }}>{b.status}</span>
                  </td>
                  <td>
                    <button className={s.actionBtn} onClick={() => openEditBanner(b)}>수정</button>
                    <button className={s.actionBtn} onClick={() => toggleBannerStatus(b.id)}>{b.status === '게시중' ? '숨김' : '게시'}</button>
                    <button className={`${s.actionBtn} ${s.actionBtnDanger}`} onClick={() => setDeleteTarget(b)}>삭제</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {/* 카테고리 탭 */}
      {tab === 'category' && (
        <table className={s.table}>
          <thead>
            <tr><th>순서</th><th>아이콘</th><th>카테고리명</th><th>노출</th><th>순서 변경</th></tr>
          </thead>
          <tbody>
            {sortedCategories.map(c => (
              <tr key={c.id}>
                <td style={{ textAlign: 'center', color: '#8B8FA8', fontWeight: 600 }}>{c.order}</td>
                <td style={{ textAlign: 'center', fontSize: 22 }}>{c.icon}</td>
                <td style={{ fontWeight: 600 }}>{c.name}</td>
                <td>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                    <input type="checkbox" checked={c.visible} onChange={() => toggleCategoryVisible(c.id)} />
                    <span style={{ fontSize: 12, color: c.visible ? '#2E7D32' : '#8B8FA8' }}>{c.visible ? '노출중' : '숨김'}</span>
                  </label>
                </td>
                <td>
                  <button className={s.actionBtn} onClick={() => moveCategoryOrder(c.id, 'up')}>▲</button>
                  <button className={s.actionBtn} onClick={() => moveCategoryOrder(c.id, 'down')}>▼</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* 배너 작성/수정 모달 */}
      {isNewBanner && (
        <div className={s.overlay} onClick={() => setIsNewBanner(false)}>
          <div className={s.modal} onClick={e => e.stopPropagation()}>
            <div className={s.modalHeader}>
              <div className={s.modalTitle}>{editBanner ? '배너 수정' : '배너 추가'}</div>
              <button className={s.modalClose} onClick={() => setIsNewBanner(false)}>✕</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#8B8FA8', display: 'block', marginBottom: 4 }}>배너 제목</label>
                <input style={{ width: '100%', padding: '9px 12px', border: '1px solid #E0E0E0', borderRadius: 8, fontSize: 13, fontFamily: 'Noto Sans KR, sans-serif', boxSizing: 'border-box' }}
                  value={editForm.title ?? ''} onChange={e => setEditForm(p => ({ ...p, title: e.target.value }))} placeholder="배너 제목을 입력하세요" />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#8B8FA8', display: 'block', marginBottom: 4 }}>링크 URL</label>
                <input style={{ width: '100%', padding: '9px 12px', border: '1px solid #E0E0E0', borderRadius: 8, fontSize: 13, fontFamily: 'Noto Sans KR, sans-serif', boxSizing: 'border-box' }}
                  value={editForm.linkUrl ?? ''} onChange={e => setEditForm(p => ({ ...p, linkUrl: e.target.value }))} placeholder="/auction, /popular 등" />
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#8B8FA8', display: 'block', marginBottom: 4 }}>노출 위치</label>
                  <select style={{ width: '100%', padding: '9px 12px', border: '1px solid #E0E0E0', borderRadius: 8, fontSize: 13, fontFamily: 'Noto Sans KR, sans-serif' }}
                    value={editForm.position} onChange={e => setEditForm(p => ({ ...p, position: e.target.value as Banner['position'] }))}>
                    {(['메인 상단', '메인 중간', '팝업'] as Banner['position'][]).map(v => <option key={v}>{v}</option>)}
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#8B8FA8', display: 'block', marginBottom: 4 }}>상태</label>
                  <select style={{ width: '100%', padding: '9px 12px', border: '1px solid #E0E0E0', borderRadius: 8, fontSize: 13, fontFamily: 'Noto Sans KR, sans-serif' }}
                    value={editForm.status} onChange={e => setEditForm(p => ({ ...p, status: e.target.value as Banner['status'] }))}>
                    {(['게시중', '숨김'] as Banner['status'][]).map(v => <option key={v}>{v}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#8B8FA8', display: 'block', marginBottom: 4 }}>시작일</label>
                  <input style={{ width: '100%', padding: '9px 12px', border: '1px solid #E0E0E0', borderRadius: 8, fontSize: 13, fontFamily: 'Noto Sans KR, sans-serif', boxSizing: 'border-box' }}
                    value={editForm.startDate ?? ''} onChange={e => setEditForm(p => ({ ...p, startDate: e.target.value }))} placeholder="2026.05.01" />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#8B8FA8', display: 'block', marginBottom: 4 }}>종료일</label>
                  <input style={{ width: '100%', padding: '9px 12px', border: '1px solid #E0E0E0', borderRadius: 8, fontSize: 13, fontFamily: 'Noto Sans KR, sans-serif', boxSizing: 'border-box' }}
                    value={editForm.endDate ?? ''} onChange={e => setEditForm(p => ({ ...p, endDate: e.target.value }))} placeholder="2026.05.31" />
                </div>
              </div>
            </div>
            <div className={s.modalActions}>
              <button className={s.actionBtn} onClick={() => setIsNewBanner(false)}>취소</button>
              <button className={s.actionBtnPrimary} style={{ padding: '8px 20px', borderRadius: 8, border: 'none', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'Noto Sans KR, sans-serif' }} onClick={saveBanner}>저장</button>
            </div>
          </div>
        </div>
      )}

      {/* 삭제 확인 */}
      {deleteTarget && (
        <div className={s.overlay} onClick={() => setDeleteTarget(null)}>
          <div className={s.modal} style={{ maxWidth: 360, textAlign: 'center' }} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>🗑️</div>
            <div className={s.modalTitle} style={{ marginBottom: 8 }}>배너를 삭제하시겠어요?</div>
            <div style={{ fontSize: 13, color: '#8B8FA8', marginBottom: 20 }}>'{deleteTarget.title}'<br />삭제된 배너는 복구할 수 없습니다.</div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className={s.actionBtn} style={{ flex: 1, padding: 12, borderRadius: 10, fontSize: 14 }} onClick={() => setDeleteTarget(null)}>취소</button>
              <button style={{ flex: 1, padding: 12, borderRadius: 10, fontSize: 14, fontWeight: 700, background: '#E24B4A', color: '#fff', border: 'none', cursor: 'pointer', fontFamily: 'Noto Sans KR, sans-serif' }} onClick={() => { setBanners(prev => prev.filter(b => b.id !== deleteTarget.id)); setDeleteTarget(null); }}>삭제하기</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BannerPage;
