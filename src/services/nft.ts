export interface NFT {
  _id: string;
  deactivated: boolean;
  name: string;
  description: string;
  image: string;
  media: Media;
  attributes: Attributes;
  symbol: string;
  markets: Market[];
  totalSupply?: number;
  mint: string;
  network?: string;
  tradeSettings: TradeSettings;
  airdrops: Airdrop[];
  primarySales: (
    | PrimarySale
    | PrimarySales2
    | PrimarySales3
    | PrimarySales4
    | PrimarySales5
    | PrimarySales6
    | PrimarySales7
  )[];
  updatedAt: string;
  collection: Collection;
  slots: Slots;
  id: string;
  createdAt?: string;
}

interface Slots {
  crewSlots?: CrewSlot[];
  componentSlots?: CrewSlot[];
  moduleSlots?: CrewSlot[];
}

interface CrewSlot {
  type: string;
  size: string;
  quantity: number;
}

interface Collection {
  name: string;
  family: string;
}

interface PrimarySales7 {
  listTimestamp: number;
  id?: any;
}

interface PrimarySales6 {
  supply: number;
  isMinted: boolean;
  mintTimestamp: number;
  isListed: boolean;
  listTimestamp: number;
  orderId?: any;
  expireTimestamp: number;
  id?: any;
}

interface PrimarySales5 {
  _id: string;
  listTimestamp: number;
  supply: number;
  price: number;
  isMinted: boolean;
  isListed: boolean;
  mintTimestamp: number;
  id: string;
}

interface PrimarySales4 {
  supply: number;
  isMinted: boolean;
  mintTimestamp?: any;
  isListed: boolean;
  listTimestamp: number;
  orderId?: any;
  expireTimestamp: number;
  id?: any;
}

interface PrimarySales3 {
  _id: string;
  listTimestamp: number;
  supply: number;
  price: number;
  targetPair: string;
  isMinted: boolean;
  isListed: boolean;
  mintTimestamp: number;
  quotePrice: number;
  id: string;
}

interface PrimarySales2 {
  supply: number;
  isMinted: boolean;
  mintTimestamp: number;
  isListed: boolean;
  listTimestamp: number;
  orderId?: any;
  id?: any;
}

interface PrimarySale {
  supply: number;
  isMinted: boolean;
  mintTimestamp?: any;
  isListed: boolean;
  listTimestamp: number;
  orderId?: any;
  id?: any;
}

interface Airdrop {
  _id: string;
  supply: number;
  id: number;
}

interface TradeSettings {
  expireTime?: number;
  saleTime?: number;
  vwap: number;
  msrp?: Msrp;
}

interface Msrp {
  value: number;
  currencySymbol: string;
}

interface Market {
  _id?: string;
  id: string;
  quotePair: string;
  serumProgramId?: string;
}

interface Attributes {
  itemType: string;
  tier?: number;
  class: string;
  category?: string;
  score?: number;
  rarity: string;
  musician?: string;
  spec?: string;
  make?: string;
  model?: string;
  unitLength?: number;
  unitWidth?: number;
  unitHeight?: number;
}

interface Media {
  qrInstagram: string;
  qrFacebook: string;
  sketchfab: string;
  audio: string;
  thumbnailUrl: string;
  gallery?: string[];
}
