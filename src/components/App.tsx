import { useWallet } from "@solana/wallet-adapter-react";
import React from "react";
import styled from "styled-components";
import shallow from "zustand/shallow";
import { PALLETE } from "../constants";
import { LoadingProvider } from "../context/LoadingContext";
import { useAppStore, useFleetStore, useResourceStore } from "../data/store";
import { FleetService } from "../services/fleetService";
import { MarketService } from "../services/marketService";
import AppSpinner from "./AppSpinner";
import { Content } from "./Content";
import { ErrorModal } from "./ErrorModal";
import Fleet from "./Fleets";
import { Header } from "./Header";
import { InfoModal } from "./InfoModal";
import { Container } from "./shared/styled/Styled";
import Spinner from "./Spinner";
import { Starter } from "./Starter";

function App() {
  const { publicKey, connecting, disconnecting } = useWallet();
  const isRefreshing = useAppStore((state) => state.refreshing);
  const { setFleets, delFleets, resetFleets, setInventory } = useFleetStore(
    (state) => ({
      fleets: state.fleets,
      selectedFleets: state.selectedFleets,
      setFleets: state.setFleets,
      delFleets: state.delFleets,
      selectFleet: state.selectFleet,
      unselectFleet: state.unselectFleet,
      setInventory: state.setInventory,
      resetFleets: state.reset,
    }),
    shallow
  );
  const setAtlasBalance = useResourceStore((state) => state.setAtlasBalance);
  const setPolisBalance = useResourceStore((state) => state.setPolisBalance);
  const { appLoading, stopAppLoading, startAppLoading, resetApp } = useAppStore(
    (state) => ({
      appLoading: state.appLoading,
      startAppLoading: state.startAppLoading,
      stopAppLoading: state.stopAppLoading,
      resetApp: state.reset,
    }),
    shallow
  );

  React.useEffect(() => {
    if (publicKey) {
      startAppLoading({
        loading: true,
        pct: 2,
        message: "Loading Market Data",
      });
      MarketService.loadMarkets()
        .then(() =>
          startAppLoading({
            loading: true,
            pct: 25,
            message: "Loading Fleets & Inventory Data",
          })
        )
        FleetService.getNFTS()
        .then(() =>
          FleetService.getInventorySupplies(
            publicKey
          ).then((inventorySupplies) =>
            setInventory({ supplies: inventorySupplies })
          )
        )
        .then(() =>
          FleetService.getAllFleets(publicKey).then((fleets) =>
            setFleets(fleets)
          )
        )
        .then(() =>
          startAppLoading({
            loading: true,
            pct: 84,
            message: "Loading Balance Data",
          })
        )
        .then(() =>
          MarketService.getBalanceAtlas(publicKey).then((balance) =>
            setAtlasBalance(balance)
          )
        )
        .then(() =>
          MarketService.getBalancePolis(publicKey).then((balance) =>
            setPolisBalance(balance)
          )
        )
        .then(() =>
          startAppLoading({ loading: true, pct: 100, message: "Done" })
        )
        .finally(() => {
          FleetService.autoRefresh(publicKey);
          stopAppLoading();
        });
    } else {
      delFleets();
    }
  }, [publicKey]);

  React.useEffect(() => {
    if (disconnecting) {
      if (FleetService.refreshInterval) {
        clearInterval(FleetService.refreshInterval);
      }
      resetApp();
      resetFleets();
    }
  }, [disconnecting]);

  if (!publicKey) {
    return <Starter />;
  }

  return (
    <>
      {appLoading.loading ? (
        <></>
      ) : (
        <LoadingProvider>
          <Header isRefreshing={isRefreshing} />
          <Content />
          <Fleet />
        </LoadingProvider>
      )}
      <ErrorModal />
      <InfoModal />
      <AppSpinner />
    </>
  );
}

export default App;

