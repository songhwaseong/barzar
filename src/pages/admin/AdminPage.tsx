import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
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
import AdminSettingsPage, { IDLE_OPTIONS } from './AdminSettingsPage';
import type { IdleMinutes } from './AdminSettingsPage';
import styles from './AdminPage.module.css';

// ─── 관리자용 통합 상품 타입 ───────────────────────────────────────────
type TradeStatus = '경매예정' | '낙찰' | '숨김';
type AuctionStatus = '경매중' | '낙찰' | '유찰' | '숨김';
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
  | '공지사항' | '카테고리/배너' | '정산/수수료' | '고객문의/FAQ'
  | '설정';

const SIDE_SECTIONS = [
  {
    label: 'Overview',
    items: [{ key: '대시보드' as MenuKey, icon: '📊', label: 'Dashboard' }],
  },
  {
    label: 'Products',
    items: [{ key: '상품 관리' as MenuKey, icon: '📦', label: 'Product Management' }],
  },
  {
    label: 'Reports & Sanctions',
    items: [
      { key: '허위입찰' as MenuKey, icon: '⚠️', label: 'False Bids' },
      { key: '제재 내역' as MenuKey, icon: '🔒', label: 'Sanction History' },
      { key: '채팅 로그' as MenuKey, icon: '💬', label: 'Chat Logs (On Hold)' },
    ],
  },
  {
    label: 'Members',
    items: [
      { key: '회원 목록' as MenuKey, icon: '👥', label: 'Member List' },
      { key: '탈퇴 회원' as MenuKey, icon: '🗃️', label: 'Withdrawn Members' },
    ],
  },
  {
    label: 'Content',
    items: [
      { key: '공지사항' as MenuKey, icon: '📢', label: 'Notices' },
      { key: '카테고리/배너' as MenuKey, icon: '🖼️', label: 'Categories' },
    ],
  },
  {
    label: 'Operations',
    items: [
      { key: '정산/수수료' as MenuKey, icon: '💰', label: 'Settlements & Fees' },
      { key: '고객문의/FAQ' as MenuKey, icon: '💬', label: 'Inquiries & FAQ' },
    ],
  },
  {
    label: 'System',
    items: [
      { key: '설정' as MenuKey, icon: '⚙️', label: 'Settings' },
    ],
  },
];

const CATEGORY_OPTIONS = ['전체', '디지털/가전', '패션/의류', '명품', '시계/주얼리', '신발', '스포츠/레저', '뷰티/미용', '게임/취미', '음향/악기', '한정판', '이월상품'];


// ─── AdminPage ─────────────────────────────────────────────────────────
interface Props { onLogout: () => void; onSwitchToNormal: () => void; }

const WARN_COUNTDOWN_S = 30; // 경고 후 30초 뒤 자동 로그아웃
const IDLE_STORAGE_KEY = 'bazar_admin_idle_minutes';
const IDLE_WARNED_KEY = 'bazar_admin_idle_warned';

const AdminPage: React.FC<Props> = ({ onLogout, onSwitchToNormal }) => {
  const [activeMenu, setActiveMenu] = useState<MenuKey>('대시보드');
  const [products, setProducts] = useState<AdminProduct[]>(buildInitialProducts);

  // ─── 자동 로그아웃 ─────────────────────────────────────────────────
  const [idleMinutes, setIdleMinutes] = useState<IdleMinutes>(() => {
    const saved = localStorage.getItem(IDLE_STORAGE_KEY);
    const parsed = saved ? Number(saved) : 10;
    return (IDLE_OPTIONS.map(o => o.value) as number[]).includes(parsed)
      ? (parsed as IdleMinutes)
      : 10;
  });
  const [showIdleModal, setShowIdleModal] = useState(false);
  const [countdown, setCountdown] = useState(WARN_COUNTDOWN_S);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const idleMinutesRef = useRef(idleMinutes);

  useEffect(() => { idleMinutesRef.current = idleMinutes; }, [idleMinutes]);

  // 새로고침 시 경고 상태였으면 즉시 로그아웃
  useEffect(() => {
    if (localStorage.getItem(IDLE_WARNED_KEY)) {
      localStorage.removeItem(IDLE_WARNED_KEY);
      onLogout();
    }
  }, [onLogout]);

  const handleChangeIdleMinutes = (v: IdleMinutes) => {
    setIdleMinutes(v);
    localStorage.setItem(IDLE_STORAGE_KEY, String(v));
  };

  // ─── 로그인 시각 ──────────────────────────────────────────────────
  const loginAt = (() => {
    const raw = localStorage.getItem('bazar_admin_login_at');
    if (!raw) return '';
    const d = new Date(raw);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  })();

  const clearCountdown = () => {
    if (countdownRef.current) { clearInterval(countdownRef.current); countdownRef.current = null; }
  };

  const startCountdown = useCallback(() => {
    setCountdown(WARN_COUNTDOWN_S);
    clearCountdown();
    countdownRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearCountdown();
          onLogout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [onLogout]);

  const resetIdleTimer = useCallback(() => {
    if (showIdleModal) return; // 경고 모달 중엔 활동 무시
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    idleTimerRef.current = setTimeout(() => {
      localStorage.setItem(IDLE_WARNED_KEY, '1');
      setShowIdleModal(true);
      startCountdown();
    }, idleMinutesRef.current * 60 * 1000);
  }, [showIdleModal, startCountdown]);

  // 활동 이벤트 감지
  useEffect(() => {
    const events: (keyof DocumentEventMap)[] = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart'];
    events.forEach(e => document.addEventListener(e, resetIdleTimer, { passive: true }));
    resetIdleTimer(); // 초기 타이머 시작
    return () => {
      events.forEach(e => document.removeEventListener(e, resetIdleTimer));
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      clearCountdown();
    };
  }, [resetIdleTimer]);

  // 상품관리 필터 상태
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('전체');
  const [statusFilter, setStatusFilter] = useState('전체');
  const [statFilter, setStatFilter] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;

  // 삭제 확인 모달
  const [deleteTarget, setDeleteTarget] = useState<AdminProduct | null>(null);

  // 상품 상세 모달
  const [detailProduct, setDetailProduct] = useState<AdminProduct | null>(null);

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
    total: baseFiltered.length,
    trade: baseFiltered.filter(p => p.type === '중고거래').length,
    auction: baseFiltered.filter(p => p.type === '경매').length,
    selling: baseFiltered.filter(p => p.status === '경매예정').length,
    inBid: baseFiltered.filter(p => p.status === '경매중').length,
    won: baseFiltered.filter(p => p.status === '낙찰').length,
    failed: baseFiltered.filter(p => p.status === '유찰').length,
    hidden: baseFiltered.filter(p => p.status === '숨김').length,
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
          { key: null, label: '전체 상품', value: stats.total },
          { key: '경매예정', label: '경매예정', value: stats.selling },
          { key: '경매중', label: '경매중', value: stats.inBid },
          { key: '낙찰', label: '낙찰', value: stats.won },
          { key: '유찰', label: '유찰', value: stats.failed },
          { key: '숨김', label: '숨김', value: stats.hidden },
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
                <th>상품</th><th>판매자</th><th>가격</th><th>상태</th><th>등록일</th><th>관리</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map(p => (
                <tr key={p.id}>
                  <td>
                    <div className={styles.productCell}>
                      <img src={p.image} alt={p.name} className={styles.productThumb} />
                      <div>
                        <div className={styles.productName} style={{ cursor: 'pointer', textDecoration: 'underline' }} onClick={() => setDetailProduct(p)}>{p.name}</div>
                        <div className={styles.productCategory}>{p.category}</div>
                      </div>
                    </div>
                  </td>
                  <td>{p.seller}</td>
                  <td>₩{p.price.toLocaleString()}</td>
                  <td>
                    <span className={`${styles.statusBadge} ${p.status === '경매예정' ? styles.statusOn :
                        p.status === '경매중' ? styles.statusBid :
                          p.status === '낙찰' ? styles.statusWon :
                            p.status === '유찰' ? styles.statusFailed :
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
      case '대시보드': return <DashboardPage totalProducts={products.length} />;
      case '상품 관리': return renderProducts();
      case '허위입찰': return <FalseBidPage />;
      case '제재 내역': return <SanctionPage />;
      case '채팅 로그': return <ChatLogPage />;
      case '회원 목록': return <MemberListPage />;
      case '탈퇴 회원': return <WithdrawnMemberPage />;
      case '공지사항': return <NoticePage />;
      case '카테고리/배너': return <BannerPage />;
      case '정산/수수료': return <SettlementPage />;
      case '고객문의/FAQ': return <InquiryPage />;
      case '설정': return (
        <AdminSettingsPage
          idleMinutes={idleMinutes}
          onChangeIdleMinutes={handleChangeIdleMinutes}
        />
      );
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
          <button className={styles.normalBtn} onClick={onSwitchToNormal} title="일반 화면" aria-label="일반 화면으로 이동">
            <svg className={styles.normalIcon} viewBox="0 0 24 24" aria-hidden="true">
              <path d="M3 11.5 12 4l9 7.5" />
              <path d="M5.5 10.5V20h13v-9.5" />
              <path d="M9.5 20v-5.5h5V20" />
            </svg>
          </button>
          <button className={styles.logoutBtn} onClick={onLogout}>로그아웃</button>
        </div>
      </header>

      <div className={styles.body}>
        {/* 사이드바 */}
        <nav className={styles.sidebar}>
          <div className={styles.sidebarMenu}>
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
          </div>
          <div className={styles.sidebarFooter}>
            <div className={styles.adminStatus}>
              <span className={styles.adminStatusLabel}>접속</span>
              <span className={styles.headerClock}>{loginAt || '-'}</span>
            </div>
          </div>
        </nav>

        {/* 메인 컨텐츠 */}
        <main className={styles.main}>
          {renderContent()}
        </main>
      </div>

      {/* 상품 상세 모달 */}
      {detailProduct && (
        <div className={styles.modalOverlay} onClick={() => setDetailProduct(null)}>
          <div className={styles.modal} style={{ width: 400 }} onClick={e => e.stopPropagation()}>
            <img src={detailProduct.image} alt={detailProduct.name} style={{ width: '100%', height: 200, objectFit: 'cover', borderRadius: 10, marginBottom: 16 }} />
            <div className={styles.modalTitle}>{detailProduct.name}</div>
            <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { label: '유형', value: detailProduct.type },
                { label: '카테고리', value: detailProduct.category },
                { label: '판매자', value: detailProduct.seller },
                { label: '가격', value: `₩${detailProduct.price.toLocaleString()}` },
                { label: '상태', value: detailProduct.status },
                { label: '등록일', value: detailProduct.registeredAt },
              ].map(({ label, value }) => (
                <div key={label} style={{ display: 'flex', gap: 8, fontSize: 13 }}>
                  <span style={{ width: 70, color: '#8B8FA8', fontWeight: 600, flexShrink: 0 }}>{label}</span>
                  <span style={{ color: '#1A1A2E', fontWeight: 500 }}>{value}</span>
                </div>
              ))}
            </div>
            <div className={styles.modalBtns} style={{ marginTop: 20 }}>
              <button className={styles.modalCancelBtn} onClick={() => setDetailProduct(null)}>닫기</button>
            </div>
          </div>
        </div>
      )}

      {/* 자동 로그아웃 경고 모달 */}
      {showIdleModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalIcon}>⏱️</div>
            <div className={styles.modalTitle}>자동 로그아웃 예정</div>
            <div className={styles.modalDesc}>
              {idleMinutes}분간 입력이 없었습니다.<br />
              <span className={styles.idleCountdown}>{countdown}초</span> 후 자동으로 로그아웃됩니다.
            </div>
            <div className={styles.modalBtns}>
              <button className={styles.modalDeleteBtn} onClick={onLogout}>로그아웃</button>
            </div>
          </div>
        </div>
      )}

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
