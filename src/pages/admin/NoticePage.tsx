import React, { useState } from 'react';
import s from './admin.module.css';

interface Notice {
  id: number;
  title: string;
  category: '서비스' | '이벤트' | '점검' | '정책';
  status: '게시중' | '예약' | '숨김';
  isPinned: boolean;
  author: string;
  createdAt: string;
  content: string;
}

const INITIAL_NOTICES: Notice[] = [
  { id: 1, title: '5월 황금연휴 고객센터 운영 안내', category: '서비스', status: '게시중', isPinned: true,  author: 'admin', createdAt: '2026.04.28', content: '5월 1일~5일 황금연휴 기간 고객센터는 이메일 접수만 운영됩니다. 답변은 5월 6일(수)부터 순차 처리됩니다.' },
  { id: 2, title: '[이벤트] 봄맞이 경매 수수료 50% 할인', category: '이벤트', status: '게시중', isPinned: true,  author: 'manager', createdAt: '2026.04.25', content: '4월 25일~5월 10일까지 경매 낙찰 수수료를 50% 할인합니다. 이 기간 낙찰된 모든 경매에 자동 적용됩니다.' },
  { id: 3, title: '서버 정기점검 안내 (4/30 02:00~04:00)', category: '점검', status: '게시중', isPinned: false, author: 'admin', createdAt: '2026.04.23', content: '4월 30일 새벽 2시~4시 서버 정기점검이 진행됩니다. 해당 시간 중 서비스 이용이 불가합니다.' },
  { id: 4, title: '개인정보처리방침 개정 안내 (시행일: 5/1)', category: '정책', status: '게시중', isPinned: false, author: 'admin', createdAt: '2026.04.20', content: '개인정보처리방침이 일부 개정됩니다. 주요 변경사항은 마케팅 정보 수신 동의 항목 세분화입니다.' },
  { id: 5, title: '[예정] 6월 앱 업데이트 주요 변경사항', category: '서비스', status: '예약',  isPinned: false, author: 'manager', createdAt: '2026.04.18', content: '6월 업데이트에서는 실시간 경매 알림 기능과 판매자 등급 시스템이 도입될 예정입니다.' },
  { id: 6, title: '가품 판매 근절 정책 강화 안내',            category: '정책', status: '숨김',  isPinned: false, author: 'admin', createdAt: '2026.04.10', content: '가품 신고 1회 확인 시 즉시 30일 정지, 2회 시 영구정지로 정책이 강화됩니다.' },
];

const CATEGORIES = ['서비스', '이벤트', '점검', '정책'] as const;
type Category = typeof CATEGORIES[number];

const categoryColor: Record<Category, string> = {
  '서비스': '#1565C0',
  '이벤트': '#E65C00',
  '점검':   '#6A3DA8',
  '정책':   '#2E7D32',
};
const categoryBg: Record<Category, string> = {
  '서비스': '#E3F0FF',
  '이벤트': '#FFF3E0',
  '점검':   '#F3EEFF',
  '정책':   '#EAF7EC',
};

const statusColor: Record<Notice['status'], string> = {
  '게시중': '#2E7D32',
  '예약':   '#1565C0',
  '숨김':   '#8B8FA8',
};
const statusBg: Record<Notice['status'], string> = {
  '게시중': '#EAF7EC',
  '예약':   '#E3F0FF',
  '숨김':   '#F0F1F4',
};

const NoticePage: React.FC = () => {
  const [notices, setNotices] = useState<Notice[]>(INITIAL_NOTICES);
  const [filterStatus, setFilterStatus] = useState<string>('전체');
  const [filterCategory, setFilterCategory] = useState<string>('전체');
  const [selected, setSelected] = useState<Notice | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Notice>>({});
  const [deleteTarget, setDeleteTarget] = useState<Notice | null>(null);

  const filtered = notices.filter(n => {
    if (filterStatus !== '전체' && n.status !== filterStatus) return false;
    if (filterCategory !== '전체' && n.category !== filterCategory) return false;
    return true;
  });

  const openNew = () => {
    setEditForm({ title: '', category: '서비스', status: '게시중', isPinned: false, content: '', author: 'admin' });
    setSelected(null);
    setIsEditing(true);
  };

  const openEdit = (n: Notice) => {
    setEditForm({ ...n });
    setSelected(n);
    setIsEditing(true);
  };

  const saveNotice = () => {
    if (!editForm.title?.trim() || !editForm.content?.trim()) return;
    if (selected) {
      setNotices(prev => prev.map(n => n.id === selected.id ? { ...n, ...editForm } as Notice : n));
    } else {
      const newId = Math.max(...notices.map(n => n.id)) + 1;
      setNotices(prev => [{
        id: newId,
        title: editForm.title!,
        category: editForm.category as Category ?? '서비스',
        status: editForm.status as Notice['status'] ?? '게시중',
        isPinned: editForm.isPinned ?? false,
        author: 'admin',
        createdAt: '2026.05.01',
        content: editForm.content!,
      }, ...prev]);
    }
    setIsEditing(false);
    setSelected(null);
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    setNotices(prev => prev.filter(n => n.id !== deleteTarget.id));
    setDeleteTarget(null);
  };

  const togglePin = (id: number) => {
    setNotices(prev => prev.map(n => n.id === id ? { ...n, isPinned: !n.isPinned } : n));
  };

  return (
    <div className={s.page}>
      <div className={s.header}>
        <div className={s.title}>공지사항 관리</div>
        <div className={s.subtitle}>플랫폼 공지사항을 작성하고 관리합니다.</div>
      </div>

      {/* 필터 + 작성 버튼 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 8 }}>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {['전체', '게시중', '예약', '숨김'].map(v => (
            <button key={v} className={`${s.filterBtn} ${filterStatus === v ? s.filterActive : ''}`} onClick={() => setFilterStatus(v)}>{v}</button>
          ))}
          <div style={{ width: 1, background: '#E8E8EF', margin: '0 4px' }} />
          {['전체', ...CATEGORIES].map(v => (
            <button key={v} className={`${s.filterBtn} ${filterCategory === v ? s.filterActive : ''}`} onClick={() => setFilterCategory(v)}>{v}</button>
          ))}
        </div>
        <button className={s.actionBtnPrimary} style={{ padding: '8px 18px', borderRadius: 8, border: 'none', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'Noto Sans KR, sans-serif' }} onClick={openNew}>+ 공지 작성</button>
      </div>

      <table className={s.table}>
        <thead>
          <tr>
            <th>구분</th><th>제목</th><th>상태</th><th>작성자</th><th>등록일</th><th>관리</th>
          </tr>
        </thead>
        <tbody>
          {filtered.length === 0 ? (
            <tr><td colSpan={6} className={s.emptyText}>공지사항이 없습니다.</td></tr>
          ) : filtered.map(n => (
            <tr key={n.id}>
              <td>
                <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 6, background: categoryBg[n.category], color: categoryColor[n.category] }}>{n.category}</span>
              </td>
              <td>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  {n.isPinned && <span style={{ fontSize: 11, background: '#FDEEED', color: '#C62828', borderRadius: 4, padding: '1px 6px', fontWeight: 700 }}>고정</span>}
                  <span style={{ fontWeight: 600, cursor: 'pointer', color: '#1A1A2E' }} onClick={() => { setSelected(n); setIsEditing(false); }}>{n.title}</span>
                </span>
              </td>
              <td>
                <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 9px', borderRadius: 20, background: statusBg[n.status], color: statusColor[n.status] }}>{n.status}</span>
              </td>
              <td>{n.author}</td>
              <td>{n.createdAt}</td>
              <td>
                <button className={s.actionBtn} onClick={() => togglePin(n.id)}>{n.isPinned ? '고정해제' : '고정'}</button>
                <button className={s.actionBtn} onClick={() => openEdit(n)}>수정</button>
                <button className={`${s.actionBtn} ${s.actionBtnDanger}`} onClick={() => setDeleteTarget(n)}>삭제</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* 상세 보기 모달 */}
      {selected && !isEditing && (
        <div className={s.overlay} onClick={() => setSelected(null)}>
          <div className={s.modal} onClick={e => e.stopPropagation()}>
            <div className={s.modalHeader}>
              <div className={s.modalTitle}>{selected.title}</div>
              <button className={s.modalClose} onClick={() => setSelected(null)}>✕</button>
            </div>
            <div className={s.infoRow}><div className={s.infoLabel}>구분</div><div className={s.infoValue}>{selected.category}</div></div>
            <div className={s.infoRow}><div className={s.infoLabel}>상태</div><div className={s.infoValue}>{selected.status}</div></div>
            <div className={s.infoRow}><div className={s.infoLabel}>작성자</div><div className={s.infoValue}>{selected.author}</div></div>
            <div className={s.infoRow}><div className={s.infoLabel}>등록일</div><div className={s.infoValue}>{selected.createdAt}</div></div>
            <div className={s.divider} />
            <div style={{ fontSize: 14, lineHeight: 1.7, color: '#2A2A3A' }}>{selected.content}</div>
            <div className={s.modalActions}>
              <button className={s.actionBtn} onClick={() => openEdit(selected)}>수정하기</button>
            </div>
          </div>
        </div>
      )}

      {/* 작성/수정 모달 */}
      {isEditing && (
        <div className={s.overlay} onClick={() => setIsEditing(false)}>
          <div className={s.modal} onClick={e => e.stopPropagation()}>
            <div className={s.modalHeader}>
              <div className={s.modalTitle}>{selected ? '공지 수정' : '공지 작성'}</div>
              <button className={s.modalClose} onClick={() => setIsEditing(false)}>✕</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#8B8FA8', display: 'block', marginBottom: 4 }}>제목</label>
                <input style={{ width: '100%', padding: '9px 12px', border: '1px solid #E0E0E0', borderRadius: 8, fontSize: 13, fontFamily: 'Noto Sans KR, sans-serif', boxSizing: 'border-box' }}
                  value={editForm.title ?? ''} onChange={e => setEditForm(p => ({ ...p, title: e.target.value }))} placeholder="공지 제목을 입력하세요" />
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#8B8FA8', display: 'block', marginBottom: 4 }}>구분</label>
                  <select style={{ width: '100%', padding: '9px 12px', border: '1px solid #E0E0E0', borderRadius: 8, fontSize: 13, fontFamily: 'Noto Sans KR, sans-serif' }}
                    value={editForm.category} onChange={e => setEditForm(p => ({ ...p, category: e.target.value as Category }))}>
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#8B8FA8', display: 'block', marginBottom: 4 }}>상태</label>
                  <select style={{ width: '100%', padding: '9px 12px', border: '1px solid #E0E0E0', borderRadius: 8, fontSize: 13, fontFamily: 'Noto Sans KR, sans-serif' }}
                    value={editForm.status} onChange={e => setEditForm(p => ({ ...p, status: e.target.value as Notice['status'] }))}>
                    {(['게시중', '예약', '숨김'] as Notice['status'][]).map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input type="checkbox" id="pinCheck" checked={editForm.isPinned ?? false} onChange={e => setEditForm(p => ({ ...p, isPinned: e.target.checked }))} />
                <label htmlFor="pinCheck" style={{ fontSize: 13, cursor: 'pointer' }}>상단 고정</label>
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#8B8FA8', display: 'block', marginBottom: 4 }}>내용</label>
                <textarea className={s.textArea} rows={5} value={editForm.content ?? ''} onChange={e => setEditForm(p => ({ ...p, content: e.target.value }))} placeholder="공지 내용을 입력하세요" />
              </div>
            </div>
            <div className={s.modalActions}>
              <button className={s.actionBtn} onClick={() => setIsEditing(false)}>취소</button>
              <button className={s.actionBtnPrimary} style={{ padding: '8px 20px', borderRadius: 8, border: 'none', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'Noto Sans KR, sans-serif' }} onClick={saveNotice}>저장</button>
            </div>
          </div>
        </div>
      )}

      {/* 삭제 확인 모달 */}
      {deleteTarget && (
        <div className={s.overlay} onClick={() => setDeleteTarget(null)}>
          <div className={s.modal} style={{ maxWidth: 360, textAlign: 'center' }} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>🗑️</div>
            <div className={s.modalTitle} style={{ marginBottom: 8 }}>공지를 삭제하시겠어요?</div>
            <div style={{ fontSize: 13, color: '#8B8FA8', marginBottom: 20 }}>'{deleteTarget.title}'<br />삭제된 공지는 복구할 수 없습니다.</div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className={s.actionBtn} style={{ flex: 1, padding: 12, borderRadius: 10, fontSize: 14 }} onClick={() => setDeleteTarget(null)}>취소</button>
              <button style={{ flex: 1, padding: 12, borderRadius: 10, fontSize: 14, fontWeight: 700, background: '#E24B4A', color: '#fff', border: 'none', cursor: 'pointer', fontFamily: 'Noto Sans KR, sans-serif' }} onClick={confirmDelete}>삭제하기</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NoticePage;
