import { Token } from "@solana/spl-token";
import { PublicKey } from "@solana/web3.js";
import {
  getAllFleetsForUserPublicKey,
  getScoreVarsShipInfo,
  ScoreVarsShipInfo,
  ShipStakingInfo
} from "@staratlas/factory";
import axios from "axios";
import { floor } from "mathjs";
import { 
  ASSETS,
  ARMS_TOKEN, 
  BUY_SUPPLY_MODES, 
  COLORS, 
  CONN, 
  FLEET_PROGRAM, 
  FOOD_TOKEN, 
  FUEL_TOKEN, 
  TOOLS_TOKEN,
  REFRESH_INTERVAL,
  STAR_ATLAS_NFT_URL
} from "../constants";
import { 
  useAppStore, 
  useFleetStore, 
  useResourceStore 
} from "../data/store";
import {
  IFleet,
  IInventory,
  InventorySupplies,
  InvoiceResources,
  IResourceData,
  ResourceRemaining,
  TOKENS,
  WaitingSignature
} from "../data/types";
import { 
  getHours, 
  retryAsync, 
  sleep, 
  timeout 
} from "../utils";
import {
  MarketService
} from "./marketService";
import { NFT } from './nft';

const dummyShip = {
  name: 'unknown',
  symbol: 'unkown',
} as NFT;

interface nftResponse {
  data: Array<NFT>
}

interface FleetInfo {
  name: string;
  image: string;
  resources: {[key:string]:ResourceRemaining};
  pendingRewardsV2: number;
}

interface FleetFullData extends IFleet, FleetInfo {}

const nftList: Array<NFT> = [];
const getNFT = (candidate: string) => {
  return nftList.find((next: NFT) => next.mint === candidate) || dummyShip;
};

const calcSecondsToDay = (num: number) => num * 60 * 60 * 24 / 100000000;

const calcResource = (
  fleet: IFleet, 
  res: string, 
  rscData: IResourceData, 
  inventory: IInventory | undefined
) => {

  const getMaxSeconds: Record<string, Function> = {
    ammo: (fleet: IFleet) => fleet.resources.arms.maxSeconds,
    food: (fleet: IFleet) => fleet.resources.food.maxSeconds,
    fuel: (fleet: IFleet) => fleet.resources.fuel.maxSeconds,
    tools: (fleet: IFleet) => fleet.resources.health.maxSeconds,
  };
  const getSecondsLeft: Record<string, Function> = {
    ammo: (fleet: IFleet) => fleet.resources.arms.secondsLeft,
    food: (fleet: IFleet) => fleet.resources.food.secondsLeft,
    fuel: (fleet: IFleet) => fleet.resources.fuel.secondsLeft,
    tools: (fleet: IFleet) => fleet.resources.health.secondsLeft,
  };
  const getMaxUnits: Record<string, Function> = {
    ammo: (fleet: IFleet) => fleet.resources.arms.maxUnits,
    food: (fleet: IFleet) => fleet.resources.food.maxUnits,
    fuel: (fleet: IFleet) => fleet.resources.fuel.maxUnits,
    tools: (fleet: IFleet) => fleet.resources.health.maxUnits,
  };
  const getUnitsLeft: Record<string, Function> = {
    ammo: (fleet: IFleet) => fleet.resources.arms.unitsLeft,
    food: (fleet: IFleet) => fleet.resources.food.unitsLeft,
    fuel: (fleet: IFleet) => fleet.resources.fuel.unitsLeft,
    tools: (fleet: IFleet) => fleet.resources.health.unitsLeft,
  };

  const getSupplies: Record<string, Function> = {
    ammo: (inventory: IInventory | undefined) => !inventory ? 0 : inventory.supplies.arms,
    food: (inventory: IInventory) => !inventory ? 0 : inventory.supplies.food,
    fuel: (inventory: IInventory) => !inventory ? 0 : inventory.supplies.fuel,
    tools: (inventory: IInventory) => !inventory ? 0 : inventory.supplies.tools
  };

  const maxSeconds = getMaxSeconds[res](fleet);
  const maxUnits = getMaxUnits[res](fleet);
  const secondsLeft = getSecondsLeft[res](fleet);
  const unitsLeft = getUnitsLeft[res](fleet);
  const supplies = getSupplies[res](inventory);

  rscData['maxSeconds'] = Math.max(rscData["maxSeconds"], (maxSeconds || 0));
  rscData["secondsLeft"] = rscData["secondsLeft"] === 1 
      ? secondsLeft || 0
      : Math.min(rscData["secondsLeft"], (secondsLeft || 0));
  rscData["unitsNeedToMax"] = rscData["unitsNeedToMax"] + maxUnits - unitsLeft || 
    maxUnits - unitsLeft;
  rscData["maxUnits"] = rscData["maxUnits"] + maxUnits || maxUnits;
  rscData["unitsLeft"] = rscData["unitsLeft"] + unitsLeft || unitsLeft;
  
  if (unitsLeft > 0 && secondsLeft > 0 && rscData["pct1Color"] != COLORS.THICK_RED) {
    rscData["pct1Color"] = COLORS.THICK_BLUE;
  }
  if (unitsLeft == 0 || secondsLeft == 0) {
    rscData["pct1Color"] = COLORS.THICK_RED;
    rscData["isBlinking"] = true;
  }
  if (getHours(secondsLeft) < 12 && rscData["pct1Color"] != COLORS.THICK_RED) {
    rscData["pct1Color"] = COLORS.THICK_YELLOW;
  }
  rscData.pct1 = Math.min(unitsLeft / maxUnits, 1) || 0;

  rscData.pct2 = supplies - rscData["unitsNeedToMax"] >= 0  
    ? 0 
    : Math.abs(supplies - rscData["unitsNeedToMax"]) / maxUnits;

  rscData.unitsNeedToBy = Math.max(0, rscData["unitsNeedToMax"] - supplies);
  rscData.supply = supplies;

};


export class FleetService {

  public static refreshInterval: NodeJS.Timer | undefined = undefined
  
  public static async getNFTS() {
    return new Promise(async (resolve, reject) => {
      const shipNFTS = await axios.get(STAR_ATLAS_NFT_URL);

      for (const nft of shipNFTS.data) {
        nftList.push(nft);
      }
      resolve(nftList);
    });
  }

  public static async getInventorySupplies(pubkey:PublicKey) : Promise<InventorySupplies> {
    await sleep(110);
    return {
      food: await FleetService.getTokenAmmount(FOOD_TOKEN, pubkey),
      arms: await FleetService.getTokenAmmount(ARMS_TOKEN, pubkey),
      fuel: await FleetService.getTokenAmmount(FUEL_TOKEN, pubkey),
      tools: await FleetService.getTokenAmmount(TOOLS_TOKEN, pubkey),
    };
  }

  public static async autoRefresh(publicKey: PublicKey) {
    FleetService.refreshInterval = setInterval(() => {
      if (useAppStore.getState().refreshing) return;
      useAppStore.getState().setRefreshing(true)
      Promise.all([  

        FleetService.getInventorySupplies(publicKey)
          .then((inventorySupplies) => useFleetStore.getState()
            .setInventory({ supplies: inventorySupplies })
          )
          .then(() => FleetService.getAllFleets(publicKey)
            .then((fleets) => useFleetStore.getState().setFleets(fleets))
          ),

        MarketService.getBalanceAtlas(publicKey)
          .then((balance) => useResourceStore.getState().setAtlasBalance(balance)),

        MarketService.getBalancePolis(publicKey)
          .then((balance) => useResourceStore.getState().setPolisBalance(balance))

      ]).finally(() =>  useAppStore.getState().setRefreshing(false))
    }, REFRESH_INTERVAL * 2)
  }

  public static async refresh(publicKey: PublicKey) {
    if (useAppStore.getState().refreshing) return;
    useAppStore.getState().setRefreshing(true)
    Promise.all([ 

      FleetService.getInventorySupplies(publicKey)
        .then((inventorySupplies) => useFleetStore.getState()
          .setInventory({ supplies: inventorySupplies })
        )
        .then(() => FleetService.getAllFleets(publicKey)
          .then((fleets) =>  useFleetStore.getState().setFleets(fleets))
        ),

      MarketService.getBalanceAtlas(publicKey)
        .then((balance) => useResourceStore.getState().setAtlasBalance(balance)),

      MarketService.getBalancePolis(publicKey)
        .then((balance) => useResourceStore.getState().setPolisBalance(balance))

    ]).finally(() =>  useAppStore.getState().setRefreshing(false))
  
  }

  private static async updateFleet (
    fleet: ShipStakingInfo | undefined
    ): Promise<IFleet | null> {
    if (!fleet) {
      return null;
    }
    const shipMint = fleet.shipMint;
    const shipInfo = await getScoreVarsShipInfo(
      CONN,
      FLEET_PROGRAM,
      shipMint
    );

    const shipNftInfo = getNFT(shipMint.toString()) 
    const imageName: string = shipNftInfo.image ? shipNftInfo.image.split('/').pop() || '' : '';
    const imageURL = ASSETS.IMAGES['thumb-220'][imageName] // ['med-720']
      ? 'images/thumb-220/' + imageName
      : shipNftInfo.image;

    const shipCount =  fleet.shipQuantityInEscrow.toNumber();

    const composedFleet = {
      ...fleet,
      name: shipNftInfo.name,
      image: imageURL,
      resources: FleetService.getFleetRemainingResources(shipInfo, fleet),
      pendingRewardsV2: FleetService.getReward(shipInfo, fleet) / 100000000,
      rewardsAtlasPerDay: calcSecondsToDay(shipInfo.rewardRatePerSecond.toNumber()) * shipCount
    };

    console.group('shipInfo');
    console.log('shipInfo', shipInfo);
    console.log('fleet', fleet);
    console.log('AtlasPerDay',shipInfo.rewardRatePerSecond.toNumber(), '|', 
      shipInfo.rewardRatePerSecond.toNumber() * 60 * 60 * 24 / 100000000);
    console.groupEnd();

    return composedFleet;
  }

  public static async getAllFleets(pubKey: PublicKey) : Promise<IFleet[]> {
 
    const fleetsRaw = await retryAsync(
      () => getAllFleetsForUserPublicKey(CONN, pubKey, FLEET_PROGRAM)) ;

    if (!fleetsRaw) {
      return [];
    }

    const fleets: IFleet[] = [];


    while (fleetsRaw.length) {

      await sleep(110);
      const fleetFullData = await this.updateFleet(fleetsRaw.pop());

      if (fleetFullData) { 
        fleets.push(fleetFullData);
      }
    }

    return fleets; 
  }

  public static getFleetRemainingResources(
    shipInfo: ScoreVarsShipInfo, 
    fleet: ShipStakingInfo
  ) : {[key:string]:ResourceRemaining} {
 
    let timePassSinceStart = FleetService.timePassSinceLastAction(fleet);

    return {
      food: FleetService.getRemainFoodDetails(shipInfo, fleet, timePassSinceStart),
      arms: FleetService.getRemainArmsDetails(shipInfo, fleet, timePassSinceStart),
      fuel: FleetService.getRemainFuelDetails(shipInfo, fleet, timePassSinceStart),
      health: FleetService.getRemainHealthDetails(shipInfo, fleet, timePassSinceStart),
    };
 
  }

  public static calculateFleetRemainingTime(fleet: IFleet) : number {
 
    const minTime = Math.min(
      fleet.resources.arms.secondsLeft,
      fleet.resources.food.secondsLeft,
      fleet.resources.fuel.secondsLeft,
      fleet.resources.health.secondsLeft
    );

    return minTime < 0 ? 0 : floor(minTime);
 
  }

  public static getDummyResource(idString: string): IResourceData {
    return {
      id: idString,
      pct1Color: COLORS.THICK_GREY,
      maxSeconds: 0,
      maxUnits: 0,
      unitsNeedToMax: 0,
      burnRate: 0,
      secondsLeft: 1,
      unitsLeft: 0,
      secondsNeedToMax: 0,
      unitsNeedToBy: 0,
      supply: 0,
      isBlinking: false,
      pct1: 0,
      pct2: 0,
      isLoading: false,
    };
  }

  public static calculateResources(
    selectedFleets: IFleet[], 
    inventory: IInventory | undefined) : { [key: string]: IResourceData } {

    const resourcesData: { [key: string]: IResourceData } = {
      ammo: this.getDummyResource(TOKENS.ammo),
      food: this.getDummyResource(TOKENS.food),
      fuel: this.getDummyResource(TOKENS.fuel),
      tools: this.getDummyResource(TOKENS.tools)
    };

    if(!inventory) {
      return resourcesData;
    }

    selectedFleets.forEach((fleet) => {
      calcResource(fleet, 'ammo', resourcesData.ammo, inventory);
      calcResource(fleet, 'food', resourcesData.food, inventory);
      calcResource(fleet, 'fuel', resourcesData.fuel, inventory);
      calcResource(fleet, 'tools', resourcesData.tools, inventory);

      console.log('calculateResource FLEET', fleet);

    });

    return resourcesData;

  }

  public static getPendingAtlas()  {
    return useFleetStore.getState().fleets.reduce((sum, fleet) => {
      return sum + fleet.pendingRewardsV2;
    } ,0)
  }

  public static getPendingSingleFleetAtlas(shipMint: PublicKey)  {   
    return useFleetStore.getState().fleets
      .filter((fleet: IFleet) => fleet.shipMint === shipMint)
      .reduce((sum, fleet) => {
      return sum + fleet.pendingRewardsV2;
    } ,0)
  }


  public static async checkSignatures(
    signatures: WaitingSignature[], 
    payerPublicKey: PublicKey | undefined
  ) {

  let _signatures = signatures.map( sig => ({...sig}))
    let count = 20;
    while (1) {
      try {

        // ! signatures not done yet
        const notYet = _signatures.filter(sig => sig.status != 'finalized')

        // ! getting the updates
        const updatesOnes = await Promise.all(
            notYet.map(sig => 
              retryAsync(async () => {
                    return {
                      hash: sig.hash,
                      status:  (await CONN.getSignatureStatus(sig.hash)).value?.confirmationStatus ||  
                        "processing"
                    };
              })
            )
        )

        // ! updating the store with fresh ones
        const newSigs = _signatures.map((existingSig) => {
          const found = updatesOnes.find((sig) => sig!.hash == existingSig.hash);
          if (found) {
            return found
          } else {
            return existingSig;
          }
        }) as WaitingSignature[];

        _signatures = newSigs.map(sig => ({...sig}))
        useAppStore.getState().setSignaturesToWait(_signatures)

        // ! checking if all done
        const isDone = newSigs.filter(sig => sig.status != 'finalized').length == 0;
        if (isDone) {
          if (payerPublicKey) { this.refresh(payerPublicKey); }
          return true;
        } else {
          count --;
          if (count == 0) {
            useAppStore.getState().setSignaturesToWait( 
              _signatures.map(sig => ({
                ...sig, 
                status: sig.status != 'finalized' ? 'unknown': 'finalized'})
              ) as WaitingSignature[]
            )
            return false;
          }
          await timeout(6000)
        }

      } catch (error) {

      } 
    }
  }

  public static findWhoDeplateFirst(fleets:IFleet[]) :  Partial<IFleet>  {

    if (fleets.length == 0) {
      return  {
        stats: {
          ammo: this.getDummyResource(TOKENS.ammo),
          food: this.getDummyResource(TOKENS.food),
          fuel: this.getDummyResource(TOKENS.fuel),
          tools: this.getDummyResource(TOKENS.tools)
        } 
      } as Partial<IFleet>;
    }

    let minFleet = fleets[0]
    for (const fleet of fleets) {
      const deplationTime = Math.min(
        fleet!.stats!.ammo.secondsLeft,
        fleet!.stats!.food.secondsLeft,
        fleet!.stats!.fuel.secondsLeft,
        fleet!.stats!.tools.secondsLeft,
      )

      const minDeplationTime = Math.min(
        minFleet!.stats!.ammo.secondsLeft,
        minFleet!.stats!.food.secondsLeft,
        minFleet!.stats!.fuel.secondsLeft,
        minFleet!.stats!.tools.secondsLeft,
      )

      if (deplationTime < minDeplationTime) {
        minFleet = fleet;
      }
    }

    return minFleet;
  }

  public static findWhoDeplateLast(fleets:IFleet[]) :  Partial<IFleet>  {

    if (fleets.length == 0) {
      return  {
        stats: {
          ammo: this.getDummyResource(TOKENS.ammo),
          food: this.getDummyResource(TOKENS.food),
          fuel: this.getDummyResource(TOKENS.fuel),
          tools: this.getDummyResource(TOKENS.tools)
        } 
      } as Partial<IFleet>;
    }
    

    let maxFleet = fleets[0]
    for (const fleet of fleets) {
      const deplationTime = Math.min(
        fleet!.stats!.ammo.secondsLeft,
        fleet!.stats!.food.secondsLeft,
        fleet!.stats!.fuel.secondsLeft,
        fleet!.stats!.tools.secondsLeft,
      )

      const maxDeplationTime = Math.min(
        maxFleet!.stats!.ammo.secondsLeft,
        maxFleet!.stats!.food.secondsLeft,
        maxFleet!.stats!.fuel.secondsLeft,
        maxFleet!.stats!.tools.secondsLeft,
      )

      if (deplationTime > maxDeplationTime) {
        maxFleet = fleet;
      }
    }

    return maxFleet;
  }

 public static async checkSignature(signature: WaitingSignature) {
 }

 // ! PRIVATE =======================
  private static getRemainFoodDetails(
    shipInfo: ScoreVarsShipInfo, 
    fleet: ShipStakingInfo, 
    timePassSinceStart: number
  ) : ResourceRemaining {

    const secondsLeft = FleetService.getRemainFoodSec(fleet, timePassSinceStart);
    const unitsBurnRate = 1 / (shipInfo.millisecondsToBurnOneFood / 1000); // Per Second
    const unitsBurnt = unitsBurnRate * timePassSinceStart * fleet.shipQuantityInEscrow.toNumber();
    const unitsLeft = unitsBurnRate * secondsLeft * fleet.shipQuantityInEscrow.toNumber();
    const unitsLeftPct = unitsLeft / 
      (shipInfo.foodMaxReserve * fleet.shipQuantityInEscrow.toNumber());
    const totalSeconds = fleet.foodCurrentCapacity.toNumber();
    const maxSeconds = shipInfo.foodMaxReserve * 
      fleet.shipQuantityInEscrow.toNumber() * 
      (shipInfo.millisecondsToBurnOneFood / 1000 / fleet.shipQuantityInEscrow.toNumber());
    const maxUnits = shipInfo.foodMaxReserve * fleet.shipQuantityInEscrow.toNumber();

    return {
      unitsBurnt,
      unitsLeftPct,
      unitsLeft: unitsLeft,
      secondsLeft: Math.max(0, secondsLeft),
      totalSeconds,
      maxSeconds,
      maxUnits,
      burnRate: unitsBurnRate
    };
 
  }

  private static getRemainArmsDetails(
    shipInfo: ScoreVarsShipInfo, 
    fleet: ShipStakingInfo, 
    timePassSinceStart: number
  ) : ResourceRemaining {
 
    const secondsLeft = FleetService.getRemainArmsSec(fleet, timePassSinceStart);
    const unitsBurnRate = 1 / (shipInfo.millisecondsToBurnOneArms / 1000); // Per Second
    const unitsBurnt = unitsBurnRate * timePassSinceStart * fleet.shipQuantityInEscrow.toNumber();
    const unitsLeft = unitsBurnRate * secondsLeft * fleet.shipQuantityInEscrow.toNumber();
    const unitsLeftPct = unitsLeft / 
      (shipInfo.armsMaxReserve * fleet.shipQuantityInEscrow.toNumber());
    const maxSeconds = shipInfo.armsMaxReserve * 
      fleet.shipQuantityInEscrow.toNumber() * 
      (shipInfo.millisecondsToBurnOneArms / 1000 / fleet.shipQuantityInEscrow.toNumber());
    // this is different than maxSeconds
    const totalSeconds = fleet.armsCurrentCapacity.toNumber();
    const maxUnits = shipInfo.armsMaxReserve * fleet.shipQuantityInEscrow.toNumber();

    return {
      unitsBurnt,
      unitsLeftPct,
      unitsLeft: unitsLeft,
      secondsLeft: Math.max(0, secondsLeft),
      totalSeconds,
      maxSeconds,
      maxUnits,
      burnRate: unitsBurnRate
    };
 
  }

  private static getRemainFuelDetails(
    shipInfo: ScoreVarsShipInfo, 
    fleet: ShipStakingInfo, 
    timePassSinceStart: number
  ) : ResourceRemaining {
 
    const secondsLeft = FleetService.getRemainFuelSec(fleet, timePassSinceStart);
    const unitsBurnRate = 1 / (shipInfo.millisecondsToBurnOneFuel / 1000); // Per Second
    const unitsBurnt = unitsBurnRate * timePassSinceStart * fleet.shipQuantityInEscrow.toNumber();
    const unitsLeft = unitsBurnRate * secondsLeft * fleet.shipQuantityInEscrow.toNumber();
    const unitsLeftPct = unitsLeft / 
      (shipInfo.fuelMaxReserve * fleet.shipQuantityInEscrow.toNumber());
    const totalSeconds = fleet.fuelCurrentCapacity.toNumber();
    const maxSeconds = shipInfo.fuelMaxReserve * 
      fleet.shipQuantityInEscrow.toNumber() * 
      (shipInfo.millisecondsToBurnOneFuel / 1000 / fleet.shipQuantityInEscrow.toNumber());
    const maxUnits = shipInfo.fuelMaxReserve * fleet.shipQuantityInEscrow.toNumber();

    return {
      unitsBurnt,
      unitsLeftPct,
      unitsLeft: unitsLeft,
      secondsLeft: Math.max(0, secondsLeft),
      totalSeconds,
      maxSeconds,
      maxUnits,
      burnRate: unitsBurnRate
    };
 
  }

  private static getRemainHealthDetails(
    shipInfo: ScoreVarsShipInfo, 
    fleet: ShipStakingInfo, 
    timePassSinceStart: number
  ) : ResourceRemaining {
 
    const unitsLeftPct = (fleet.healthCurrentCapacity.toNumber() - timePassSinceStart) / 
      fleet.healthCurrentCapacity.toNumber();
    const secondsLeft = FleetService.getRemainHealthSec(fleet, timePassSinceStart);
    const unitsBurnRate = 1 / (shipInfo.millisecondsToBurnOneToolkit / 1000); 
    const unitsLeft = secondsLeft / 
      (shipInfo.millisecondsToBurnOneToolkit / 1000 / fleet.shipQuantityInEscrow.toNumber());
    const totalSeconds = fleet.healthCurrentCapacity.toNumber();
    const maxSeconds = shipInfo.toolkitMaxReserve * 
      fleet.shipQuantityInEscrow.toNumber() * 
      (shipInfo.millisecondsToBurnOneToolkit / 1000 / fleet.shipQuantityInEscrow.toNumber());
    const maxUnits = shipInfo.toolkitMaxReserve * fleet.shipQuantityInEscrow.toNumber();

    return {
      unitsBurnt: 0,
      unitsLeftPct,
      secondsLeft: Math.max(0, secondsLeft),
      totalSeconds,
      maxSeconds,
      maxUnits,
      unitsLeft: unitsLeft,
      burnRate: unitsBurnRate
    };
 
  }

  private static getRemainFoodSec(
    fleet: ShipStakingInfo, 
    _timePass: number | undefined = undefined
  ) : number {
 
    let timePass = _timePass != undefined ? _timePass : FleetService.getTimePass(fleet);
    let remainTime = fleet.foodCurrentCapacity.toNumber() - timePass;
    // In Seconds

    return remainTime;
 
  }

  private static getRemainArmsSec(
    fleet: ShipStakingInfo, 
    _timePass: number | undefined = undefined
  ) : number {
 
    let timePass = _timePass != undefined ? _timePass : FleetService.getTimePass(fleet);
    let remainTime = fleet.armsCurrentCapacity.toNumber() - timePass;
    // In Seconds
    return remainTime;
 
  }

  private static getRemainFuelSec(
    fleet: ShipStakingInfo, 
    _timePass: number | undefined = undefined
  ) : number {

    let timePass = _timePass != undefined ? _timePass : FleetService.getTimePass(fleet);
    let remainTime = fleet.fuelCurrentCapacity.toNumber() - timePass;
    // In Seconds
    return remainTime;
 
  }

  private static getRemainHealthSec(
    fleet: ShipStakingInfo, 
    _timePass: number | undefined = undefined
  ) : number {
 
    let timePass = _timePass != undefined ? _timePass : FleetService.getTimePass(fleet);
    let remainTime = fleet.healthCurrentCapacity.toNumber() - timePass;
    // In Seconds
    return remainTime;
 
  }

  private static getTimePass(fleet: ShipStakingInfo) : number {
    const now = Date.now() / 1000;
    const tripStart = fleet.currentCapacityTimestamp.toNumber();
    const timePass = now - tripStart;
    return timePass;
  }

  private static timePassSinceLastAction(fleet: ShipStakingInfo) {
    let timePassSinceStart = FleetService.getTimePass(fleet);

    const [foodRemainSec, armsRemainSec, fuelRemainSec, healthRemainSec] = [
      FleetService.getRemainFoodSec(fleet),
      FleetService.getRemainArmsSec(fleet),
      FleetService.getRemainFuelSec(fleet),
      FleetService.getRemainHealthSec(fleet),
    ];

    const depletionTime = Math.min(
      foodRemainSec,
      armsRemainSec,
      fuelRemainSec,
      healthRemainSec
    );

    if (depletionTime < 0) {
      timePassSinceStart = depletionTime + timePassSinceStart;
    }
    return timePassSinceStart;
  }

  private static async getTokenAmmount(token: Token, pubKey: PublicKey) : Promise<number> {
    
    try {
      return (
        await token.getOrCreateAssociatedAccountInfo(pubKey)
      ).amount.toNumber();
    } catch (error) {
      if (((error as any).message as string).includes("Failed to find account")) {
        return 0;
      } else {
        throw error;
      }
    }
  }

  private static getReward ( shipInfo:ScoreVarsShipInfo ,fleet: ShipStakingInfo) : number {
    let timePass = FleetService.getTimePass(fleet);
    let pendingReward = Number(fleet.shipQuantityInEscrow) * 
      (Number(fleet.totalTimeStaked) - Number(fleet.stakedTimePaid) + timePass) * 
      Number(shipInfo.rewardRatePerSecond);
    return pendingReward
  }

}
