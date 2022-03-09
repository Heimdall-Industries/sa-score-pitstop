import { DexInstructions, Market} from "@project-serum/serum";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  Token,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { 
  Account, 
  Keypair, 
  PublicKey, 
  TransactionInstruction 
} from "@solana/web3.js";
import { 
  createHarvestInstruction, 
  createRearmInstruction, 
  createRefeedInstruction, 
  createRefuelInstruction, 
  createRepairInstruction 
} from "@staratlas/factory";
import axios from "axios";
import { ceil, floor, round } from "mathjs";
import { 
  ARMS_MARKET_CRED, 
  ARMS_TOKEN, 
  ATLAS_DEX, 
  ATLAS_MINT, 
  BUY_SUPPLY_MODES, 
  CONN, 
  FLEET_PROGRAM, 
  FOOD_MARKET_CRED, 
  FOOD_TOKEN, 
  FUEL_MARKET_CRED, 
  FUEL_TOKEN, 
  MarketsCredentials, 
  POLIS_MINT,
  SUPPLIES_MINTS, 
  SUPPLIES_NAMES, 
  TOOLS_MARKET_CRED, 
  TOOLS_TOKEN 
} from "../constants";
import { 
  useAppStore, 
  useFleetStore 
} from "../data/store";
import {
  ErrorModalTypes, 
  IFleet,
  InvoiceResources, 
  MarketPriceDetail, 
  MarketPriceResources 
} from "../data/types";
import { 
  retryAsync,
  sleep
} from "../utils";


export class MarketService  {  

  public static FOOD_MARKET : Market | undefined = undefined;
  public static ARMS_MARKET : Market | undefined = undefined;
  public static FUEL_MARKET : Market | undefined = undefined;
  public static TOOLS_MARKET : Market | undefined = undefined;

  // ! PUBLIC METHODS ======================
  public static async getSuppliesMarketPrices() : Promise<MarketPriceResources|undefined> {
    console.error('getSuppliesMarketPrices()');
    return undefined;
  }

  public static async getBalanceAtlas(pubKey: PublicKey) : Promise<number> {
  
    return new Token(CONN, ATLAS_MINT, TOKEN_PROGRAM_ID, new Keypair())
    .getOrCreateAssociatedAccountInfo(pubKey)
    .then((data) => {
      return round(Number(data.amount) / 100000000 ,3)
    })
    .catch((error) => {
      console.log(error);
      return 0;
    });
  
  }

  public static async getBalancePolis(pubKey: PublicKey) : Promise<number> {
  
    return new Token(CONN, POLIS_MINT, TOKEN_PROGRAM_ID, new Keypair())
    .getOrCreateAssociatedAccountInfo(pubKey)
    .then((data) => {
      return round(Number(data.amount) / 100000000 ,3)
    })
    .catch((error) => {
      console.log(error);
      return 0;
    });
  
  }


  public static async makeCreateAssociatedTokensAccountsInstructions (
    publicKey: PublicKey
  ) : Promise<{ix: TransactionInstruction, name: string}[]>  {
    
    let tokens_accounts = await Promise.all(SUPPLIES_MINTS.map(async (el) => {
      return {
        account: await MarketService.getAssociatedTokenAddress(publicKey, el.token.publicKey),
        mint: el.token.publicKey,
        name: el.name
      };
    }));

    let token_accounts_data = await Promise.all(tokens_accounts.map(async (el) => {
      return {
        account: el.account,
        data: await CONN.getAccountInfo(el.account),
        mint: el.mint,
        name: el.name
      }
    }));
  
    let accounts_2_create = (token_accounts_data.filter((el) => {
      
      if (el.data === null) {
        return true
      };

      return false;

    }));

    if (accounts_2_create.length === 0) {
      return [];
    }

    let ixs = accounts_2_create.map((el)=> {
      return {
        ix: Token.createAssociatedTokenAccountInstruction(
              ASSOCIATED_TOKEN_PROGRAM_ID,
              TOKEN_PROGRAM_ID,
              el.mint,
              el.account,
              publicKey,
              publicKey,
            ),
        name: el.name
      };
    });

    return ixs;
  }


  public static async loadMarkets() : Promise<void> {
    MarketService.FOOD_MARKET = await retryAsync(() => 
      Market.load(CONN, FOOD_MARKET_CRED.address, {}, ATLAS_DEX));

    await sleep(110);
    MarketService.ARMS_MARKET = await retryAsync(() => 
      Market.load(CONN, ARMS_MARKET_CRED.address, {}, ATLAS_DEX));

    await sleep(110);
    MarketService.FUEL_MARKET = await retryAsync(() => 
      Market.load(CONN, FUEL_MARKET_CRED.address, {}, ATLAS_DEX));

    await sleep(110);
    MarketService.TOOLS_MARKET = await retryAsync(() => 
      Market.load(CONN, TOOLS_MARKET_CRED.address, {}, ATLAS_DEX));
  }

  public static async getHarvestAllInstructions(
    player: PublicKey, 
    shipMint: PublicKey | undefined
  ): Promise<TransactionInstruction[]> {
    let atlasAccount = await MarketService.getAssociatedTokenAddress(player, ATLAS_MINT);
    const ixs = (await Promise.all(useFleetStore.getState().fleets
      .map(async (fleet) => {
        if (fleet.pendingRewardsV2 > 0 && (!shipMint || fleet.shipMint === shipMint)) {
          return await createHarvestInstruction(
              CONN, 
              player,
              atlasAccount,
              new PublicKey(fleet.shipMint),
              FLEET_PROGRAM
          )
        }
      })
    )).filter(ix => !!ix) as  TransactionInstruction[];

    return ixs;
  }

  public static async getResupplyAllInstructions(
    player: PublicKey, 
    buySupplyMode: BUY_SUPPLY_MODES,
    currentShipMint: PublicKey | undefined
  ): Promise<TransactionInstruction[] | undefined> {
    
    const createReArmIx = async (qty: number, shipmint: PublicKey) => {
        return createRearmInstruction(
            CONN, 
            player, 
            player, 
            qty, 
            shipmint, 
            ARMS_TOKEN.publicKey, 
            await MarketService.getAssociatedTokenAddress(player, ARMS_TOKEN.publicKey), 
            FLEET_PROGRAM)
    };

    const createReFeedIx = async (qty: number, shipmint: PublicKey) => {
        return createRefeedInstruction(
            CONN, 
            player, 
            player, 
            qty, shipmint, 
            FOOD_TOKEN.publicKey, 
            await MarketService.getAssociatedTokenAddress(player, FOOD_TOKEN.publicKey), 
            FLEET_PROGRAM)
    };

    const createRefuelIx = async (qty: number, shipmint: PublicKey) => {
        return createRefuelInstruction(
            CONN, 
            player, 
            player, 
            qty, shipmint, 
            FUEL_TOKEN.publicKey, 
            await MarketService.getAssociatedTokenAddress(player, FUEL_TOKEN.publicKey), 
            FLEET_PROGRAM)
    };

    const createRepairIx = async (qty: number, shipmint: PublicKey) => {
        return createRepairInstruction(
            CONN, 
            player, 
            player, 
            qty, 
            shipmint, 
            TOOLS_TOKEN.publicKey, 
            await MarketService.getAssociatedTokenAddress(player, TOOLS_TOKEN.publicKey), 
            FLEET_PROGRAM)
    };

    // ? checking if we can supply based on mode
    const {selectedFleets, inventory, fleets} = useFleetStore.getState();
    let fleetsToResupply = selectedFleets
      .filter((fleet: IFleet) => currentShipMint ? fleet.shipMint === currentShipMint : true);
    if (selectedFleets.length == 0) {
      fleetsToResupply = fleets
        .filter((fleet: IFleet) => currentShipMint ? fleet.shipMint === currentShipMint : true);
    }


    const supplyStorage = {
      food: inventory!.supplies.food,
      arms: inventory!.supplies.arms,
      tools: inventory!.supplies.tools,
      fuel: inventory!.supplies.fuel
    }
  
    // ! FULL TANK
    if (buySupplyMode == BUY_SUPPLY_MODES.FULL_TANKS) {
  
      fleetsToResupply.forEach((fleet: IFleet) => {
        supplyStorage.food -= Math.max(
          fleet.resources.food.maxUnits - fleet.resources.food.unitsLeft, 
          0
        ); 
        supplyStorage.fuel -= Math.max(
          fleet.resources.fuel.maxUnits - fleet.resources.fuel.unitsLeft, 
          0
        ); 
        supplyStorage.tools -= Math.max(
          fleet.resources.health.maxUnits - fleet.resources.health.unitsLeft, 
          0
        ); 
        supplyStorage.arms -= Math.max(
          fleet.resources.arms.maxUnits - fleet.resources.arms.unitsLeft, 
          0
        ); 
      })
  
      // ? supply is not enough
      if (floor(Math.min(...Object.values(supplyStorage))) < 0) {
        return undefined;
      }
      
      // ? building the instructions
      let res = await Promise.all(fleetsToResupply.map(async (fleet: IFleet) => {
        let shipPk = new PublicKey(fleet.shipMint);
        const ixs: TransactionInstruction[] = []; 

        if (ceil(fleet.resources.food.maxUnits - fleet.resources.food.unitsLeft) > 1 ) {
          ixs.push(await createReFeedIx(
              ceil(fleet.resources.food.maxUnits - fleet.resources.food.unitsLeft), 
              shipPk
            )
          ) 
        }
        if ( ceil(fleet.resources.fuel.maxUnits - fleet.resources.fuel.unitsLeft) > 1 ) {
          ixs.push(await createRefuelIx(
              ceil(fleet.resources.fuel.maxUnits - fleet.resources.fuel.unitsLeft), 
              shipPk
            )
          )
        }
        if ( ceil(fleet.resources.arms.maxUnits - fleet.resources.arms.unitsLeft) > 1 ) {
          ixs.push(await createReArmIx(
              ceil(fleet.resources.arms.maxUnits - fleet.resources.arms.unitsLeft), 
              shipPk
            )
          )
        }
        if ( ceil(fleet.resources.health.maxUnits - fleet.resources.health.unitsLeft) > 1 ) {
          ixs.push(await createRepairIx(
              ceil(fleet.resources.health.maxUnits - fleet.resources.health.unitsLeft), 
              shipPk
            )
          )
        }

        return ixs;

      }))
      return res.flat()
  
    } else {
      console.error ('APP ONLY SUPPORTS BUY_SUPPLY_MODES.FULL_TANKS');
    }
    
  }



  private static allMarketsLoaded() : boolean {
    return Boolean(
      MarketService.ARMS_MARKET && 
      MarketService.FOOD_MARKET && 
      MarketService.FUEL_MARKET && 
      MarketService.TOOLS_MARKET
    );
  }

  private static async getAssociatedTokenAddress(
    owner: PublicKey, 
    mint: PublicKey
  ) : Promise<PublicKey> {
  
    const [address] = await PublicKey.findProgramAddress(
      [owner.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), mint.toBuffer()],
      ASSOCIATED_TOKEN_PROGRAM_ID
    );
    return address;
  }

}
