import { useWallet } from "@solana/wallet-adapter-react";
import * as React from "react";
import styled from "styled-components";
import shallow from "zustand/shallow";
import { PALLETE } from "../constants";
import { useAppStore, useFleetStore, useResourceStore } from "../data/store";
import { IFleet } from "../data/types";
import { FleetService } from "../services/fleetService";
import { Fleet } from "./Fleet";
import { Container } from "./shared/styled/Styled";


const Fleets = () => {
  const { publicKey } = useWallet();
  const { fleets, selectFleet, selectedFleets, unselectFleet } = useFleetStore(
    (state) => ({
      fleets: state.fleets,
      selectedFleets: state.selectedFleets,
      selectFleet: state.selectFleet,
      unselectFleet: state.unselectFleet,
    }),
    shallow
  );
  // const [isLoading, setLoading] = React.useState(false);
  const { appLoading } = useAppStore(
    (state) => ({
      appLoading: state.appLoading,
    }),
    shallow
  );
  const onSelectFleet = (fleet: IFleet) => selectFleet(fleet);
  const onUnSelectFleet = (fleet: IFleet) => unselectFleet(fleet);
 

  const selectAll = () => {
    selectFleet(undefined, "all");
  };

  const unselectAll = () => {
    unselectFleet(undefined, "none");
  };

  const anySelected = () => selectedFleets.length > 0;

  return (
    <Wrapper >
      <Container>
        <FleetWrapper className="fleets-wrapper">
          <div style={{width: '100%'}}>
            <FleetItems>
              {fleets.map((fleet, indx) => (
                <Fleet
                  secondsLeft={FleetService.calculateFleetRemainingTime(fleet)}
                  image={fleet.image}
                  resources={fleet.resources}
                  size={fleet.shipQuantityInEscrow.toNumber()}
                  name={fleet.name}
                  key={indx}
                  rewardsAtlasPerDay={fleet.rewardsAtlasPerDay}
                  shipMint={fleet.shipMint}
                  onSelectFleet={() => onSelectFleet(fleet)}
                  onUnSelectFleet={() => onUnSelectFleet(fleet)}
                  unselectAll={unselectAll}
                  selected={
                    Boolean(selectedFleets.find((sf) => sf.name == fleet.name))
                  }
                />
              ))}

            </FleetItems>
            {/* <Spinner isLoading={isLoading} /> */}
          </div>
        </FleetWrapper>
      </Container>
    </Wrapper>
  );
};

export default React.memo(Fleets);

const Wrapper = styled.div`
  width: 100%;
  padding-bottom: 20px;
`;

const FleetWrapper = styled.div`
  position: relative;
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  padding: 32px 16px;
  color: ${PALLETE.FONT_COLOR};
  border-radius: 4px;
  background-color: rgba(10, 10, 10, 0.6);
  border: solid rgba(85, 230, 255, 0.2);
  border-width: 1px 0 1px 0;
  min-height: 300px;
  overflow-y: auto;
`;

const FleetItems = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;
  width: 100%;
`;
