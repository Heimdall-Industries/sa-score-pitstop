import { useWallet } from "@solana/wallet-adapter-react";
import { PublicKey, Transaction, TransactionInstruction } from "@solana/web3.js";
import { floor } from "mathjs";
import * as React from "react";
import styled from "styled-components";
import shallow from "zustand/shallow";
import { BUY_SUPPLY_MODES, CONN, PALLETE } from "../constants";
import { STOP_LOADING_INFO, useLoader } from "../context/LoadingContext";
import { useAppStore, useFleetStore, useResourceStore } from "../data/store";
import { IFleet } from "../data/types";
import {
  ErrorModalTypes,
  InfoModalTypes,
  InvoiceResources, WaitingSignature
} from "../data/types";
import { FleetService } from "../services/fleetService";
import { MarketService } from "../services/marketService";
import { d3Format, retryAsync } from "../utils";
import { DropdownButton } from "./DropdownButton";
import { DropdownItem } from "./DropdownItem";
import { StatsPanel } from './StatsPanel';
import Resource from "./Resource";
import ClaimAtlas from "./ClaimAtlas";
import { Button } from "./shared/Button";
import { TxModal } from "./TxModal";

interface Props {
  currentShipMint?: PublicKey,
  rewardsAtlasPerDay?: number
}

export const Resources: React.FC<Props> = ({currentShipMint, rewardsAtlasPerDay}) => {
  const { selectedFleets, inventory, allFleets } = useFleetStore(
    (state) => ({
      selectedFleets: state.selectedFleets,
      inventory: state.inventory,
      allFleets: state.fleets,
    }),
    shallow
  );
  const { resourcesData, setResourcesData } = useResourceStore(
    (state) => ({
      resourcesData: state.resourcesData,
      setResourcesData: state.setResourcesData,
    }),
    shallow
  );
  const { setErrorModal, setInfoModal, setSignaturesToWait } = useAppStore(
    (state) => ({
      setErrorModal: state.setErrorModal,
      setInfoModal: state.setInfoModal,
      setSignaturesToWait: state.setSignaturesToWait
    }),
    shallow
  );
  const [invoiceModal, setInvoiceModal] = React.useState<{
    open: boolean;
    invoiceResources: InvoiceResources | undefined;
    instructions: TransactionInstruction[];
  }>({
    open: false,
    invoiceResources: undefined,
    instructions: [],
  });

  const [tooltipContent, setTooltipContent] = React.useState("")
  const [tab, setTab] = React.useState('current');

  const [] = React.useState();

  const { setLoadingInfo } = useLoader();

  const { publicKey, signTransaction, signAllTransactions } = useWallet();

  const [buySupplyMode, setBuySupplyMode] = React.useState(BUY_SUPPLY_MODES.FULL_TANKS);

  const [filter, setFilter] = React.useState('min');

  const onResupplyClick = async () => {
    if (inventory && (selectedFleets.length > 0 || allFleets.length > 0)) {
      try {
        if (publicKey && signTransaction && signAllTransactions) {
          setLoadingInfo({ loading: true, message: "Preparing Resupply Transactions", pct: 20 });

          let resupplyIxs = (await retryAsync(() =>
            MarketService.getResupplyAllInstructions(publicKey, buySupplyMode, currentShipMint)
          )) as TransactionInstruction[];
          if (!resupplyIxs) {
            return setErrorModal({
              modalType: ErrorModalTypes.NORMAL,
              message: `There are not enough resources for ${buySupplyMode} resupply mode.`,
            });
          }
          if (resupplyIxs?.length == 0) {
            return setInfoModal({
              modalType: InfoModalTypes.NORMAL,
              message: `Fleet resources are already filled with the required amount of units.`,
            });
          }

          setLoadingInfo({ loading: true, message: "Preparing Resupply Transactions", pct: 60 });
        
          const biIxs: [Transaction, Transaction][] = [...resupplyIxs].reduce(
            (g: any[], c) => {
              if (g.length > 0) {
                if (g[g.length - 1].length == 3) {
                  g.push([c]);
                } else {
                  g[g.length - 1].push(c);
                }
              } else {
                g.push([c]);
              }
              return g;
            },
            [] as any[]
          );

          const latestBlockHash = await (await retryAsync(() =>
            CONN.getRecentBlockhash("finalized")
          ))!.blockhash;

          const txs = biIxs.map((biIx) =>
            new Transaction({
              feePayer: publicKey,
              recentBlockhash: latestBlockHash,
            }).add(...biIx)
          );


          setLoadingInfo({ loading: true, message: "Waiting Transactions For Signing", pct: 90 });

          const signedTxs = (await retryAsync(async () => {
            try {
              return await signAllTransactions(txs);
            } catch (error) {
              if (
                ((error as any).message as string).includes(
                  "User rejected the request"
                )
              ) {
                return [];
              }
              throw error;
            }
          })) as Transaction[];
          if (signedTxs?.length == 0) {
            throw new Error("No Signed Txs");
          }

          const signatures = (await Promise.all(
            signedTxs.map((signedTx) =>
              retryAsync(() => CONN.sendRawTransaction(signedTx.serialize()))
            )
          )) as string[];

          const waitingSigntaures = signatures.map<WaitingSignature>(signature => ({hash: signature, status: 'processing'}));
          setSignaturesToWait(waitingSigntaures)
          FleetService.checkSignatures(waitingSigntaures, publicKey);
          
          setInfoModal({
            modalType: InfoModalTypes.TX_LIST,
            message: `Transactions are Sent. Please track them with Solscan using the following links:`,
            list: signatures,
          });
        }
      } catch (error) {
        console.log(error);

        setErrorModal({
          modalType: ErrorModalTypes.NORMAL,
          message:
            "An error happened while sending transaction. Please try again later.",
        });
      } finally {
        setLoadingInfo(STOP_LOADING_INFO);
      }
    }
  };

  React.useEffect(() => {
    // ! calculate resources for all fleets on the beginning
    if (selectedFleets.length == 0) {
      setResourcesData(FleetService.calculateResources(allFleets, inventory));
    } else {
      setResourcesData(
        FleetService.calculateResources(selectedFleets, inventory)
      );
    }
  }, [selectedFleets, allFleets]);

  const workingFleets = currentShipMint
    ? allFleets.filter((fleet: IFleet) => fleet.shipMint === currentShipMint)
    : selectedFleets.length > 0 ? selectedFleets : allFleets;

  const minFleet = FleetService.findWhoDeplateFirst(workingFleets);

  if (!minFleet) {
    return <></>
  }

  const workingData = FleetService.calculateResources(workingFleets, inventory);

  const toggleTab = () => {
    if (tab === 'current') { setTab('stats'); } else { setTab('current'); }
  }

  const rewardsPerDay = rewardsAtlasPerDay || FleetService.calculateDailyRewards();

  const basic = Boolean(currentShipMint);
  return (
    <>
      {currentShipMint ? null : <Title align="center">ALL FLEETS</Title>}

      <Tabs>
        <div className={'tab' + (tab === 'current' ? ' active' : '')} onClick={toggleTab}>
          Current</div>
        <div className={'tab' + (tab === 'stats' ? ' active' : '')}  onClick={toggleTab}>
          Stats</div>
      </Tabs>

      <TabContent>

        <div className={'resources-current' + (tab === 'current' ? ' active' : '')}>
          <ResourceWrapper><Resource {...workingData.ammo} basic={basic} /></ResourceWrapper>
          <ResourceWrapper><Resource {...workingData.tools} basic={basic} /></ResourceWrapper>
          <ResourceWrapper><Resource {...workingData.fuel} basic={basic} /></ResourceWrapper>
          <ResourceWrapper><Resource {...workingData.food} basic={basic} /></ResourceWrapper>
        </div>

        <div className={'resources-stats' + (tab === 'stats' ? ' active' : '')}>
          <StatsPanel fleets={workingFleets} rewardsPerDay={rewardsPerDay} />
        </div>

      </TabContent>

      <Actions>
        <SupplyButtons>
          <ClaimAtlas currentShipMint={currentShipMint} />
          <SupplyButton onClick={onResupplyClick}>RESUPPLY{basic ? '' : ' ALL'}</SupplyButton>
        </SupplyButtons>
      </Actions>

      <TxModal
        open={invoiceModal.open}
        data={invoiceModal.invoiceResources}
        instructions={invoiceModal.instructions}
        onClose={() =>
          setInvoiceModal({
            invoiceResources: undefined,
            open: false,
            instructions: [],
          })
        }
      />
    </>
  );
};

export default React.memo(Resources);

const ResourcesWrapper = styled.div`
  padding: 32px 0;
  display: flex;
  justify-content: space-evenly;
  flex-wrap: wrap;

  @media ${PALLETE.DEVICE.mobileL} {
    justify-content: space-between;
  }

`;

const ResourceWrapper = styled.div``;

const Actions = styled.div`
  display: flex;
  justify-content: space-around;
  flex-wrap: wrap;
`;

const SupplyButtons = styled.div`
  display: flex;
  flex-wrap: wrap;
  padding: 18px 2px 4px 0;
  min-width: 200px;
  flex: 1;
  justify-content: flex-end;
`;

const SupplyButton = styled(Button)<{ disabled?: boolean }>`
  height: 34px;
  margin: 0 0 8px 12px;
  span {
    display: inline-block;
    width: 10%;
  }
  background: ${(p) => (p.disabled ? "gray" : "inhert")};
  cursor: ${(p) => (p.disabled ? "default" : "inhert")};
  &:active {
    background: ${(p) => (p.disabled ? "gray" : "inhert")};
  }
`;

const Title = styled.h1<{ align?: string }>`
  font-size: 20px;
  line-height: 1;
  padding: 0 0 0.6em 0;
  text-align: ${(p) => p.align ?? "left"};
`;


interface TabProps {
  current?: boolean;
  stats?: boolean;
}

const TabContent = styled.div`
  height: 148px;
  position: relative;

  .resources-current,
  .resources-stats {
    position: absolute;
    width: 100%;
    transition: opacity 400ms;
    pointer-events: none;
    opacity: 0;

    &.active {
      opacity: 1;
      pointer-events: all;
    }
  }

  .resources-stats {
    display: flex;
    justify-content: center;
  }
`;

const Tabs = styled.div<TabProps>`
  padding: 20px 0 0 28px;
  border: solid ${PALLETE.DIVIDER_LINE};
  border-width: 0 0 1px 0;
  display: flex;
  margin: 0 -14px 12px -12px;

  .tab {
    padding: 4px 12px 3px 18px;
    opacity: 0.4;
    border: solid ${PALLETE.DIVIDER_LINE};
    border-width: 1px 1px 0 1px;
    margin: 0 0 0 -4px;
    cursor: pointer;
    border-radius: 24px 5px 0 0;
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: ${PALLETE.TAB_COLOR};

    &:hover {
      opacity: 0.6;
    }
  }
  .tab:first-of-type {
  }
  .tab.active {
    opacity: 1;
    z-index: 2;
    background: rgba(0, 0, 0, 0.8);
    cursor: default;

    &:hover {
      opacity: 1;
    }

  }
`;
