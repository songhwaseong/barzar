import React, { useMemo } from 'react';
import { SANCTIONS } from '../../data/adminData';
import { MEMBERS } from '../../data/memberData';
import { PRODUCTS, AUCTION_ITEMS } from '../../data/mockData';
import styles from './DashboardPage.module.css';

interface Props {
  totalProducts: number;
}

const DashboardPage: React.FC<Props> = ({ totalProducts }) => {
  const stats = useMemo(() => {
    const activeMembers   = MEMBERS.filter(m => m.status === 'active').length;
    const suspendedMembers = MEMBERS.filter(m => m.status === 'suspended' || m.status === 'permanent').length;
    const withdrawnMembers = MEMBERS.filter(m => m.status === 'withdrawn').length;
    const totalSanctions  = SANCTIONS.length;
    const wonCount    = AUCTION_ITEMS.filter(a => !a.isLive && a.id % 3 !== 0).length;
    const failedCount = AUCTION_ITEMS.filter(a => !a.isLive && a.id % 3 === 0).length;

    return {
      totalMembers: MEMBERS.length,
      activeMembers,
      suspendedMembers,
      withdrawnMembers,
      totalSanctions,
      wonCount,
      failedCount,
      totalProducts,
      tradeProducts: PRODUCTS.length,
      auctionProducts: AUCTION_ITEMS.length,
    };
  }, [totalProducts]);

  const wonItems    = AUCTION_ITEMS.filter(a => !a.isLive && a.id % 3 !== 0).slice(0, 5);
  const failedItems = AUCTION_ITEMS.filter(a => !a.isLive && a.id % 3 === 0).slice(0, 5);

  const recentSanctions = SANCTIONS.slice().sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt)
  ).slice(0, 3);

  const sanctionTypeLabel = (type: string) => {
    if (type === 'warning')    return '경고';
    if (type === 'suspend_7')  return '7일 정지';
    if (type === 'suspend_30') return '30일 정지';
    return '영구 정지';
  };

  return (
    <div className={styles.root}>
      <div className={styles.pageTitle}>대시보드</div>
      <div className={styles.pageSubtitle}>플랫폼 현황을 한눈에 확인합니다.</div>

      {/* ─── 요약 카드 ─── */}
      <div className={styles.summaryGrid}>
        <div className={`${styles.summaryCard} ${styles.cardBlue}`}>
          <div className={styles.cardIcon}>👥</div>
          <div className={styles.cardBody}>
            <div className={styles.cardLabel}>전체 회원</div>
            <div className={styles.cardValue}>{stats.totalMembers.toLocaleString()}<span className={styles.cardUnit}>명</span></div>
            <div className={styles.cardSub}>활성 {stats.activeMembers} · 정지 {stats.suspendedMembers} · 탈퇴 {stats.withdrawnMembers}</div>
          </div>
        </div>

        <div className={`${styles.summaryCard} ${styles.cardGreen}`}>
          <div className={styles.cardIcon}>📦</div>
          <div className={styles.cardBody}>
            <div className={styles.cardLabel}>전체 상품</div>
            <div className={styles.cardValue}>{stats.totalProducts.toLocaleString()}<span className={styles.cardUnit}>건</span></div>
            <div className={styles.cardSub}>중고거래 {stats.tradeProducts} · 경매 {stats.auctionProducts}</div>
          </div>
        </div>

        <div className={`${styles.summaryCard} ${styles.cardGreen}`}>
          <div className={styles.cardIcon}>🏆</div>
          <div className={styles.cardBody}>
            <div className={styles.cardLabel}>낙찰</div>
            <div className={styles.cardValue}>{stats.wonCount.toLocaleString()}<span className={styles.cardUnit}>건</span></div>
            <div className={styles.cardSub}>경매 종료 후 낙찰 완료</div>
          </div>
        </div>

        <div className={`${styles.summaryCard} ${styles.cardOrange}`}>
          <div className={styles.cardIcon}>📭</div>
          <div className={styles.cardBody}>
            <div className={styles.cardLabel}>유찰</div>
            <div className={styles.cardValue}>{stats.failedCount.toLocaleString()}<span className={styles.cardUnit}>건</span></div>
            <div className={styles.cardSub}>경매 종료 후 유찰 처리</div>
          </div>
        </div>

        <div className={`${styles.summaryCard} ${styles.cardPurple}`}>
          <div className={styles.cardIcon}>🔒</div>
          <div className={styles.cardBody}>
            <div className={styles.cardLabel}>누적 제재</div>
            <div className={styles.cardValue}>{stats.totalSanctions.toLocaleString()}<span className={styles.cardUnit}>건</span></div>
            <div className={styles.cardSub}>정지·경고·영구정지 합산</div>
          </div>
        </div>

      </div>

      {/* ─── 하단 3열 ─── */}
      <div className={styles.bottomGrid}>

        {/* 최근 낙찰 현황 */}
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <span className={styles.panelTitle}>최근 낙찰 현황</span>
            <span className={styles.panelBadgeGreen}>{wonItems.length}건</span>
          </div>
          <div className={styles.panelBody}>
            {wonItems.length === 0 ? (
              <div className={styles.emptyMsg}>낙찰 내역이 없습니다.</div>
            ) : wonItems.map(a => (
              <div key={a.id} className={styles.auctionRow}>
                <img src={a.image} alt={a.name} className={styles.auctionThumb} />
                <div className={styles.auctionInfo}>
                  <div className={styles.auctionName}>{a.name}</div>
                  <div className={styles.auctionMeta}>{a.category} · 입찰 {a.bidCount}회</div>
                </div>
                <div className={styles.auctionPrice}>{a.currentPrice.toLocaleString()}원</div>
              </div>
            ))}
          </div>
        </div>

        {/* 최근 유찰 현황 */}
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <span className={styles.panelTitle}>최근 유찰 현황</span>
            <span className={styles.panelBadgeGray}>{failedItems.length}건</span>
          </div>
          <div className={styles.panelBody}>
            {failedItems.length === 0 ? (
              <div className={styles.emptyMsg}>유찰 내역이 없습니다.</div>
            ) : failedItems.map(a => (
              <div key={a.id} className={styles.auctionRow}>
                <img src={a.image} alt={a.name} className={styles.auctionThumb} />
                <div className={styles.auctionInfo}>
                  <div className={styles.auctionName}>{a.name}</div>
                  <div className={styles.auctionMeta}>{a.category} · 입찰 {a.bidCount}회</div>
                </div>
                <div className={styles.auctionPriceFailed}>{a.currentPrice.toLocaleString()}원</div>
              </div>
            ))}
          </div>
        </div>

        {/* 최근 제재 */}
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <span className={styles.panelTitle}>최근 제재 내역</span>
          </div>
          <div className={styles.panelBody}>
            {recentSanctions.map(s => (
              <div key={s.id} className={styles.sanctionRow}>
                <div className={styles.sanctionIcon}>🔒</div>
                <div className={styles.sanctionBody}>
                  <div className={styles.sanctionName}>
                    {s.memberName}
                    <span className={styles.sanctionType}>{sanctionTypeLabel(s.type)}</span>
                  </div>
                  <div className={styles.sanctionReason}>{s.reason}</div>
                  <div className={styles.sanctionDate}>{s.createdAt}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default DashboardPage;
