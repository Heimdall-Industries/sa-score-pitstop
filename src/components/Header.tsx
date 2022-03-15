import * as React from "react";
import styled, { keyframes } from "styled-components";
import shallow from "zustand/shallow";
import { Tooltip } from 'react-tippy';
import { FaExternalLinkSquareAlt } from 'react-icons/fa';
import { d3Format } from '../utils';
import { 
  ATLAS_DECIMAL, 
  POLIS_DECIMAL, 
  PALLETE, 
  RESOURCE_DECIMAL,
  FOOD_MARKET_CRED, 
  ARMS_MARKET_CRED,
  FUEL_MARKET_CRED,
  TOOLS_MARKET_CRED
} from "../constants";
import { useFleetStore, useResourceStore } from "../data/store";
import { MarketService } from "../services/marketService";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { AtlasIcon, PolisIcon, ResourceIcon } from "./Icons";
import { Container } from "./shared/styled/Styled";
import { thousandsFormatter } from "../utils";
import { ReactComponent as LoadingSpinner } from "../assets/images/spinner.svg";
import RefreshButton from './RefreshButton';

const foodURL = 'https://play.staratlas.com/market/' + FOOD_MARKET_CRED.address.toString();
const armsURL = 'https://play.staratlas.com/market/' + ARMS_MARKET_CRED.address.toString();
const fuelURL = 'https://play.staratlas.com/market/' + FUEL_MARKET_CRED.address.toString();
const toolURL = 'https://play.staratlas.com/market/' + TOOLS_MARKET_CRED.address.toString();

const tooltipContents = (qty: number, id: string, url: string) => {
  return (
    <div>
      <div className="resource-row">
        <div className="resource-name">{d3Format(qty)}</div>
        <div className="resource-percent">{id}</div>
      </div>
      <div className="resource-units">
        <a href={url} target="_blank">
          <div className="text">Buy {id}</div>
          <FaExternalLinkSquareAlt />
        </a>
      </div>
    </div>
  );
};

const tokenContents = (qty: number, id: string) => {
  return (
    <div>
      <div className="resource-row"><div className="resource-name">{id}</div></div>
      <div className="resource-units">{thousandsFormatter(qty, POLIS_DECIMAL)}</div>
    </div>
  );
};

export const Header = (props: { isRefreshing: boolean }) => {

  const { atlasBalance, setAtlasBalance } = useResourceStore(
    (state) => ({
      atlasBalance: state.atlasBalance,
      setAtlasBalance: state.setAtlasBalance,
    }),
    shallow
  );

  const { polisBalance, setPolisBalance } = useResourceStore(
    (state) => ({
      polisBalance: state.polisBalance,
      setPolisBalance: state.setPolisBalance,
    }),
    shallow
  );

  const inventory = useFleetStore((state) => state.inventory);
  const [loading, setLoading] = React.useState(false);

  const fuelQty = inventory?.supplies.fuel || 0;
  const armsQty = inventory?.supplies.arms || 0;
  const foodQty = inventory?.supplies.food || 0;
  const toolQty = inventory?.supplies.tools || 0;

  return (
    <Wrapper className="header-wrapper">
      <Container>
        <Nav>
          <Menu className="header-bar">
            <Stats>
              <Tooltip trigger={'click'} arrow interactive
                html={tooltipContents(fuelQty, 'Fuel', fuelURL)}>
                <ResourceDisplay>
                  <ResourceIcon fuel />{thousandsFormatter(fuelQty, RESOURCE_DECIMAL)}
                  </ResourceDisplay>
              </Tooltip>

              <Tooltip trigger={'click'} arrow interactive
                html={tooltipContents(foodQty, 'Food', foodURL)}>
                <ResourceDisplay>
                  <ResourceIcon food />{thousandsFormatter(foodQty, RESOURCE_DECIMAL)}
                </ResourceDisplay>
              </Tooltip>

              <Tooltip trigger={'click'} arrow interactive
                html={tooltipContents(armsQty, 'Ammo', armsURL)}>
                <ResourceDisplay>
                  <ResourceIcon arms />{thousandsFormatter(armsQty, RESOURCE_DECIMAL)}
                </ResourceDisplay>
              </Tooltip>

              <Tooltip trigger={'click'} arrow interactive
                html={tooltipContents(toolQty, 'Tools', toolURL)}>
                <ResourceDisplay>
                  <ResourceIcon tool />{thousandsFormatter(toolQty, RESOURCE_DECIMAL)}
                </ResourceDisplay>
              </Tooltip>

            </Stats>

            <Stats>

              <Tooltip arrow html={tokenContents(atlasBalance, 'Atlas')}>
                <ResourceDisplay>
                  <AtlasIcon width={20} height={20} className="header-token-icon" />
                  <span>{thousandsFormatter(atlasBalance, ATLAS_DECIMAL)}</span>
                </ResourceDisplay>
              </Tooltip>
  
              <Tooltip arrow html={tokenContents(polisBalance, 'Polis')}>
                <ResourceDisplay>
                  <PolisIcon width={24} height={24} className="header-token-icon" />
                  <span>{thousandsFormatter(polisBalance, POLIS_DECIMAL)}</span>
                </ResourceDisplay>
              </Tooltip>

            </Stats>

            <WalletBtnWrapper>

              <RefreshButton />

              <WalletMultiButton />
            </WalletBtnWrapper>

          </Menu>

          <StatsMobile>
            <Tooltip trigger={'click'} arrow interactive
              html={tooltipContents(fuelQty, 'Fuel', fuelURL)}>
              <ResourceDisplay mobile>
                <ResourceIcon fuel />
                {thousandsFormatter(
                  inventory?.supplies.fuel || 0,
                  RESOURCE_DECIMAL
                )}
              </ResourceDisplay>
            </Tooltip>

            <Tooltip trigger={'click'} arrow interactive
              html={tooltipContents(foodQty, 'Food', fuelURL)}>
              <ResourceDisplay mobile>
                <ResourceIcon food />
                {thousandsFormatter(
                  inventory?.supplies.food || 0,
                  RESOURCE_DECIMAL
                )}
              </ResourceDisplay>
            </Tooltip>

            <Tooltip trigger={'click'} arrow interactive
              html={tooltipContents(armsQty, 'Ammo', fuelURL)}>
              <ResourceDisplay mobile>
                <ResourceIcon arms />
                {thousandsFormatter(
                  inventory?.supplies.arms || 0,
                  RESOURCE_DECIMAL
                )}
              </ResourceDisplay>
            </Tooltip>

            <Tooltip trigger={'click'} arrow interactive
              html={tooltipContents(toolQty, 'Tools', fuelURL)}>
              <ResourceDisplay mobile>
                <ResourceIcon tool />
                {thousandsFormatter(
                  inventory?.supplies.tools || 0,
                  RESOURCE_DECIMAL
                )}
              </ResourceDisplay>
            </Tooltip>

          </StatsMobile>

          <StatsMobile>

            <Tooltip arrow html={tokenContents(polisBalance, 'Polis')}>
              <ResourceDisplay mobile>
                <AtlasIcon width={20} height={20} className="header-token-icon" />
                <span>{thousandsFormatter(atlasBalance, ATLAS_DECIMAL)}</span>
              </ResourceDisplay>
            </Tooltip>

            <Tooltip arrow html={tokenContents(polisBalance, 'Polis')}>
              <ResourceDisplay mobile>
                <PolisIcon width={20} height={20} className="header-token-icon" />
                <span>{thousandsFormatter(polisBalance, POLIS_DECIMAL)}</span>
              </ResourceDisplay>
            </Tooltip>

          </StatsMobile>

        </Nav>
      </Container>
    </Wrapper>
  );
};


interface ResDisplay {
  mobile?: boolean;
}

const ResourceDisplay = styled.div<ResDisplay>`
  display: flex;
  align-items: center;
  margin-right: 14px;
  text-shadow: 1px 1px 7px rgb(0 0 0), -1px -1px 7px rgb(0 0 0), -1px 1px 7px rgb(0 0 0);
  cursor: pointer;

  &:hover {
    color: white;
  }

  ${props => props.mobile && `margin-right: 20px; `} 
`;

interface IconProps {
  fuel?: boolean;
  food?: boolean;
  arms?: boolean;
  tools?: boolean;
}

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  min-height: 75px;
  padding: 8px;
  background-color: rgba(10, 10, 10, 0.8);
  border: solid rgba(85, 230, 255, 0.2);
  border-width: 0 0 1px 0;
`;

const WalletBtnWrapper = styled.div`
  width: 226px;
  display: flex;
  justify-content: space-between;
  @media ${PALLETE.DEVICE.mobileL} {
    width: 100%;
    img {
      height: 15px;
      width: 15px;
    }
  }
`;

const Menu = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100%;
  width: 100%;
  padding: 0 8px;
  @media ${PALLETE.DEVICE.mobileL} {
    flex-direction: column-reverse;
    justify-content: center;
    align-items: center;
    padding-right: 0;
  }
`;


const Nav = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100%;
  flex-wrap: wrap;
`;

const Stats = styled.div`
  height: 60%;
  color: ${PALLETE.FONT_COLOR};
  display: flex;
  align-items: center;
  justify-content: space-between;
  svg {
  }
  span {
    margin-right: 2px;
    padding: 4px;
  }

  @media ${PALLETE.DEVICE.mobileL} {
    display: none;
  }
`;

const StatsMobile = styled(Stats)`
  display: none;
  @media ${PALLETE.DEVICE.mobileL} {
    margin-right: 0;
    padding: 20px 0;
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
  }
`;
