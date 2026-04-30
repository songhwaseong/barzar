export interface Member {
  memberNo: string;
  name: string;
  email: string;
  phone: string;
  joinedAt: string;
  lastLoginAt: string;
  mannerTemp: number;
  salesCount: number;
  purchaseCount: number;
  bidCount: number;
  status: 'active' | 'suspended' | 'permanent' | 'withdrawn';
  suspendUntil?: string;
  reportCount: number;
  sanctionCount: number;
}

export interface MemberTransaction {
  id: number;
  memberNo: string;
  type: 'sale' | 'purchase' | 'bid';
  productName: string;
  amount: number;
  date: string;
  status: 'completed' | 'pending' | 'cancelled';
}

export const MEMBERS: Member[] = [
  {
    memberNo: '2024031500001', name: '김철수', email: 'chulsoo@email.com', phone: '010-1234-5678',
    joinedAt: '2024.03.15', lastLoginAt: '2026.04.29 14:22',
    mannerTemp: 38.5, salesCount: 12, purchaseCount: 8, bidCount: 24,
    status: 'active', reportCount: 1, sanctionCount: 0,
  },
  {
    memberNo: '2024031500002', name: '이영희', email: 'younghee@email.com', phone: '010-2345-6789',
    joinedAt: '2024.03.15', lastLoginAt: '2026.04.28 09:11',
    mannerTemp: 41.2, salesCount: 34, purchaseCount: 5, bidCount: 42,
    status: 'active', reportCount: 0, sanctionCount: 0,
  },
  {
    memberNo: '2024040100009', name: '최민준', email: 'minjun@email.com', phone: '010-9876-5432',
    joinedAt: '2024.04.01', lastLoginAt: '2026.04.27 22:03',
    mannerTemp: 22.1, salesCount: 3, purchaseCount: 0, bidCount: 0,
    status: 'permanent', reportCount: 5, sanctionCount: 2,
  },
  {
    memberNo: '2024062000022', name: '한지훈', email: 'jihoon@email.com', phone: '010-3333-4444',
    joinedAt: '2024.06.20', lastLoginAt: '2026.04.26 18:55',
    mannerTemp: 28.4, salesCount: 7, purchaseCount: 2, bidCount: 11,
    status: 'suspended', suspendUntil: '2026.05.26', reportCount: 3, sanctionCount: 1,
  },
  {
    memberNo: '2024050100011', name: '정수민', email: 'sumin@email.com', phone: '010-5555-6666',
    joinedAt: '2024.05.01', lastLoginAt: '2026.04.29 11:40',
    mannerTemp: 39.8, salesCount: 9, purchaseCount: 15, bidCount: 7,
    status: 'active', reportCount: 0, sanctionCount: 0,
  },
  {
    memberNo: '2024070100025', name: '임채원', email: 'chaewon@email.com', phone: '010-7777-8888',
    joinedAt: '2024.07.01', lastLoginAt: '2026.04.29 08:30',
    mannerTemp: 43.5, salesCount: 21, purchaseCount: 19, bidCount: 33,
    status: 'active', reportCount: 0, sanctionCount: 0,
  },
  {
    memberNo: '2024080100028', name: '송하은', email: 'haeun@email.com', phone: '010-1111-2222',
    joinedAt: '2024.08.01', lastLoginAt: '2026.04.28 21:15',
    mannerTemp: 37.9, salesCount: 6, purchaseCount: 11, bidCount: 5,
    status: 'active', reportCount: 1, sanctionCount: 0,
  },
  {
    memberNo: '2024091500037', name: '박지영', email: 'jiyoung@email.com', phone: '010-4444-5555',
    joinedAt: '2024.09.15', lastLoginAt: '2026.04.27 16:44',
    mannerTemp: 40.1, salesCount: 4, purchaseCount: 22, bidCount: 18,
    status: 'active', reportCount: 2, sanctionCount: 0,
  },
  {
    memberNo: '2024100100041', name: '스니커즈1', email: 'sneakers1@email.com', phone: '010-6666-7777',
    joinedAt: '2024.10.01', lastLoginAt: '2026.04.28 23:58',
    mannerTemp: 31.2, salesCount: 1, purchaseCount: 0, bidCount: 3,
    status: 'suspended', suspendUntil: '2026.05.15', reportCount: 2, sanctionCount: 1,
  },
  {
    memberNo: '2024110100046', name: '권나영', email: 'nayoung@email.com', phone: '010-8888-9999',
    joinedAt: '2024.11.01', lastLoginAt: '2026.04.29 13:22',
    mannerTemp: 36.7, salesCount: 2, purchaseCount: 8, bidCount: 14,
    status: 'active', reportCount: 0, sanctionCount: 0,
  },
  {
    memberNo: '2025010100051', name: '류지호', email: 'jiho@email.com', phone: '010-2222-3333',
    joinedAt: '2025.01.01', lastLoginAt: '2026.04.25 10:00',
    mannerTemp: 27.8, salesCount: 5, purchaseCount: 1, bidCount: 0,
    status: 'withdrawn', reportCount: 3, sanctionCount: 0,
  },
  {
    memberNo: '2025030100055', name: '백승우', email: 'seungwoo@email.com', phone: '010-3456-7890',
    joinedAt: '2025.03.01', lastLoginAt: '2026.04.24 08:11',
    mannerTemp: 35.0, salesCount: 0, purchaseCount: 4, bidCount: 9,
    status: 'active', reportCount: 1, sanctionCount: 0,
  },
];

export const MEMBER_TRANSACTIONS: MemberTransaction[] = [
  { id: 1, memberNo: '2024031500001', type: 'sale', productName: '나이키 조던 1', amount: 320000, date: '2026.04.20', status: 'completed' },
  { id: 2, memberNo: '2024031500001', type: 'purchase', productName: '소니 WH-1000XM5', amount: 265000, date: '2026.04.15', status: 'completed' },
  { id: 3, memberNo: '2024031500001', type: 'bid', productName: '맥북 프로 M2', amount: 960000, date: '2026.04.10', status: 'cancelled' },
  { id: 4, memberNo: '2024031500001', type: 'sale', productName: 'PS5 디스크 에디션', amount: 490000, date: '2026.03.28', status: 'completed' },
  { id: 5, memberNo: '2024031500001', type: 'purchase', productName: '에어팟 프로 2세대', amount: 180000, date: '2026.03.15', status: 'completed' },
  { id: 6, memberNo: '2024040100009', type: 'sale', productName: '소니 A7IV 카메라', amount: 1250000, date: '2026.04.01', status: 'cancelled' },
  { id: 7, memberNo: '2024040100009', type: 'sale', productName: '다이슨 V15', amount: 480000, date: '2026.03.20', status: 'pending' },
  { id: 8, memberNo: '2024062000022', type: 'sale', productName: '나이키 오프화이트', amount: 850000, date: '2026.04.10', status: 'cancelled' },
  { id: 9, memberNo: '2024070100025', type: 'sale', productName: '캐논 EOS R6', amount: 2650000, date: '2026.04.22', status: 'completed' },
  { id: 10, memberNo: '2024070100025', type: 'purchase', productName: '로랜드 피아노', amount: 1650000, date: '2026.04.18', status: 'completed' },
];
