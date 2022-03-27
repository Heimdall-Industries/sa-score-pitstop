import * as React from "react";
import { PublicKey } from "@solana/web3.js";
import styled from "styled-components";
import { COLORS, PALLETE } from "../constants";
import { getHours } from "../utils";
import { Clock } from "./Clock";
import { Resources } from "./Resources";
import { ResourceRemaining } from "../data/types";

interface Props {
  name: string;
  secondsLeft: number;
  image: string;
  size: number;
  onSelectFleet: () => void;
  onUnSelectFleet: () => void;
  resources: Record<string, ResourceRemaining>;
  rewardsAtlasPerDay: number;
  selected: boolean,
  shipMint: PublicKey,
  unselectAll: () => void;
}

export const Fleet: React.FC<Props> = ({
  image,
  size,
  name,
  secondsLeft,
  onSelectFleet,
  onUnSelectFleet,
  resources,
  rewardsAtlasPerDay,
  selected,
  shipMint,
  unselectAll
}) => {
  const fleetRef = React.useRef<HTMLDivElement>(null);

  let color = COLORS.THICK_BLUE;
  if (secondsLeft == 0) {
    color = COLORS.THICK_RED;
  }
  if (getHours(secondsLeft) < 12 && color != COLORS.THICK_RED) {
    color = COLORS.THICK_YELLOW;
  }

  const onClick = () => {
    // if (selected) {
    //   onUnSelectFleet();
    // } else {
    //   onSelectFleet();
    // }
  };

  return (
    <Wrapper onClick={onClick} ref={fleetRef}>
      <Header imgUrl={image} />
      <Body>
        <Title>{name}</Title>
        <Count>{size}</Count>
        <RemainingTime>
          <Clock seconds={secondsLeft} color={color} />
        </RemainingTime>
      </Body>
      <ResourcesPanel>
        <Resources currentShipMint={shipMint} rewardsAtlasPerDay={rewardsAtlasPerDay} />
      </ResourcesPanel>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  min-width: 350px;
  width: 100%;
  max-width: 390px;
  padding: 10px 10px 0 10px;
  margin: 12px 8px 0 8px;
  border-radius: 4px;
  border: solid 1px rgba(200, 200, 200, 0.25);
  box-shadow: inset;
  position: relative;
  background: rgb(0, 10, 20);
  @media ${PALLETE.DEVICE.mobileL} {
    width: 47%;
  }
`;

interface HeaderProps {
  imgUrl: string;
}

const Header = styled.div<HeaderProps>`
  background-image: url(${(props) => props.imgUrl});
  background-size: cover;
  background-position: center;
  z-index: 2;
  top: 16px;
  left: 16px;
  right: 16px;
  height: 34%;
  border-radius: 2px;
  position: absolute;
`;

const Body = styled.div`
  position: relative;
  padding: 100px 8px 0px 8px;
  margin: 40px 0 0 0;
  z-index: 10;
  display: flex;
  flex-wrap: wrap;
  border-top: 0;
  background: linear-gradient(0deg, 
    rgb(0 10 20) 0%,
    rgb(0 10 20) 30%,
    rgba(0, 10, 20, 0) 100%
  );
`;

const Count = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 12px;
  border: 1px solid #dbdbdb9b;
  position: absolute;
  background: #101010;
  border-radius: 22px;
  top: 62px;
  right: 4px;
  height: 32px;
  width: 32px;
`;

const RemainingTime = styled.data`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
`;

const Title = styled.div`
  width: 100%;
  text-align: center;
  font-size: 14px;
  font-weight: bold;
`;

const ResourcesPanel = styled.div`
  position: relative;
  z-index: 10;
  width: 100%;
  background: rgb(0 10 20);
  padding: 4px 8px;
  border-radius: 0 0 4px 4px;
`
