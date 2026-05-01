import React, { useMemo } from 'react';
import { REPORTS, SANCTIONS, SUSPICIOUS_CASES } from '../../data/adminData';
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
    const pendingReports  = REPORTS.filter(r => r.status === 'pending').length;
    const openSuspicious  = SUSPICIOUS_CASES.filter(c => c.status !== 'resolved').length;
    const totalSanctions  = SANCTIONS.length;

    const totalSales = MEMBERS.reduce((sum, m) => sum + m.salesCount, 0);
    const totalPurchases = MEMBERS.reduce((sum, m) => sum + m.purchaseCount, 0);

    return {
      totalMembers: MEMBERS.length,
      activeMembers,
      suspendedMembers,
      withdrawnMembers,
      pendingReports,
      openSuspicious,
      totalSanctions,
      totalProducts,
      tradeProducts: PRODUCTS.length,
      auctionProducts: AUCTION_ITEMS.length,
      totalSales,
      totalPurchases,
    };
  }, [totalProducts]);

  const recentReports = REPORTS.slice().sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt)
  ).slice(0, 5);

  const openCases = SUSPICIOUS_CASES.filter(c => c.status !== 'resolved');

  const recentSanctions = SANCTIONS.slice().sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt)
  ).slice(0, 3);

  const reportTypeLabel = (type: string) =>
    type === 'product' ? '상품' : type === 'chat' ? '채팅' : '후기';

  const reportStatusLabel = (status: string) => {
    if (status === 'pending')  return { label: '처리중', cls: styles.badgePending };
    if (status === 'approved') return { label: '승인',   cls: styles.badgeApproved };
    if (status === 'rejected') return { label: '반려',   cls: styles.badgeRejected };
    return { label: '삭제됨', cls: styles.badgeDeleted };
  };

  const severityLabel = (sev: string) => {
    if (sev === 'high')   return { label: '높음', cls: styles.sevHigh };
    if (sev === 'medium') return { label: '중간', cls: styles.sevMed };
    return { label: '낮음', cls: styles.sevLow };
  };

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

        <div className={`${styles.summaryCard} ${styles.cardRed}`}>
          <div className={styles.cardIcon}>🚨</div>
          <div className={styles.cardBody}>
            <div className={styles.cardLabel}>미처리 신고</div>
            <div className={styles.cardValue}>{stats.pendingReports.toLocaleString()}<span className={styles.cardUnit}>건</span></div>
            <div className={styles.cardSub}>전체 신고 {REPORTS.length}건</div>
          </div>
        </div>

        <div className={`${styles.summaryCard} ${styles.cardOrange}`}>
          <div className={styles.cardIcon}>🔍</div>
          <div className={styles.cardBody}>
            <div className={styles.cardLabel}>사기 감지 (처리중)</div>
            <div className={styles.cardValue}>{stats.openSuspicious.toLocaleString()}<span className={styles.cardUnit}>건</span></div>
            <div className={styles.cardSub}>전체 {SUSPICIOUS_CASES.length}건 중 미해결</div>
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

        <div className={`${styles.summaryCard} ${styles.cardTeal}`}>
          <div className={styles.cardIcon}>🤝</div>
          <div className={styles.cardBody}>
            <div className={styles.cardLabel}>누적 거래</div>
            <div className={styles.cardValue}>{(stats.totalSales + stats.totalPurchases).toLocaleString()}<span className={styles.cardUnit}>건</span></div>
            <div className={styles.cardSub}>판매 {stats.totalSales} · 구매 {stats.totalPurchases}</div>
          </div>
        </div>
      </div>

      {/* ─── 하단 3열 ─── */}
      <div className={styles.bottomGrid}>

        {/* 최근 신고 */}
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <span className={styles.panelTitle}>최근 신고 현황</span>
            <span className={styles.panelBadge}>{stats.pendingReports}건 미처리</span>
          </div>
          <div className={styles.panelBody}>
            {recentReports.map(r => {
              const s = reportStatusLabel(r.status);
              return (
                <div key={r.id} className={styles.reportRow}>
                  <div className={styles.reportLeft}>
                    <span className={styles.reportType}>{reportTypeLabel(r.type)}</span>
                    <div>
                      <div className={styles.reportName}>{r.targetName}</div>
                      <div className={styles.reportMeta}>{r.reason} · {r.createdAt}</div>
                    </div>
                  </div>
                  <span className={`${styles.statusBadge} ${s.cls}`}>{s.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 사기 감지 */}
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <span className={styles.panelTitle}>사기 감지 현황</span>
            <span className={styles.panelBadge}>{openCases.length}건 진행중</span>
          </div>
          <div className={styles.panelBody}>
            {openCases.length === 0 ? (
              <div className={styles.emptyMsg}>진행중인 사기 감지 건이 없습니다.</div>
            ) : openCases.map(c => {
              const sev = severityLabel(c.severity);
              const typeMap: Record<string, string> = {
                bid_manipulation: '입찰 조작',
                duplicate_account: '중복 계정',
                fake_review: '허위 후기',
                fraud: '사기',
              };
              return (
                <div key={c.id} className={styles.caseRow}>
                  <div className={styles.caseLeft}>
                    <span className={`${styles.sevBadge} ${sev.cls}`}>{sev.label}</span>
                    <div>
                      <div className={styles.caseName}>{c.memberName}</div>
                      <div className={styles.caseMeta}>{typeMap[c.caseType]} · {c.detectedAt}</div>
                    </div>
                  </div>
                  <span className={styles.caseStatus}>
                    {c.status === 'open' ? '🔴 미조사' : '🟡 조사중'}
                  </span>
                </div>
              );
            })}
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
