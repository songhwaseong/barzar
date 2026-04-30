import React, { useState, useMemo } from 'react';
import { PRODUCTS, AUCTION_ITEMS } from '../../data/mockData';
import { myProductStore } from '../../data/myProductStore';
import { REPORTS } from '../../data/adminData';
import { MEMBERS } from '../../data/memberData';
import ReportListPage from './ReportListPage';
import SuspiciousPage from './SuspiciousPage';
import SanctionPage from './SanctionPage';
import ChatLogPage from './ChatLogPage';
import MemberListPage from './MemberListPage';
import WithdrawnMemberPage from './WithdrawnMemberPage';
import styles from './AdminPage.module.css';

// ─── 관리자용 통합 상품 타입 ───────────────────────────────────────────
type TradeStatus   = '판매중' | '거래완료' | '숨김';
type AuctionStatus = '경매중' | '낙찰'    | '유찰' | '숨김';
type ProductStatus = TradeStatus | AuctionStatus;

interface AdminProduct {
  id: string;
  image: string;
  name: string;
  type: '중고거래' | '경매';
  seller: string;
  category: string;
  price: number;
  status: ProductStatus;
  registeredAt: string;
}

const SELLERS = ['운동화마니아', '코딩러버', '사진작가K', '기타리스트', '워치컬렉터', '뷰티러버', '패션킹', '게이머Z', '오디오파일', '홈퍼니싱'];
const getSeller = (id: number) => SELLERS[id % SELLERS.length];

const buildInitialProducts = (): AdminProduct[] => {
  const tradeItems: AdminProduct[] = PRODUCTS.map(p => ({
    id: `trade-${p.id}`,
    image: p.image,
    name: p.name,
    type: '중고거래',
    seller: getSeller(p.id),
    category: p.category,
    price: p.price,
    status: '판매중',
    registeredAt: `2026.04.${String(28 - (p.id % 14)).padStart(2, '0')}`,
  }));

  const auctionStatus = (a: { isLive: boolean; id: number }): AuctionStatus => {
    if (a.isLive) return '경매중';
    return a.id % 3 === 0 ? '유찰' : '낙찰';
  };

  const auctionItems: AdminProduct[] = AUCTION_ITEMS.map(a => ({
    id: `auction-${a.id}`,
    image: a.image,
    name: a.name,
    type: '경매',
    seller: getSeller(a.id + 3),
    category: a.category,
    price: a.currentPrice,
    status: auctionStatus(a),
    registeredAt: `2026.04.${String(27 - (a.id % 12)).padStart(2, '0')}`,
  }));

  const myItems: AdminProduct[] = myProductStore.map(p => ({
    id: `my-${p.id}`,
    image: p.images[p.mainImageIndex] ?? p.images[0],
    name: p.title,
    type: '중고거래',
    seller: 'hwaseong',
    category: p.category,
    price: p.price,
    status: p.status,
    registeredAt: '2026.04.25',
  }));

  return [...myItems, ...tradeItems, ...auctionItems];
};

// ─── 사이드바 메뉴 구조 ─────────────────────────────────────────────────
type MenuKey =
  | '상품 관리'
  | '신고 현황' | '사기 감지' | '제재 내역' | '채팅 로그'
  | '회원 목록' | '탈퇴 회원';

const SIDE_SECTIONS = [
  {
    label: '상품',
    items: [{ key: '상품 관리' as MenuKey, icon: '📦', label: '상품 관리' }],
  },
  {
    label: '신고/제재',
    items: [
      { key: '신고 현황' as MenuKey, icon: '🚨', label: '신고 현황' },
      { key: '사기 감지' as MenuKey, icon: '🔍', label: '사기 감지' },
      { key: '제재 내역' as MenuKey, icon: '🔒', label: '제재 내역' },
      { key: '채팅 로그' as MenuKey, icon: '💬', label: '채팅 로그' },
    ],
  },
  {
    label: '회원 관리',
    items: [
      { key: '회원 목록' as MenuKey, icon: '👥', label: '회원 목록' },
      { key: '탈퇴 회원' as MenuKey, icon: '🗃️', label: '탈퇴 회원' },
    ],
  },
];

const CATEGORY_OPTIONS = ['전체', '디지털/가전', '패션/의류', '명품', '시계/주얼리', '신발', '스포츠/레저', '뷰티/미용', '게임/취미', '음향/악기', '한정판', '이월상품'];


// ─── AdminPage ─────────────────────────────────────────────────────────
interface Props { onLogout: () => void; }

const AdminPage: React.FC<Props> = ({ onLogout }) => {
  const [activeMenu, setActiveMenu] = useState<MenuKey>('상품 관리');
  const [products, setProducts] = useState<AdminProduct[]>(buildInitialProducts);

  // 상품관리 필터 상태
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('전체');
  const [statusFilter, setStatusFilter] = useState('전체');
  const [typeFilter, setTypeFilter] = useState('전체');
  const [statFilter, setStatFilter] = useState<string | null>(null);

  // 삭제 확인 모달
  const [deleteTarget, setDeleteTarget] = useState<AdminProduct | null>(null);

  // ─── 배지 카운트 (사이드바용) ──────────────────────────────────────
  const pendingReports = REPORTS.filter(r => r.status === 'pending').length;
  const suspendedMembers = MEMBERS.filter(m => m.status === 'suspended' || m.status === 'permanent').length;

  const getBadge = (key: MenuKey): number | null => {
    if (key === '신고 현황') return pendingReports;
    if (key === '회원 목록') return suspendedMembers;
    return null;
  };

  // ─── 상품 통계 ────────────────────────────────────────────────────
  const stats = useMemo(() => ({
    total:    products.length,
    trade:    products.filter(p => p.type === '중고거래').length,
    auction:  products.filter(p => p.type === '경매').length,
    selling:  products.filter(p => p.status === '판매중').length,
    inBid:    products.filter(p => p.status === '경매중').length,
    done:     products.filter(p => p.status === '거래완료').length,
    won:      products.filter(p => p.status === '낙찰').length,
    failed:   products.filter(p => p.status === '유찰').length,
    hidden:   products.filter(p => p.status === '숨김').length,
  }), [products]);

  // ─── 필터링된 상품 목록 ──────────────────────────────────────────
  const filtered = useMemo(() => {
    return products.filter(p => {
      if (search && !p.name.toLowerCase().includes(search.toLowerCase()) && !p.seller.toLowerCase().includes(search.toLowerCase())) return false;
      if (categoryFilter !== '전체' && p.category !== categoryFilter) return false;
      if (statusFilter !== '전체' && p.status !== statusFilter) return false;
      if (typeFilter !== '전체' && p.type !== typeFilter) return false;
      if (statFilter === '중고거래' && p.type !== '중고거래') return false;
      if (statFilter === '경매' && p.type !== '경매') return false;
      if (statFilter === '판매중' && p.status !== '판매중') return false;
      if (statFilter === '거래완료' && p.status !== '거래완료') return false;
      if (statFilter === '숨김' && p.status !== '숨김') return false;
      return true;
    });
  }, [products, search, categoryFilter, statusFilter, typeFilter, statFilter]);

  const handleStatusChange = (id: string, newStatus: AdminProduct['status']) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, status: newStatus } : p));
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    setProducts(prev => prev.filter(p => p.id !== deleteTarget.id));
    setDeleteTarget(null);
  };

  const handleStatClick = (key: string) => {
    setStatFilter(prev => prev === key ? null : key);
    setSearch(''); setCategoryFilter('전체'); setStatusFilter('전체'); setTypeFilter('전체');
  };

  // ─── 상품관리 렌더 ───────────────────────────────────────────────
  const renderProducts = () => (
    <>
      <div className={styles.pageTitle}>상품 관리</div>
      <div className={styles.pageSubtitle}>전체 상품을 조회하고 상태를 관리합니다.</div>

      <div className={styles.statsRow}>
        {[
          { key: null,       label: '전체 상품', value: stats.total },
          { key: '중고거래', label: '중고거래',   value: stats.trade },
          { key: '경매',     label: '경매',       value: stats.auction },
          { key: '판매중',   label: '판매중',     value: stats.selling },
          { key: '경매중',   label: '경매중',     value: stats.inBid },
          { key: '거래완료', label: '거래완료',   value: stats.done },
          { key: '낙찰',     label: '낙찰',       value: stats.won },
          { key: '유찰',     label: '유찰',       value: stats.failed },
          { key: '숨김',     label: '숨김',       value: stats.hidden },
        ].map(s => (
          <div
            key={s.label}
            className={`${styles.statCard} ${statFilter === s.key && s.key !== null ? styles.statCardActive : ''}`}
            onClick={() => s.key !== null && handleStatClick(s.key)}
            style={{ cursor: s.key !== null ? 'pointer' : 'default' }}
          >
            <div className={styles.statLabel}>{s.label}</div>
            <div className={styles.statValue}>{s.value.toLocaleString()}<span className={styles.statUnit}>건</span></div>
          </div>
        ))}
      </div>

      <div className={styles.filterBar}>
        <div className={styles.searchWrap}>
          <span className={styles.searchIcon}>🔍</span>
          <input
            className={styles.searchInput}
            placeholder="상품명 또는 판매자 검색"
            value={search}
            onChange={e => { setSearch(e.target.value); setStatFilter(null); }}
          />
        </div>
        <select className={styles.filterSelect} value={categoryFilter} onChange={e => { setCategoryFilter(e.target.value); setStatFilter(null); }}>
          {CATEGORY_OPTIONS.map(c => <option key={c}>{c}</option>)}
        </select>
        <select className={styles.filterSelect} value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setStatFilter(null); }}>
          {['전체', '판매중', '경매중', '거래완료', '낙찰', '유찰', '숨김'].map(s => <option key={s}>{s}</option>)}
        </select>
        <select className={styles.filterSelect} value={typeFilter} onChange={e => { setTypeFilter(e.target.value); setStatFilter(null); }}>
          {['전체', '중고거래', '경매'].map(t => <option key={t}>{t}</option>)}
        </select>
        <span className={styles.filterCount}>총 {filtered.length}건</span>
      </div>

      <div className={styles.tableWrap}>
        {filtered.length === 0 ? (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>📦</div>
            <div className={styles.emptyText}>검색 결과가 없습니다</div>
          </div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>상품</th><th>유형</th><th>판매자</th><th>가격</th><th>상태</th><th>등록일</th><th>관리</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id}>
                  <td>
                    <div className={styles.productCell}>
                      <img src={p.image} alt={p.name} className={styles.productThumb} />
                      <div>
                        <div className={styles.productName}>{p.name}</div>
                        <div className={styles.productCategory}>{p.category}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`${styles.typeBadge} ${p.type === '중고거래' ? styles.typeTrade : styles.typeAuction}`}>
                      {p.type}
                    </span>
                  </td>
                  <td>{p.seller}</td>
                  <td>₩{p.price.toLocaleString()}</td>
                  <td>
                    <span className={`${styles.statusBadge} ${
                      p.status === '판매중'   ? styles.statusOn     :
                      p.status === '경매중'   ? styles.statusBid    :
                      p.status === '거래완료' ? styles.statusDone   :
                      p.status === '낙찰'     ? styles.statusWon    :
                      p.status === '유찰'     ? styles.statusFailed :
                      styles.statusHidden
                    }`}>{p.status}</span>
                  </td>
                  <td>{p.registeredAt}</td>
                  <td>
                    <div className={styles.actionCell}>
                      <select
                        className={styles.statusSelect}
                        value={p.status}
                        onChange={e => handleStatusChange(p.id, e.target.value as ProductStatus)}
                      >
                        {p.type === '경매'
                          ? <>
                              <option value="경매중">경매중</option>
                              <option value="낙찰">낙찰</option>
                              <option value="유찰">유찰</option>
                              <option value="숨김">숨김</option>
                            </>
                          : <>
                              <option value="판매중">판매중</option>
                              <option value="거래완료">거래완료</option>
                              <option value="숨김">숨김</option>
                            </>
                        }
                      </select>
                      <button className={styles.deleteBtn} onClick={() => setDeleteTarget(p)}>삭제</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );

  // ─── 메뉴별 컨텐츠 렌더 ─────────────────────────────────────────
  const renderContent = () => {
    switch (activeMenu) {
      case '상품 관리':  return renderProducts();
      case '신고 현황':  return <ReportListPage />;
      case '사기 감지':  return <SuspiciousPage />;
      case '제재 내역':  return <SanctionPage />;
      case '채팅 로그':  return <ChatLogPage />;
      case '회원 목록':  return <MemberListPage />;
      case '탈퇴 회원':  return <WithdrawnMemberPage />;
      default: return null;
    }
  };

  return (
    <div className={styles.root}>
      {/* 상단 헤더 */}
      <header className={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className={styles.headerLogo}><span>BAZ</span>AR</span>
          <span className={styles.headerBadge}>ADMIN</span>
        </div>
        <div className={styles.headerRight}>
          <span className={styles.headerAdmin}><strong>관리자</strong>로 로그인 중</span>
          <button className={styles.logoutBtn} onClick={onLogout}>로그아웃</button>
        </div>
      </header>

      <div className={styles.body}>
        {/* 사이드바 */}
        <nav className={styles.sidebar}>
          {SIDE_SECTIONS.map(section => (
            <div key={section.label}>
              <div className={styles.sideSection}>{section.label}</div>
              {section.items.map(m => {
                const badge = getBadge(m.key);
                return (
                  <button
                    key={m.key}
                    className={`${styles.sideItem} ${activeMenu === m.key ? styles.sideItemActive : ''}`}
                    onClick={() => setActiveMenu(m.key)}
                  >
                    <span className={styles.sideIcon}>{m.icon}</span>
                    {m.label}
                    {badge !== null && badge > 0 && (
                      <span className={styles.sideBadge}>{badge}</span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        {/* 메인 컨텐츠 */}
        <main className={styles.main}>
          {renderContent()}
        </main>
      </div>

      {/* 삭제 확인 모달 */}
      {deleteTarget && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalIcon}>🗑️</div>
            <div className={styles.modalTitle}>상품을 삭제하시겠어요?</div>
            <div className={styles.modalDesc}>
              '{deleteTarget.name}'<br />
              삭제된 상품은 복구할 수 없습니다.
            </div>
            <div className={styles.modalBtns}>
              <button className={styles.modalCancelBtn} onClick={() => setDeleteTarget(null)}>취소</button>
              <button className={styles.modalDeleteBtn} onClick={handleDelete}>삭제하기</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;
