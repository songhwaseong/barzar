import React, { useState } from 'react';
import styles from './admin.module.css';

type BidStatus = 'open' | 'investigating' | 'resolved';

interface FalseBidCase {
  id: number;
  memberNo: string;
  memberName: string;
  auctionItem: string;
  bidAmount: number;
  reason: string;
  detectedAt: string;
  status: BidStatus;
}

const INITIAL_CASES: FalseBidCase[] = [
  { id: 1, memberNo: 'M00234', memberName: '김민준', auctionItem: '나이키 에어맥스 270', bidAmount: 320000, reason: '반복적인 최고가 입찰 후 취소', detectedAt: '2026.04.28 14:22', status: 'open' },
  { id: 2, memberNo: 'M00891', memberName: '이서연', auctionItem: '애플워치 울트라2', bidAmount: 950000, reason: '동일 IP 다계정 입찰 의심', detectedAt: '2026.04.27 09:15', status: 'investigating' },
  { id: 3, memberNo: 'M01102', memberName: '박지훈', auctionItem: '소니 WH-1000XM5', bidAmount: 180000, reason: '낙찰 후 결제 미이행 3회', detectedAt: '2026.04.26 17:40', status: 'open' },
  { id: 4, memberNo: 'M00456', memberName: '최수아', auctionItem: '구찌 GG 마몽 백', bidAmount: 1250000, reason: '비정상적인 단시간 연속 입찰', detectedAt: '2026.04.25 11:03', status: 'resolved' },
  { id: 5, memberNo: 'M00778', memberName: '정도윤', auctionItem: '레고 테크닉 42156', bidAmount: 220000, reason: '허위 계정으로 가격 끌어올리기 의심', detectedAt: '2026.04.24 08:55', status: 'investigating' },
];

const statusLabel = (s: BidStatus) => ({ open: '신규', investigating: '조사중', resolved: '해결' }[s]);
const statusClass = (s: BidStatus) => ({ open: styles.badgeOpen, investigating: styles.badgeInvestigating, resolved: styles.badgeResolved }[s]);

const FalseBidPage: React.FC = () => {
  const [list, setList] = useState<FalseBidCase[]>(INITIAL_CASES);
  const [selected, setSelected] = useState<FalseBidCase | null>(null);

  const updateStatus = (id: number, status: BidStatus) => {
    setList(prev => prev.map(c => c.id === id ? { ...c, status } : c));
    setSelected(null);
  };

  const open = list.filter(c => c.status === 'open').length;
  const investigating = list.filter(c => c.status === 'investigating').length;
  const resolved = list.filter(c => c.status === 'resolved').length;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>허위입찰 관리</h1>
        <p className={styles.subtitle}>비정상 입찰 행위가 감지된 케이스를 조사하고 처리합니다</p>
      </div>

      <div className={styles.statRow}>
        <div className={styles.statCard}>
          <div className={`${styles.statNum} ${styles.statNumRed}`}>{open}</div>
          <div className={styles.statLabel}>신규</div>
        </div>
        <div className={styles.statCard}>
          <div className={`${styles.statNum} ${styles.statNumAmber}`}>{investigating}</div>
          <div className={styles.statLabel}>조사중</div>
        </div>
        <div className={styles.statCard}>
          <div className={`${styles.statNum} ${styles.statNumGreen}`}>{resolved}</div>
          <div className={styles.statLabel}>해결</div>
        </div>
      </div>

      <table className={styles.table}>
        <thead>
          <tr>
            <th>ID</th>
            <th>회원번호</th>
            <th>이름</th>
            <th>경매 상품</th>
            <th>입찰금액</th>
            <th>의심 사유</th>
            <th>감지 일시</th>
            <th>상태</th>
            <th>처리</th>
          </tr>
        </thead>
        <tbody>
          {list.map(c => (
            <tr key={c.id}>
              <td style={{ color: '#8B8FA8', fontSize: 12 }}>#{c.id}</td>
              <td style={{ fontSize: 12 }}>{c.memberNo}</td>
              <td style={{ fontSize: 13, fontWeight: 500 }}>{c.memberName}</td>
              <td style={{ fontSize: 12, maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.auctionItem}</td>
              <td style={{ fontSize: 12 }}>₩{c.bidAmount.toLocaleString()}</td>
              <td style={{ fontSize: 12, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.reason}</td>
              <td style={{ fontSize: 12, color: '#8B8FA8', whiteSpace: 'nowrap' }}>{c.detectedAt}</td>
              <td><span className={`${styles.badge} ${statusClass(c.status)}`}>{statusLabel(c.status)}</span></td>
              <td>
                <button className={styles.actionBtn} onClick={() => setSelected(c)}>상세</button>
                {c.status === 'open' && (
                  <button className={`${styles.actionBtn} ${styles.actionBtnDanger}`} onClick={() => updateStatus(c.id, 'investigating')}>조사 시작</button>
                )}
                {c.status === 'investigating' && (
                  <button className={`${styles.actionBtn} ${styles.actionBtnPrimary}`} onClick={() => updateStatus(c.id, 'resolved')}>해결</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {selected && (
        <div className={styles.overlay} onClick={() => setSelected(null)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>허위입찰 케이스 #{selected.id}</h2>
              <button className={styles.modalClose} onClick={() => setSelected(null)}>✕</button>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>회원번호</span>
              <span className={styles.infoValue}>{selected.memberNo}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>이름</span>
              <span className={styles.infoValue}>{selected.memberName}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>경매 상품</span>
              <span className={styles.infoValue}>{selected.auctionItem}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>입찰금액</span>
              <span className={styles.infoValue}>₩{selected.bidAmount.toLocaleString()}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>의심 사유</span>
              <span className={styles.infoValue}>{selected.reason}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>감지 일시</span>
              <span className={styles.infoValue}>{selected.detectedAt}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>현재 상태</span>
              <span className={`${styles.badge} ${statusClass(selected.status)}`}>{statusLabel(selected.status)}</span>
            </div>
            <div className={styles.modalActions}>
              {selected.status === 'open' && (
                <button className={`${styles.actionBtn} ${styles.actionBtnDanger}`} onClick={() => updateStatus(selected.id, 'investigating')}>조사 시작</button>
              )}
              {selected.status === 'investigating' && (
                <button className={`${styles.actionBtn} ${styles.actionBtnPrimary}`} onClick={() => updateStatus(selected.id, 'resolved')}>해결 처리</button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FalseBidPage;
