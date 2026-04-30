import React, { useState } from 'react';
import { MEMBERS, type Member } from '../../data/memberData';
import MemberDetailPage from './MemberDetailPage';
import styles from './admin.module.css';

type StatusFilter = 'all' | 'active' | 'suspended' | 'permanent' | 'withdrawn';

const statusLabel = (s: Member['status']) => ({ active: '정상', suspended: '정지', permanent: '영구정지', withdrawn: '탈퇴' }[s]);
const statusColor = (s: Member['status']) => ({
  active: { background: '#D1E7DD', color: '#0F5132' },
  suspended: { background: '#F8D7DA', color: '#842029' },
  permanent: { background: '#1A1A1A', color: '#fff' },
  withdrawn: { background: '#E2E3E5', color: '#41464B' },
}[s]);

const tempColor = (t: number) => t >= 40 ? '#3B6D11' : t >= 35 ? '#EF9F27' : '#E24B4A';

const MemberListPage: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [search, setSearch] = useState('');
  const [selectedMemberNo, setSelectedMemberNo] = useState<string | null>(null);
  const [list, setList] = useState<Member[]>(MEMBERS);

  const filtered = list.filter(m => {
    const matchStatus = statusFilter === 'all' || m.status === statusFilter;
    const q = search.toLowerCase();
    const matchSearch = !q || m.name.includes(q) || m.memberNo.includes(q) || m.email.includes(q);
    return matchStatus && matchSearch;
  });

  const active = list.filter(m => m.status === 'active').length;
  const suspended = list.filter(m => m.status === 'suspended' || m.status === 'permanent').length;
  const withdrawn = list.filter(m => m.status === 'withdrawn').length;
  const reportedToday = list.filter(m => m.reportCount > 0).length;

  if (selectedMemberNo) {
    const member = list.find(m => m.memberNo === selectedMemberNo)!;
    return (
      <MemberDetailPage
        member={member}
        onBack={() => setSelectedMemberNo(null)}
        onUpdateStatus={(memberNo, status, suspendUntil) => {
          setList(prev => prev.map(m => m.memberNo === memberNo ? { ...m, status, suspendUntil } : m));
          setSelectedMemberNo(null);
        }}
      />
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>회원 목록</h1>
        <p className={styles.subtitle}>전체 회원을 조회하고 관리합니다</p>
      </div>

      <div className={styles.statRow}>
        <div className={styles.statCard}>
          <div className={styles.statNum}>{list.length}</div>
          <div className={styles.statLabel}>전체 회원</div>
        </div>
        <div className={styles.statCard}>
          <div className={`${styles.statNum} ${styles.statNumGreen}`}>{active}</div>
          <div className={styles.statLabel}>정상</div>
        </div>
        <div className={styles.statCard}>
          <div className={`${styles.statNum} ${styles.statNumRed}`}>{suspended}</div>
          <div className={styles.statLabel}>정지/영구정지</div>
        </div>
        <div className={styles.statCard}>
          <div className={`${styles.statNum} ${styles.statNumAmber}`}>{reportedToday}</div>
          <div className={styles.statLabel}>신고 이력 있음</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 16, alignItems: 'center' }}>
        <input
          style={{ flex: 1, maxWidth: 280, border: '1px solid #E0E0E0', borderRadius: 8, padding: '8px 12px', fontSize: 13, fontFamily: 'Noto Sans KR, sans-serif' }}
          placeholder="이름, 회원번호, 이메일 검색"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <div className={styles.filterRow} style={{ margin: 0 }}>
          {(['all','active','suspended','permanent','withdrawn'] as StatusFilter[]).map(f => (
            <button
              key={f}
              className={`${styles.filterBtn} ${statusFilter === f ? styles.filterActive : ''}`}
              onClick={() => setStatusFilter(f)}
            >
              {{ all:'전체', active:'정상', suspended:'정지', permanent:'영구정지', withdrawn:'탈퇴' }[f]}
            </button>
          ))}
        </div>
      </div>

      <table className={styles.table}>
        <thead>
          <tr>
            <th>회원번호</th>
            <th>이름</th>
            <th>이메일</th>
            <th>가입일</th>
            <th>최근 로그인</th>
            <th>매너온도</th>
            <th>판매/구매/입찰</th>
            <th>신고</th>
            <th>상태</th>
            <th>관리</th>
          </tr>
        </thead>
        <tbody>
          {filtered.length === 0 && (
            <tr><td colSpan={10} className={styles.emptyText}>검색 결과가 없습니다</td></tr>
          )}
          {filtered.map(m => (
            <tr key={m.memberNo}>
              <td style={{ fontSize: 11, color: '#8B8FA8', fontFamily: 'monospace' }}>{m.memberNo}</td>
              <td style={{ fontWeight: 500 }}>{m.name}</td>
              <td style={{ fontSize: 12 }}>{m.email}</td>
              <td style={{ fontSize: 12, color: '#8B8FA8' }}>{m.joinedAt}</td>
              <td style={{ fontSize: 11, color: '#8B8FA8' }}>{m.lastLoginAt}</td>
              <td>
                <span style={{ fontWeight: 700, color: tempColor(m.mannerTemp) }}>{m.mannerTemp}°</span>
              </td>
              <td style={{ fontSize: 12 }}>
                <span style={{ color: '#639922' }}>{m.salesCount}</span>
                <span style={{ color: '#ccc' }}> / </span>
                <span style={{ color: '#185FA5' }}>{m.purchaseCount}</span>
                <span style={{ color: '#ccc' }}> / </span>
                <span style={{ color: '#534AB7' }}>{m.bidCount}</span>
              </td>
              <td>
                {m.reportCount > 0
                  ? <span className={`${styles.badge} ${styles.badgeHigh}`}>{m.reportCount}건</span>
                  : <span style={{ fontSize: 12, color: '#ccc' }}>—</span>
                }
              </td>
              <td>
                <span className={styles.badge} style={statusColor(m.status)}>{statusLabel(m.status)}</span>
              </td>
              <td>
                <button className={styles.actionBtn} onClick={() => setSelectedMemberNo(m.memberNo)}>상세</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MemberListPage;
