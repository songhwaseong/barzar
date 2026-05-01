import { PRODUCTS } from './mockData';

export interface MyProduct {
  id: number;
  images: string[];
  mainImageIndex: number;
  title: string;
  category: string;
  condition: string;
  auctionStartPrice: string;
  minBidUnit: string;
  tradeMethod: string;
  description: string;
  location: string;
  auctionDate: string;
  status: '경매예정' | '낙찰' | '숨김';
  price: number;
  timeAgo: string;
}

export const myProductStore: MyProduct[] = [
  {
    id: 1,
    images: [PRODUCTS[0].image],
    mainImageIndex: 0,
    title: PRODUCTS[0].name,
    category: PRODUCTS[0].category,
    condition: PRODUCTS[0].condition,
    auctionStartPrice: '7,000,000',
    minBidUnit: '100,000',
    tradeMethod: '직거래',
    description: '한 번도 사용하지 않은 새 상품입니다. 정품 보증서 포함.',
    location: PRODUCTS[0].location,
    auctionDate: PRODUCTS[0].auctionDate ?? '',
    status: '경매예정',
    price: PRODUCTS[0].price,
    timeAgo: PRODUCTS[0].timeAgo,
  },
  {
    id: 2,
    images: [PRODUCTS[1].image],
    mainImageIndex: 0,
    title: PRODUCTS[1].name,
    category: PRODUCTS[1].category,
    condition: PRODUCTS[1].condition,
    auctionStartPrice: '200,000',
    minBidUnit: '10,000',
    tradeMethod: '택배',
    description: '6개월 사용했으며 스크래치 없습니다.',
    location: PRODUCTS[1].location,
    auctionDate: '',
    status: '낙찰',
    price: PRODUCTS[1].price,
    timeAgo: PRODUCTS[1].timeAgo,
  },
  {
    id: 3,
    images: [PRODUCTS[4].image],
    mainImageIndex: 0,
    title: PRODUCTS[4].name,
    category: PRODUCTS[4].category,
    condition: PRODUCTS[4].condition,
    auctionStartPrice: '250,000',
    minBidUnit: '10,000',
    tradeMethod: '직거래/택배',
    description: '착용 1회 미만 새 제품과 동일합니다. 박스 포함.',
    location: PRODUCTS[4].location,
    auctionDate: PRODUCTS[4].auctionDate ?? '',
    status: '경매예정',
    price: PRODUCTS[4].price,
    timeAgo: '1시간 전',
  },
  {
    id: 4,
    images: [PRODUCTS[2].image],
    mainImageIndex: 0,
    title: PRODUCTS[2].name,
    category: PRODUCTS[2].category,
    condition: PRODUCTS[2].condition,
    auctionStartPrice: '90,000',
    minBidUnit: '5,000',
    tradeMethod: '직거래',
    description: '3년 사용, 패브릭 상태 양호합니다. 분해 가능.',
    location: PRODUCTS[2].location,
    auctionDate: PRODUCTS[2].auctionDate ?? '',
    status: '경매예정',
    price: PRODUCTS[2].price,
    timeAgo: '3시간 전',
  },
  {
    id: 5,
    images: [PRODUCTS[3].image],
    mainImageIndex: 0,
    title: PRODUCTS[3].name,
    category: PRODUCTS[3].category,
    condition: PRODUCTS[3].condition,
    auctionStartPrice: '400,000',
    minBidUnit: '20,000',
    tradeMethod: '직거래',
    description: '2023년 구매, 게임 3종 포함 판매합니다.',
    location: PRODUCTS[3].location,
    auctionDate: '',
    status: '숨김',
    price: PRODUCTS[3].price,
    timeAgo: '5시간 전',
  },
];

export const updateMyProduct = (updated: MyProduct) => {
  const idx = myProductStore.findIndex(p => p.id === updated.id);
  if (idx !== -1) myProductStore[idx] = updated;
};

export const addMyProduct = (product: Omit<MyProduct, 'id'>) => {
  const id = Date.now();
  myProductStore.unshift({ ...product, id });
  return id;
};

export const deleteMyProduct = (id: number) => {
  const idx = myProductStore.findIndex(p => p.id === id);
  if (idx !== -1) myProductStore.splice(idx, 1);
};
