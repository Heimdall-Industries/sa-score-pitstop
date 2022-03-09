import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import { Token, TOKEN_PROGRAM_ID } from "@solana/spl-token";

export const NEED_API_KEY = 'YOU NEED AN API KEY FROM FIGMENT.IO';

export const FIGMENT_KEY  = 'YOU NEED AN API KEY FROM FIGMENT.IO';
//  PUT YOUR API KEY HERE   ^^  GET AN API KEY FROM FROM https://datahub.figment.io


const FIGMENT_URL = 'https://solana--mainnet.datahub.figment.io/apikey/' + FIGMENT_KEY;

export const STAR_ATLAS_NFT_URL = 'https://galaxy.staratlas.com/nfts';

export const CONN = new Connection(FIGMENT_URL);

export const FLEET_PROGRAM = new PublicKey("FLEET1qqzpexyaDpqb2DGsSzE2sDCizewCg9WjrA6DBW");

export const ATLAS_MINT = new PublicKey("ATLASXmbPQxBUYbxPsV97usA3fPQYEqzQBUHgiFCUsXx");

export const POLIS_MINT = new PublicKey("poLisWXnNRwC6oBu1vHiuKQzFjGL4XDSu4g9qjz9qVk");

export const standardTokens = {
  ATLAS: 'ATLASXmbPQxBUYbxPsV97usA3fPQYEqzQBUHgiFCUsXx',
  POLIS: 'poLisWXnNRwC6oBu1vHiuKQzFjGL4XDSu4g9qjz9qVk',
  FOOD: 'foodQJAztMzX1DKpLaiounNe2BDMds5RNuPC6jsNrDG',
  FUEL: 'fueL3hBZjLLLJHiFH9cqZoozTG3XQZ53diwFPwbzNim',
  AMMO: 'ammoK8AkX2wnebQb35cDAZtTkvsXQbi82cGeTnUvvfK',
  TOOL: 'tooLsNYLiVqzg8o4m3L2Uetbn62mvMWRqkog6PQeYKL',
};

export const PALLETE = {
  SECONDARY_BG_COLOR: "rgb(37,37,37)",
  FONT_COLOR_SIGN: "#4b4b4b",
  PRIMARY_BG_COLOR: "rgba(0, 0, 0, 0.35)",
  PRIMARY_BG_COLOR_DARK: "#080808",
  PRIMARY_BG_COLOR_HOVER: "#3333337e",
  FONT_COLOR: "#c5c3c3",
  FONT_SM: "13.5px",
  FONT_XM: "12px",
  FONT_MD: "16.5px",
  CLUB_RED: "#d02452d3",
  CLUB_RED_DENSE: "#d02452",
  CLUB_RED_HOVER: "#d3768fd3",
  BASE_GREY: "rgba(40, 70, 110, 0.4)",
  BASE_GREY_DENSE: "rgba(30, 30, 30, 1)",
  BASE_GREY_HOVER: "rgba(0, 0, 0, 0.9)",
  BASE_GREY_BORDER: "rgba(150, 150, 150, 0.2)",

  DEVICE : {
    mobileS: `(max-width: 320px)`,
    mobileM: `(max-width: 375px)`,
    mobileL: `(max-width: 768px)`,
    laptop: `(max-width: 1024px)`,
    laptopL: `(max-width: 1440px)`,
    desktop: `(min-width: 2560px)`,
  }
};

export const REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes

export const COLORS = {
  THICK_RED: "#ff3233",
  THICK_BLUE: "#35fdff",
  THICK_YELLOW: "#ffed33",
  THICK_GREEN: "#c8f829",
  THICK_GREY: "#c5c3c3",
};

export enum BUY_SUPPLY_MODES {
  FULL_TANKS = "FULL TANKS SUPPLY"
}

export type MarketsCredentials = {
  address: PublicKey;
  baseVault: PublicKey;
  quoteVault: PublicKey;
  vaultSigner: PublicKey;
};

export const FOOD_MARKET_CRED: MarketsCredentials = {
  address: new PublicKey("AdL6nGkPe3snPb7TEgSjaN8qCG493iYQqv4DeoCqH53F"),
  baseVault: new PublicKey("7pN9M8KCTPK8mmVDiPZmYPLjY5usoFWDEyNWtCA96Npr"),
  quoteVault: new PublicKey("DuWZwtytgYtSYSfZP5h7LHt3MaER27nSN8fiEmzMSAL2"),
  vaultSigner: new PublicKey("FBcgSh26moJe2XAd7L2oHvXmrnzdVuazuZy8NQwsNi8p"),
};

export const ARMS_MARKET_CRED: MarketsCredentials = {
  address: new PublicKey("8qtV9oq8VcrUHZdEeCJ2bUM3uLwjrfJ9U9FGrCSvu34z"),
  baseVault: new PublicKey("9JHgNyKGQ52LxhZqQKy4QJ5wrNJpL9dWYRqxeXtGz7uo"),
  quoteVault: new PublicKey("C7aoztjKUZGvcD3msBaJi73Rqi99adPumxfuaGBGQ6Mw"),
  vaultSigner: new PublicKey("CwM9Z6nexUcY9T3G4mRZ4sbzrwfywuUPkgbBMBJdDcPe"),
};

export const FUEL_MARKET_CRED: MarketsCredentials = {
  address: new PublicKey("D6rLbJLqi1VvV81ViPScgWiKYcZoTPnMiQTcrmH9X5oQ"),
  baseVault: new PublicKey("2AKDUUhg7LjTntVnBzVVhqhv1favmRmcY21LUp4TiDfd"),
  quoteVault: new PublicKey("5AaPvXwqf5DDnPstiaQPaZow4N9ue1pf2SYy6Gp8Dp1x"),
  vaultSigner: new PublicKey("3rVU7QaoWPy4T1cpj5EmHzbWN1PjuyenNFLntA41boo3"),
};

export const TOOLS_MARKET_CRED: MarketsCredentials = {
  address: new PublicKey("32Pr4MhSD1K4J9buESjjbSZnXWLQ5oHFgB9MhEC2hp6J"),
  baseVault: new PublicKey("BawrmsjgMYqvQBuK3WyqBNrbqygcHXqTcpEkkqRDK5sm"),
  quoteVault: new PublicKey("9rVQSFkuqVuQnPQ85JmiiaJ8NvyJzK49NeZ8QLHrYSXk"),
  vaultSigner: new PublicKey("2aNVwFSFKSADK9wnjSrTVUd7bXK7sEHDp79zuUJSaedB"),
};

export const ATLAS_DEX = new PublicKey(
  "9xQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin"
);

export enum SUPPLIES_NAMES {
  FOOD = "FOOD",
  ARMS = "ARMS",
  FUEL = "FUEL",
  TOOLS = "TOOLS",
}

export const SUPPLIES_MINTS = [
  {
    name: SUPPLIES_NAMES.FOOD,
    token: new Token(
      CONN,
      new PublicKey("foodQJAztMzX1DKpLaiounNe2BDMds5RNuPC6jsNrDG"),
      TOKEN_PROGRAM_ID,
      new Keypair()
    ),
  },
  {
    name: SUPPLIES_NAMES.ARMS,
    token: new Token(
      CONN,
      new PublicKey("ammoK8AkX2wnebQb35cDAZtTkvsXQbi82cGeTnUvvfK"),
      TOKEN_PROGRAM_ID,
      new Keypair()
    ),
  },
  {
    name: SUPPLIES_NAMES.FUEL,
    token: new Token(
      CONN,
      new PublicKey("fueL3hBZjLLLJHiFH9cqZoozTG3XQZ53diwFPwbzNim"),
      TOKEN_PROGRAM_ID,
      new Keypair()
    ),
  },
  {
    name: SUPPLIES_NAMES.TOOLS,
    token: new Token(
      CONN,
      new PublicKey("tooLsNYLiVqzg8o4m3L2Uetbn62mvMWRqkog6PQeYKL"),
      TOKEN_PROGRAM_ID,
      new Keypair()
    ),
  },
];

export const ATLAS_TOKEN = new Token(
  CONN,
  new PublicKey("ATLASXmbPQxBUYbxPsV97usA3fPQYEqzQBUHgiFCUsXx"),
  TOKEN_PROGRAM_ID,
  new Keypair()
);

export const FOOD_TOKEN = new Token(
  CONN,
  new PublicKey("foodQJAztMzX1DKpLaiounNe2BDMds5RNuPC6jsNrDG"),
  TOKEN_PROGRAM_ID,
  new Keypair()
);
export const ARMS_TOKEN = new Token(
  CONN,
  new PublicKey("ammoK8AkX2wnebQb35cDAZtTkvsXQbi82cGeTnUvvfK"),
  TOKEN_PROGRAM_ID,
  new Keypair()
);
export const TOOLS_TOKEN = new Token(
  CONN,
  new PublicKey("tooLsNYLiVqzg8o4m3L2Uetbn62mvMWRqkog6PQeYKL"),
  TOKEN_PROGRAM_ID,
  new Keypair()
);
export const FUEL_TOKEN = new Token(
  CONN,
  new PublicKey("fueL3hBZjLLLJHiFH9cqZoozTG3XQZ53diwFPwbzNim"),
  TOKEN_PROGRAM_ID,
  new Keypair()
);


export const ATLAS_DECIMAL = 1;
export const POLIS_DECIMAL = 2;
export const USDC_DECIMAL = 2;
export const RESOURCE_DECIMAL = 0;
export const FEE = 0.05
export const FIXED_FEE = 1

export const ASSETS: any = {
  IMAGES: {
    'thumb-220': {
      'CALCH.jpg': true,
      'CALEV.jpg': true,
      'CALG.jpg': true,
      'CHI.jpg': true,
      'FBLAIR.jpg': true,
      'FBLBEA.jpg': true,
      'FBLBPL.jpg': true,
      'FBLEBO.jpg': true,
      'FBLEGR.jpg': true,
      'FBLETR.jpg': true,
      'FBLEUN.jpg': true,
      'OGKAJA.jpg': true,
      'OGKAMK.jpg': true,
      'OGKATP.jpg': true,
      'OM.jpg': true,
      'OPALJ.jpg': true,
      'OPALJJ.jpg': true,
      'PC11.jpg': true,
      'PC9.jpg': true,
      'PF4.jpg': true,
      'PR8.jpg': true,
      'PX4.jpg': true,
      'PX5.jpg': true,
      'PX6.jpg': true,
      'TUFAFE.jpg': true,
      'VZUSAM.jpg': true,
      'VZUSOP.jpg': true
    },
    'med-720': {
      'CALCH.jpg': true,
      'CALEV.jpg': true,
      'CALG.jpg': true,
      'CHI.jpg': true,
      'FBLAIR.jpg': true,
      'FBLBEA.jpg': true,
      'FBLBPL.jpg': true,
      'FBLEBO.jpg': true,
      'FBLEGR.jpg': true,
      'FBLETR.jpg': true,
      'FBLEUN.jpg': true,
      'OGKAJA.jpg': true,
      'OGKAMK.jpg': true,
      'OGKATP.jpg': true,
      'OM.jpg': true,
      'OPALJ.jpg': true,
      'OPALJJ.jpg': true,
      'PC11.jpg': true,
      'PC9.jpg': true,
      'PF4.jpg': true,
      'PR8.jpg': true,
      'PX4.jpg': true,
      'PX5.jpg': true,
      'PX6.jpg': true,
      'TUFAFE.jpg': true,
      'VZUSAM.jpg': true,
      'VZUSOP.jpg': true
    }
  }
};
