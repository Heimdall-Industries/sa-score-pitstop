import { useWallet } from "@solana/wallet-adapter-react";
import { PublicKey, Transaction, TransactionInstruction } from "@solana/web3.js";
import { floor } from "mathjs";
import * as React from "react";
import styled from "styled-components";
import shallow from "zustand/shallow";
import { BUY_SUPPLY_MODES, CONN, PALLETE } from "../constants";
import { STOP_LOADING_INFO, useLoader } from "../context/LoadingContext";
import { useAppStore, useFleetStore, useResourceStore } from "../data/store";
import {
  ErrorModalTypes,
  InfoModalTypes,
  InvoiceResources, WaitingSignature
} from "../data/types";
import { FleetService } from "../services/fleetService";
import { MarketService } from "../services/marketService";
import { retryAsync } from "../utils";
import { DropdownButton } from "./DropdownButton";
import { DropdownItem } from "./DropdownItem";
import Resource from "./Resource";
import ClaimAtlas from "./ClaimAtlas";
import { Button } from "./shared/Button";
import { TxModal } from "./TxModal";

interface Props {
  currentShipMint?: PublicKey
}

export const FleetResources: React.FC<Props> = ({currentShipMint}) => {
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

  const resorucesFleets = currentShipMint
    ? allFleets.filter(fleet => fleet.shipMint === currentShipMint)
    : selectedFleets.length > 0 ? selectedFleets : allFleets;
  const minFleet = FleetService.findWhoDeplateFirst(resorucesFleets);
  let resourcesSource = minFleet.stats!;

  if (!minFleet) {
    return <></>
  }

  const ammoResource = resourcesData['ammo'];

  return (
    <>
      <Title align="center">ALL FLEETS</Title>
      <ResourceWrapper><Resource {...resourcesData.ammo} /></ResourceWrapper>
      <ResourceWrapper><Resource {...resourcesData.tools} /></ResourceWrapper>
      <ResourceWrapper><Resource {...resourcesData.fuel} /></ResourceWrapper>
      <ResourceWrapper><Resource {...resourcesData.food} /></ResourceWrapper>

      <Actions>
        <SupplyButtons>
          <ClaimAtlas />
          <SupplyButton onClick={onResupplyClick}>RESUPPLY</SupplyButton>
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

export default React.memo(FleetResources);

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
  padding: 8px 16px;
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

const Toggle = styled.div`
  margin: 8px 0;
  display: inline-flex;
  justify-content: end;
  div {
    border-radius: 4px;
    padding: 2px 8px;
    margin: 0 1px;
    border: 1px solid ${PALLETE.BASE_GREY};
    color: ${PALLETE.BASE_GREY};
    font-size: ${PALLETE.FONT_XM};
    cursor: pointer;
    transition: all 0.3s ease;
    background-color: transparent;
    display: flex;
    align-items: center;
    justify-content: space-between;
    &:hover {
      color: ${PALLETE.BASE_GREY_HOVER};
      border: 1px solid ${PALLETE.BASE_GREY_HOVER};
    }
    &.active {
      background-color: ${PALLETE.BASE_GREY};
      color: ${PALLETE.FONT_COLOR};
    }
  }
  @media ${PALLETE.DEVICE.mobileL} {
    justify-content: center;
    padding-top: 24px;
  }
`