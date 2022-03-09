import { PublicKey } from '@solana/web3.js';
import {
  ScoreVarsShipInfo,
  ShipStakingInfo,
} from '@staratlas/factory/dist/score.d';

export const tokenProgramId = new PublicKey(
  'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'
);

export const SCORE_PROG_ID = new PublicKey(
  'FLEET1qqzpexyaDpqb2DGsSzE2sDCizewCg9WjrA6DBW'
);

export const standardTokens = {
  ATLAS: 'ATLASXmbPQxBUYbxPsV97usA3fPQYEqzQBUHgiFCUsXx',
  POLIS: 'poLisWXnNRwC6oBu1vHiuKQzFjGL4XDSu4g9qjz9qVk',
  FOOD: 'foodQJAztMzX1DKpLaiounNe2BDMds5RNuPC6jsNrDG',
  FUEL: 'fueL3hBZjLLLJHiFH9cqZoozTG3XQZ53diwFPwbzNim',
  AMMO: 'ammoK8AkX2wnebQb35cDAZtTkvsXQbi82cGeTnUvvfK',
  TOOL: 'tooLsNYLiVqzg8o4m3L2Uetbn62mvMWRqkog6PQeYKL',
};

export const SA_URL = 'https://galaxy.staratlas.com/players/';

export interface SupplyData {
  burnTime: Record<string, number>;
  expiry: Record<string, number>;
  remaining: Record<string, number>;
  remainingPercent: Record<string, number>;
  capacity: Record<string, number>;
  tokenMints: Record<string, PublicKey>;
  expireDate: Date;
  timeRemaining: Duration;
}

interface SupplyDataContanier {
  supplyData: SupplyData;
  shipMint: PublicKey;
}

export interface FleetBase extends ShipStakingInfo, ScoreVarsShipInfo {}

export interface Fleet extends FleetBase, SupplyDataContanier {}
