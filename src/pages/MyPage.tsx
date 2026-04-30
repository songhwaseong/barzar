import React, { useState } from 'react';
import styles from './MyPage.module.css';

type MenuKey = '판매 내역'|'구매 내역'|'입찰 내역'|'관심 목록'|'내 계좌'|'받은 후기'|'내 주소 관리'|'알림 설정'|'자주 묻는 질문'|'고객센터'|'이용약관'|'배송 조회'|'이용 가이드'|'내 등록 상품';

const MENU_GROUPS: { title: string; items: { emoji: string; label: MenuKey }[] }[] = [
  {
    title: '나의 거래',
    items: [
      { emoji: '🏷️', label: '내 등록 상품' },
      { emoji: '📦', label: '판매 내역' },
      { emoji: '🛒', label: '구매 내역' },
      { emoji: '🔨', label: '입찰 내역' },
      { emoji: '❤️', label: '관심 목록' },
      { emoji: '🚚', label: '배송 조회' },
    ],
  },
  {
    title: '나의 계정',
    items: [
      { emoji: '💰', label: '내 계좌' },
      { emoji: '⭐', label: '받은 후기' },
      { emoji: '📍', label: '내 주소 관리' },
      { emoji: '🔔', label: '알림 설정' },
    ],
  },
  {
    title: '고객지원',
    items: [
      { emoji: '📖', label: '이용 가이드' },
      { emoji: '❓', label: '자주 묻는 질문' },
      { emoji: '📞', label: '고객센터' },
      { emoji: '📄', label: '이용약관' },
    ],
  },
];

interface Props {
  onLogout?: () => void;
  onMenuClick?: (menu: MenuKey) => void;
  onEditProfile?: () => void;
}

const MyPage: React.FC<Props> = ({ onLogout, onMenuClick, onEditProfile }) => {
  const [mannerTemp] = useState(36.8);

  return (
    <main className={styles.main}>
      <div className={styles.header}>
        <h1 className={styles.title}>마이페이지</h1>
      </div>

      <div className={styles.profileCard}>
        <div className={styles.avatar}>😊</div>
        <div className={styles.profileInfo}>
          <p className={styles.username}>홍길동</p>
          <p className={styles.email}>hong@bazar.kr</p>
          <div className={styles.mannerRow}>
            <span className={styles.mannerLabel}>매너온도</span>
            <span className={styles.mannerTemp}>{mannerTemp}°C</span>
            <div className={styles.mannerBar}>
              <div className={styles.mannerFill} style={{ width: `${((mannerTemp - 30) / 70) * 100}%` }}/>
            </div>
          </div>
        </div>
        <button className={styles.editBtn} onClick={onEditProfile}>수정</button>
      </div>

      <div className={styles.stats}>
        {[['12','판매'],['8','구매'],['5','입찰'],['31','관심']].map(([num,label],i,arr) => (
          <React.Fragment key={label}>
            <div className={styles.statItem}>
              <span className={styles.statNum}>{num}</span>
              <span className={styles.statLabel}>{label}</span>
            </div>
            {i < arr.length-1 && <div className={styles.divider}/>}
          </React.Fragment>
        ))}
      </div>

      {MENU_GROUPS.map((group) => (
        <div key={group.title} className={styles.menuGroup}>
          <p className={styles.groupTitle}>{group.title}</p>
          {group.items.map((item) => (
            <button key={item.label} className={styles.menuItem} onClick={() => onMenuClick?.(item.label)}>
              <span className={styles.menuEmoji}>{item.emoji}</span>
              <span className={styles.menuLabel}>{item.label}</span>
              <svg width="16" height="16" fill="none" stroke="#B4B2A9" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M9 18l6-6-6-6"/>
              </svg>
            </button>
          ))}
        </div>
      ))}

      <button className={styles.logoutBtn} onClick={onLogout}>로그아웃</button>
    </main>
  );
};

export default MyPage;
