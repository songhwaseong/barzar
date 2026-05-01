import React, { useState, useMemo } from 'react';
import { PRODUCTS, AUCTION_ITEMS } from '../../data/mockData';
import { myProductStore } from '../../data/myProductStore';
import { MEMBERS } from '../../data/memberData';
import DashboardPage from './DashboardPage';
import NoticePage from './NoticePage';
import BannerPage from './BannerPage';
import SettlementPage from './SettlementPage';
import InquiryPage from './InquiryPage';
import FalseBidPage from './FalseBidPage';
import SanctionPage from './SanctionPage';
import ChatLogPage from './ChatLogPage';
import MemberListPage from './MemberListPage';
import WithdrawnMemberPage from './WithdrawnMemberPage';
import styles from './AdminPage.module.css';

// ─── 관리자용 통합 상품 타입 ───────────────────────────────────────────
type TradeStatus   = '경매예정' | '낙찰' | '숨김';
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
    status: '경매예정',
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
  | '대시보드'
  | '상품 관리'
  | '허위입찰' | '제재 내역' | '채팅 로그'
  | '회원 목록' | '탈퇴 회원'
  | '공지사항' | '카테고리/배너' | '정산/수수료' | '고객문의/FAQ';

const SIDE_SECTIONS = [
  {
    label: '개요',
    items: [{ key: '대시보드' as MenuKey, icon: '📊', label: '대시보드' }],
  },
  {
    label: '상품',
    items: [{ key: '상품 관리' as MenuKey, icon: '📦', label: '상품 관리' }],
  },
  {
    label: '신고/제재',
    items: [
      { key: '허위입찰' as MenuKey, icon: '⚠️', label: '허위입찰' },
      { key: '제재 내역' as MenuKey, icon: '🔒', label: '제재 내역' },
      { key: '채팅 로그' as MenuKey, icon: '💬', label: '채팅 로그(보류)' },
    ],
  },
  {
    label: '회원 관리',
    items: [
      { key: '회원 목록' as MenuKey, icon: '👥', label: '회원 목록' },
      { key: '탈퇴 회원' as MenuKey, icon: '🗃️', label: '탈퇴 회원' },
    ],
  },
  {
    label: '콘텐츠',
    items: [
      { key: '공지사항'    as MenuKey, icon: '📢', label: '공지사항' },
      { key: '카테고리/배너' as MenuKey, icon: '🖼️', label: '카테고리/배너' },
    ],
  },
  {
    label: '운영',
    items: [
      { key: '정산/수수료'   as MenuKey, icon: '💰', label: '정산/수수료' },
      { key: '고객문의/FAQ'  as MenuKey, icon: '💬', label: '고객문의/FAQ' },
    ],
  },
];

const CATEGORY_OPTIONS = ['전체', '디지털/가전', '패션/의류', '명품', '시계/주얼리', '신발', '스포츠/레저', '뷰티/미용', '게임/취미', '음향/악기', '한정판', '이월상품'];


// ─── AdminPage ─────────────────────────────────────────────────────────
interface Props { onLogout: () => void; }

const AdminPage: React.FC<Props> = ({ onLogout }) => {
  const [activeMenu, setActiveMenu] = useState<MenuKey>('대시보드');
  const [products, setProducts] = useState<AdminProduct[]>(buildInitialProducts);

  // 상품관리 필터 상태
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('전체');
  const [statusFilter, setStatusFilter] = useState('전체');
  const [statFilter, setStatFilter] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;

  // 삭제 확인 모달
  const [deleteTarget, setDeleteTarget] = useState<AdminProduct | null>(null);

  // ─── 배지 카운트 (사이드바용) ──────────────────────────────────────
  const suspendedMembers = MEMBERS.filter(m => m.status === 'suspended' || m.status === 'permanent').length;

  const getBadge = (key: MenuKey): number | null => {
    if (key === '회원 목록') return suspendedMembers;
    return null;
  };

  // ─── 검색/드롭다운 필터만 적용 (statFilter 제외) ────────────────
  const baseFiltered = useMemo(() => {
    return products.filter(p => {
      if (search && !p.name.toLowerCase().includes(search.toLowerCase()) && !p.seller.toLowerCase().includes(search.toLowerCase())) return false;
      if (categoryFilter !== '전체' && p.category !== categoryFilter) return false;
      if (statusFilter !== '전체' && p.status !== statusFilter) return false;
      return true;
    });
  }, [products, search, categoryFilter, statusFilter]);

  // ─── 상품 통계 (검색 결과 기준) ──────────────────────────────────
  const stats = useMemo(() => ({
    total:    baseFiltered.length,
    trade:    baseFiltered.filter(p => p.type === '중고거래').length,
    auction:  baseFiltered.filter(p => p.type === '경매').length,
    selling:  baseFiltered.filter(p => p.status === '경매예정').length,
    inBid:    baseFiltered.filter(p => p.status === '경매중').length,
    won:      baseFiltered.filter(p => p.status === '낙찰').length,
    failed:   baseFiltered.filter(p => p.status === '유찰').length,
    hidden:   baseFiltered.filter(p => p.status === '숨김').length,
  }), [baseFiltered]);

  // ─── 필터링된 상품 목록 (statFilter 추가 적용) ───────────────────
  const filtered = useMemo(() => {
    return baseFiltered.filter(p => {
      if (statFilter === '경매예정' && p.status !== '경매예정') return false;
      if (statFilter === '경매중' && p.status !== '경매중') return false;
      if (statFilter === '낙찰' && p.status !== '낙찰') return false;
      if (statFilter === '유찰' && p.status !== '유찰') return false;
      if (statFilter === '숨김' && p.status !== '숨김') return false;
      return true;
    });
  }, [baseFiltered, statFilter]);

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
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  // ─── 상품관리 렌더 ───────────────────────────────────────────────
  const renderProducts = () => (
    <>
      <div className={styles.pageTitle}>상품 관리</div>
      <div className={styles.pageSubtitle}>전체 상품을 조회하고 상태를 관리합니다.</div>

      <div className={styles.statsRow}>
        {[
          { key: null,       label: '전체 상품', value: stats.total },
          { key: '경매예정', label: '경매예정',   value: stats.selling },
          { key: '경매중',   label: '경매중',     value: stats.inBid },
          { key: '낙찰',     label: '낙찰',       value: stats.won },
          { key: '유찰',     label: '유찰',       value: stats.failed },
          { key: '숨김',     label: '숨김',       value: stats.hidden },
        ].map(s => (
          <div
            key={s.label}
            className={`${styles.statCard} ${statFilter === s.key ? styles.statCardActive : ''}`}
            onClick={() => {
              if (s.key === null) {
                setStatFilter(null);
              } else {
                handleStatClick(s.key);
              }
            }}
            style={{ cursor: 'pointer' }}
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
            onChange={e => { setSearch(e.target.value); setStatFilter(null); setCurrentPage(1); }}
          />
        </div>
        <select className={styles.filterSelect} value={categoryFilter} onChange={e => { setCategoryFilter(e.target.value); setStatFilter(null); setCurrentPage(1); }}>
          {CATEGORY_OPTIONS.map(c => <option key={c}>{c}</option>)}
        </select>
        <select className={styles.filterSelect} value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setStatFilter(null); setCurrentPage(1); }}>
          {['전체', '경매예정', '경매중', '낙찰', '유찰', '숨김'].map(s => <option key={s}>{s}</option>)}
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
              {paginated.map(p => (
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
                      p.status === '경매예정' ? styles.statusOn     :
                      p.status === '경매중'   ? styles.statusBid    :
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
                        <>
                          <option value="경매예정">경매예정</option>
                          <option value="경매중">경매중</option>
                          <option value="낙찰">낙찰</option>
                          <option value="유찰">유찰</option>
                          <option value="숨김">숨김</option>
                        </>
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

      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 4, marginTop: 20 }}>
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid #E0E0E0', background: currentPage === 1 ? '#F5F5F5' : '#fff', color: currentPage === 1 ? '#ccc' : '#333', cursor: currentPage === 1 ? 'default' : 'pointer', fontSize: 13 }}
          >이전</button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid #E0E0E0', background: currentPage === page ? '#E24B4A' : '#fff', color: currentPage === page ? '#fff' : '#333', cursor: 'pointer', fontWeight: currentPage === page ? 700 : 400, fontSize: 13 }}
            >{page}</button>
          ))}
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid #E0E0E0', background: currentPage === totalPages ? '#F5F5F5' : '#fff', color: currentPage === totalPages ? '#ccc' : '#333', cursor: currentPage === totalPages ? 'default' : 'pointer', fontSize: 13 }}
          >다음</button>
        </div>
      )}
    </>
  );

  // ─── 메뉴별 컨텐츠 렌더 ─────────────────────────────────────────
  const renderContent = () => {
    switch (activeMenu) {
      case '대시보드':   return <DashboardPage totalProducts={products.length} />;
      case '상품 관리':  return renderProducts();
      case '허위입찰':   return <FalseBidPage />;
      case '제재 내역':  return <SanctionPage />;
      case '채팅 로그':  return <ChatLogPage />;
      case '회원 목록':    return <MemberListPage />;
      case '탈퇴 회원':    return <WithdrawnMemberPage />;
      case '공지사항':     return <NoticePage />;
      case '카테고리/배너': return <BannerPage />;
      case '정산/수수료':  return <SettlementPage />;
      case '고객문의/FAQ': return <InquiryPage />;
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
