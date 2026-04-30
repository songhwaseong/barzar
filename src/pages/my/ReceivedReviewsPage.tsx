import React, { useState } from 'react';
import { reviewStore } from '../../data/reviewStore';
import styles from './MySubPage.module.css';

interface Props { onBack: () => void; }

const ReceivedReviewsPage: React.FC<Props> = ({ onBack }) => {
  // reviewStore 변경 감지를 위한 forceUpdate
  const [, forceUpdate] = useState(0);
  const reviews = reviewStore;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <button className={styles.back} onClick={onBack}>
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
        </button>
        <span className={styles.title}>받은 후기</span>
        <div style={{width:32}}/>
      </div>
      <div className={styles.list}>
        {reviews.length === 0 ? (
          <div className={styles.empty}>
            <p style={{fontSize:40}}>⭐</p>
            <p className={styles.emptyText}>아직 받은 후기가 없어요</p>
          </div>
        ) : reviews.map(r => (
          <div key={r.id} className={styles.reviewItem}>
            <div className={styles.reviewHeader}>
              <span className={styles.reviewUser}>{r.user}</span>
              <span className={styles.reviewDate}>{r.date}</span>
            </div>
            <div className={styles.stars}>{'⭐'.repeat(r.stars)}</div>
            <p className={styles.reviewText}>{r.text}</p>
            <p className={styles.reviewProduct}>📦 {r.product}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReceivedReviewsPage;
