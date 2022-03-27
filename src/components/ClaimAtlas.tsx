import { PublicKey, Transaction } from "@solana/web3.js";
import { useWallet } from "@solana/wallet-adapter-react";
import * as React from "react";
import shallow from "zustand/shallow";
import { useAppStore, useFleetStore } from "../data/store";
import { MarketService } from "../services/marketService";
import { FleetService } from "../services/fleetService";
import { ATLAS_DECIMAL, CONN, PALLETE } from "../constants";
import { thousandsFormatter } from "../utils";
import { AtlasIcon } from "./Icons";
import { Button } from "./shared/Button";
import {
  ErrorModalTypes,
  InfoModalTypes,
  WaitingSignature
} from "../data/types";

interface Props {
  currentShipMint?: PublicKey
}

export const ClaimAtlas: React.FC<Props> = ({ currentShipMint }) => {
  const fleets = useFleetStore((state) => state.fleets);
  const { publicKey, signAllTransactions, signTransaction } = useWallet();
  const [totalClaim, setTotalClaim] = React.useState(0);
  const [singleClaim, setSingleClaim] = React.useState(0);

  const {
    isAppLoading,
    startAppLoading,
    stopAppLoading,
    setErrorModal,
    setInfoModal,
    setSignaturesToWait,
  } = useAppStore(
    (state) => ({
      isAppLoading: state.appLoading,
      startAppLoading: state.startAppLoading,
      stopAppLoading: state.stopAppLoading,
      setInfoModal: state.setInfoModal,
      setErrorModal: state.setErrorModal,
      setSignaturesToWait: state.setSignaturesToWait,
    }),
    shallow
  );

  React.useEffect(() => {
    if (fleets.length > 0) {
      setTotalClaim(FleetService.getPendingAtlas());

      if (currentShipMint) {
        setSingleClaim(FleetService.getPendingSingleFleetAtlas(currentShipMint));
      }
    }

  }, [fleets, currentShipMint]);

  const onClaimClick = async () => {
    if (publicKey && signAllTransactions && signTransaction) {
      try {
        const ixs = await MarketService.getHarvestAllInstructions(publicKey, currentShipMint);

        const biIxs: [Transaction, Transaction][] = [...ixs].reduce(
          (g: any[], c) => {
            if (g.length > 0) {
              if (g[g.length - 1].length == 2) {
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

        const latestBlockHash = await (
          await CONN.getRecentBlockhash("finalized")
        ).blockhash;

        const txs = biIxs.map((biIx) =>
          new Transaction({
            feePayer: publicKey,
            recentBlockhash: latestBlockHash,
          }).add(...biIx)
        );

        const signedTxs = await signAllTransactions(txs);

        const signatures = await Promise.all(
          signedTxs.map((signedTx) =>
            CONN.sendRawTransaction(signedTx.serialize())
          )
        );

        const waitingSigntaures = signatures.map<WaitingSignature>(
          (signature) => ({ hash: signature, status: "processing" })
        );
        setSignaturesToWait(waitingSigntaures);
        FleetService.checkSignatures(waitingSigntaures, publicKey);

        setInfoModal({
          modalType: InfoModalTypes.TX_LIST,
          message: `Transactions are Sent. Please track them with Solscan using the following links:`,
          list: signatures,
        });
      } catch (error) {
        console.log(error);
        setErrorModal({
          modalType: ErrorModalTypes.NORMAL,
          message:
            "An error happened while sending transaction. Please try again later.",
        });
      } finally {
        stopAppLoading();
      }
    }
  };

  const claim = currentShipMint ? singleClaim : totalClaim;

  return (
    <Button style={{paddingRight: 0}} onClick={onClaimClick}>
      <span style={{fontSize: '0.9em', marginLeft: '2px'}}>CLAIM</span>
      <span style={{fontWeight: 'bold', marginLeft: '10px'}}>
        {thousandsFormatter(claim, ATLAS_DECIMAL)}
      </span>
      <AtlasIcon height={18} width={18} className="button-token-icon" />
    </Button>
  );
};

export default ClaimAtlas;

