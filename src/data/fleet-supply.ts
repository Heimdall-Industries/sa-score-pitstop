import { PublicKey } from '@solana/web3.js';
import BN from 'bn.js';
import { intervalToDuration } from 'date-fns';
// import assets from '../../common/constants/assets.const';
import { FleetBase, SupplyData } from './types-star-atlas';
import { NFT } from './type-nfts';

const SCORE_PROG_ID = new PublicKey(
  'FLEET1qqzpexyaDpqb2DGsSzE2sDCizewCg9WjrA6DBW'
);

const dummyShip = {
  name: 'unknown',
  symbol: 'unkown',
} as NFT;

interface supplyObject {
  name: string;
  ts: string;
  reserve: string;
  burnRate: string;
  tokenMint: string;
}

export const supplyMap: Record<string, supplyObject> = {
  arms: {
    name: 'arms',
    ts: 'armedAtTimestamp',
    reserve: 'armsMaxReserve',
    burnRate: 'millisecondsToBurnOneArms',
    tokenMint: 'ammoK8AkX2wnebQb35cDAZtTkvsXQbi82cGeTnUvvfK',
  },
  food: {
    name: 'food',
    ts: 'fedAtTimestamp',
    reserve: 'foodMaxReserve',
    burnRate: 'millisecondsToBurnOneFood',
    tokenMint: 'foodQJAztMzX1DKpLaiounNe2BDMds5RNuPC6jsNrDG',
  },
  fuel: {
    name: 'fuel',
    ts: 'fueledAtTimestamp',
    reserve: 'fuelMaxReserve',
    burnRate: 'millisecondsToBurnOneFuel',
    tokenMint: 'fueL3hBZjLLLJHiFH9cqZoozTG3XQZ53diwFPwbzNim',
  },
  toolkit: {
    name: 'toolkit',
    ts: 'repairedAtTimestamp',
    reserve: 'toolkitMaxReserve',
    burnRate: 'millisecondsToBurnOneToolkit',
    tokenMint: 'tooLsNYLiVqzg8o4m3L2Uetbn62mvMWRqkog6PQeYKL',
  },
};

const zeroDuration = {
  hours: 0,
  days: 0,
  minutes: 0,
};

const getSupplyData = (() => {
  return (fleet: any) => {
    const nowDate = new Date();
    const now = nowDate.getTime();

    const burnTime: Record<string, number> = {};
    const expiry: Record<string, number> = {}; //  = {} as calcTracker;
    const remaining: Record<string, number> = {};
    const remainingPercent: Record<string, number> = {};
    const capacity: Record<string, number> = {};
    const tokenMints: Record<string, PublicKey> = {};

    let soonestExpiry = Infinity;

    const supplies = Object.values(supplyMap);

    for (const { name, ts, reserve, burnRate, tokenMint } of supplies) {
      capacity[name] = fleet[reserve];
      tokenMints[name] = new PublicKey(tokenMint);
      burnTime[name] = now - fleet[ts] * 1000;
      remaining[name] = fleet[reserve] - burnTime[name] / fleet[burnRate];
      remainingPercent[name] = remaining[name] / fleet[reserve];
      expiry[name] = now + remaining[name] * fleet[burnRate];
      soonestExpiry = Math.min(expiry[name], soonestExpiry);

      remaining[name] = remaining[name] * fleet.shipQuantityInEscrow;
      capacity[name] = capacity[name] * fleet.shipQuantityInEscrow;
    }

    if (now > soonestExpiry) {
      // resource burn stops once any resource expires (not in service)
      for (const { name, ts, reserve, burnRate } of supplies) {
        burnTime[name] = soonestExpiry - fleet[ts] * 1000;
        remaining[name] = fleet[reserve] - burnTime[name] / fleet[burnRate];
      }
    }

    const expireDate = new Date(soonestExpiry);
    const timeRemaining =
      now > soonestExpiry
        ? zeroDuration
        : intervalToDuration({ start: nowDate, end: expireDate });

    return {
      burnTime,
      capacity,
      expiry,
      remaining,
      remainingPercent,
      expireDate,
      timeRemaining,
      tokenMints,
    };
  };
})();

// const getShipImage = (shipImage: string) => {
//   const imageName: string = shipImage ? shipImage.split('/').pop() || '' : '';
//   return assets['images']['thumb-220'][imageName]
//     ? 'assets/images/thumb-220/' + imageName
//     : shipImage;
// };

const logFleet = (fleet: FleetBase, supplyData: SupplyData, shipSpecs: NFT) => {
  console.groupCollapsed(
    'FLEET ' + shipSpecs.symbol + '  QTY: ' + fleet.shipQuantityInEscrow
  );

  console.group('SUPPY DATA');
  console.log('burnTime', supplyData.burnTime);
  console.log('capacity', supplyData.capacity);
  console.log('expiry', supplyData.expiry);
  console.log('remaining', supplyData.remaining);
  console.log('remainingPercent', supplyData.remainingPercent);
  console.log('expireDate', supplyData.expireDate);
  console.log('timeRemaining', supplyData.timeRemaining);
  console.log('tokenMints', supplyData.tokenMints);
  console.groupEnd();

  console.log('--- FLEET DATA -----------');
  console.log(fleet);
  console.log('--- NFT SPECS ------------');
  console.log(shipSpecs);
  console.groupEnd();
};

export const composeFleetData =
  (nfts: Array<NFT>) => (fleet: FleetBase, index: number) => {
    const mintString = fleet.shipMint.toString();
    const shipSpecs = nfts.find((nft) => nft.mint === mintString) || dummyShip;

    const nowSec = Date.now() / 1000;
    const supplyData = getSupplyData(fleet);

    logFleet(fleet, supplyData, shipSpecs);

    return {
      name: shipSpecs.name,
      symbol: shipSpecs.symbol,

      count: fleet.shipQuantityInEscrow,

      supplyData,
      imageURL: 'NONE', //  getShipImage(shipSpecs?.image),

      rewards: fleet.pendingRewards
        .add(fleet.rewardRatePerSecond.mul(new BN(index)))
        .toNumber(),

      ...Object.entries(fleet).reduce((acc, [key, val]) => {
        acc[key] = val instanceof BN ? val.toNumber() : val;
        return acc;
      }, <{ [key: string]: any }>{}),
    };
  };
