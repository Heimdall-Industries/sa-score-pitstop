import * as React from "react";
import styled from "styled-components";
import { IFleet } from "../data/types";
import { d3Format } from "../utils";
import { AtlasIcon, ResourceIcon } from './Icons';
import { resourcePrices, PALLETE } from '../constants';

const calcBurn = (() => {
  const calcDaily = (perSecond: number) => perSecond * 60 * 60 * 24;
  return (type: string, fleets: Array<IFleet>) => {
    if (fleets && fleets.length) {
      return calcDaily(
        fleets.reduce((sum: number, fleet: IFleet) => 
            (sum + fleet.shipQuantityInEscrow.toNumber() * fleet.resources[type].burnRate), 0)
      );
    }
    return 0;
  };
})();

const calcCost = (rscType: string, qty: number) => {
  return resourcePrices[rscType] * qty;
};

const sumCost = (fleets: Array<IFleet>) => {
  const rscTypes = [ 'fuel', 'food', 'arms', 'health' ];
  let cost = 0;
  for (const rscType of rscTypes) {
    cost += calcCost(rscType, calcBurn(rscType, fleets))
  }
  return cost;
};

interface Props {
  fleets: Array<IFleet>,
  rewardsPerDay: number
}

export const StatsPanel: React.FC<Props> = ({fleets, rewardsPerDay}) => {
  return (
    <Statspanel>

      <BurnRateWrap>
        <DataRow>
            <div className="burn-item">
              <ResourceIcon fuel />
              <div className="value">{d3Format(calcBurn('fuel', fleets))}</div>
            </div>
            <div className="burn-item">
              <ResourceIcon food />
              <div className="value">{d3Format(calcBurn('food', fleets))}</div>
            </div>
            <div className="burn-item">
              <ResourceIcon arms />
              <div className="value">{d3Format(calcBurn('arms', fleets))}</div>
            </div>
            <div className="burn-item">
              <ResourceIcon tool />
              <div className="value">{d3Format(calcBurn('health', fleets))}</div>
            </div>
        </DataRow>

        <DataRow style={{justifyContent: 'space-between', marginTop: '8px'}}>
          <div className="label" style={{marginLeft: '4px'}}>Daily Burn</div>
          <div className="reward-value">
            <div className="value atlas">- {d3Format(sumCost(fleets), 3)}</div>
            <AtlasIcon width={14} height={14} className="header-token-icon" />
          </div>
        </DataRow>
      </BurnRateWrap>

      <RewardRow>
        <div className="label">Daily Reward</div>
        <div className="reward-value">
          <div className="value atlas">{d3Format(rewardsPerDay, 3)}</div>
          <AtlasIcon width={14} height={14} className="header-token-icon faded" />
        </div>
      </RewardRow>

      <RewardRow style={{borderTopWidth: '1px'}}>
        <div className="label">Net</div>
        <div className="reward-value">
          <div className="value atlas">{d3Format((rewardsPerDay - sumCost(fleets)), 3)}</div>
          <AtlasIcon width={14} height={14} className="header-token-icon faded" />
        </div>
      </RewardRow>

    </Statspanel>
  );
};

const Statspanel = styled.div`
  width: 100%;
  max-width: 400px;
  padding: 2px 2px 0 4px;

  .value {
    margin: 0;
  }

  .value.atlas {
    margin: 0 10px 0 0;
  }

  .label {
    color: ${PALLETE.TAB_COLOR};
    font-size: 12px;
    text-transform: uppercase;
  }

  .burn-item,
  .reward-value {
    margin: 0 18px 0 0;
    display: flex;
    align-items: center;
  }

  .reward-value:last-of-type {
      margin-right: 0;
    }

  .burn-item:last-of-type {
    margin-right: 6px;
  }

  svg {
    opacity: 0.7;
  }

  .reward-value svg {
    opacity: 0.6;
  }


  }
`
const BurnRateWrap = styled.div`
  border: solid ${PALLETE.DIVIDER_LINE};
  border-width: 1px;
  border-radius: 4px;
  padding: 4px 12px 8px 12px;
  margin: 0 -9px 0 -9px;
`;

const DataRow = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const RewardRow = styled.div`
  width: callc(100% - 4px);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 4px 10px 5px;
  margin: 0 0 0 4px;
  border: solid ${PALLETE.DIVIDER_LINE};
  border-width: 0;

  &:last-of-type {
    padding-bottom: 0;
  }
`