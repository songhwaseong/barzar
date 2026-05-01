import React, { useState } from 'react';
import { myProductStore, deleteMyProduct } from '../../data/myProductStore';
import type { MyProduct } from '../../data/myProductStore';
import styles from './MySubPage.module.css';
import editStyles from './MyProductsPage.module.css';
import LeaveConfirmModal from '../../components/LeaveConfirmModal';

const TABS = ['전체', '경매예정', '낙찰', '숨김'];

interface Props {
  onBack: () => void;
  onEdit: (product: MyProduct) => void;
}

const MyProductsPage: React.FC<Props> = ({ onBack, onEdit }) => {
  const [tab, setTab] = useState('전체');
  const [, forceUpdate] = useState(0);
  const [deleteTarget, setDeleteTarget] = useState<MyProduct | null>(null);

  const items = tab === '전체'
    ? myProductStore
    : myProductStore.filter(p => p.status === tab);

  const statusColor = (s: MyProduct['status']) =>
    s === '경매예정' ? styles.statusOn : s === '낙찰' ? styles.statusDone : styles.statusHidden;

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteMyProduct(deleteTarget.id);
    setDeleteTarget(null);
    forceUpdate(n => n + 1);
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <button className={styles.back} onClick={onBack}>
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
        </button>
        <span className={styles.title}>내 등록 상품</span>
        <div style={{ width: 32 }}/>
      </div>

      <div className={styles.tabs}>
        {TABS.map(t => (
          <button key={t} className={`${styles.tab} ${tab === t ? styles.tabActive : ''}`} onClick={() => setTab(t)}>{t}</button>
        ))}
      </div>

      <div className={styles.list}>
        {items.length > 0 ? items.map(p => (
          <div key={p.id} className={styles.tradeItem}>
            <img src={p.images[p.mainImageIndex] || p.images[0]} alt={p.title} className={styles.tradeImg}/>
            <div className={styles.tradeBody}>
              <p className={styles.tradeName}>{p.title}</p>
              <p className={styles.tradeMeta}>{p.location} · {p.condition} · {p.category}</p>
              <p className={styles.tradePrice}>경매시작가 ₩{p.auctionStartPrice || '—'}</p>
            </div>
            <div className={styles.tradeActions}>
              <span className={`${styles.statusBadge} ${statusColor(p.status)}`}>{p.status}</span>
              <div className={editStyles.btnRow}>
                <button className={editStyles.editBtn} onClick={() => onEdit(p)}>수정</button>
                {p.status === '경매예정' && (
                  <button className={editStyles.deleteBtn} onClick={() => setDeleteTarget(p)}>삭제</button>
                )}
              </div>
            </div>
          </div>
        )) : (
          <div className={styles.empty}>
            <p style={{ fontSize: 40 }}>📦</p>
            <p className={styles.emptyText}>등록된 상품이 없어요</p>
          </div>
        )}
      </div>

      {/* 삭제 확인 모달 */}
      {deleteTarget && (
        <LeaveConfirmModal
          message={`'${deleteTarget.title}'\n상품을 삭제하시겠어요?`}
          confirmLabel="삭제하기"
          cancelLabel="취소"
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
};

export default MyProductsPage;
