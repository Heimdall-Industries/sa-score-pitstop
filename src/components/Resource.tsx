import * as React from "react";
import styled from "styled-components";
import { Tooltip } from 'react-tippy';
import { PALLETE } from "../constants";
import { IResourceData, TOKENS } from "../data/types";
import { d3Format } from '../utils';
import { ResourceIcon } from './Icons';
import { Clock } from "./Clock";

const Resource: React.FC<IResourceData> = ({
  basic,
  id,
  maxSeconds,
  maxUnits,
  pct1 = 0,
  pct2 = 0,
  pct1Color,
  secondsLeft,   
  unitsLeft, 
  unitsNeedToMax
}) => {

  const tooltipHTML = (
    <div>
      <div className="resource-row">
        <div className="resource-name">{id}</div>
        <div className="resource-percent">{(pct1 * 100).toFixed(1) + ' %'}</div>
      </div>
      <div className="resource-units">{d3Format(unitsLeft) + ' / ' + d3Format(maxUnits)}</div>
      
    </div>
  );

  return (
    <ResourceWrap>

      {ResourceIconType(id, basic)}

      <PercentStripe>
        <Tooltip title={id} html={tooltipHTML} delay={700} arrow>
          <Kontent>
            <Qty style={getQtyPosition(pct1 || 0)}>{d3Format(unitsLeft)}</Qty>
          </Kontent>
        </Tooltip>
        {PercentBar(id, pct1, basic)}
        {basic ? null : <IdTitle>{id}</IdTitle>}
        <Notches basic={basic} />
      </PercentStripe>

      <ClockWrap>
        <Clock  seconds={secondsLeft || 0} color={pct1Color} />
      </ClockWrap>

    </ResourceWrap>
  );


};


export default React.memo(Resource);

const ResourceIconType = (id: string, basic: boolean | undefined) => {
  switch (id) {
    case TOKENS.ammo:
      return <ResourceIcon arms className={basic ? 'fleet-basic' : 'fleet-total'} />;

    case TOKENS.food:
      return <ResourceIcon food className={basic ? 'fleet-basic' : 'fleet-total'} />;

    case TOKENS.fuel:
      return <ResourceIcon fuel className={basic ? 'fleet-basic' : 'fleet-total'} />;

    case TOKENS.tools:
      return <ResourceIcon tool className={basic ? 'fleet-basic' : 'fleet-total'} />;

    default:
      return null;
  }
};

const PercentBar = (id: string, pct1: number, basic: boolean | undefined) => {

  switch (id) {
    case TOKENS.ammo:
      return <Bar arms basic={basic} style={getBarWidth(pct1 || 0)}>
        {basic ? null : <IdTitle internal>{id}</IdTitle>}
      </Bar>;

    case TOKENS.food:
      return <Bar food basic={basic} style={getBarWidth(pct1 || 0)}>
        {basic ? null : <IdTitle internal>{id}</IdTitle>}
      </Bar>;

    case TOKENS.fuel:
      return <Bar fuel basic={basic} style={getBarWidth(pct1 || 0)}>
        {basic ? null : <IdTitle internal>{id}</IdTitle>}
      </Bar>;

    case TOKENS.tools:
      return <Bar tool basic={basic} style={getBarWidth(pct1 || 0)}>
        {basic ? null : <IdTitle internal>{id}</IdTitle>}
      </Bar>;

    default:
      return null;
  }

}



const getBarWidth = (pct: number) => {
  return {
    width: (pct * 100).toFixed(1) + '%'
  };
};

const getQtyPosition = (pct: number) => {
  return pct > 0.5 
    ? { right: ((1 - pct) * 100).toFixed(1) + '%' }
    : { left: (pct * 100).toFixed(1) + '%' };
};

interface IconProps {
  arms?: boolean;
  food?: boolean;
  fuel?: boolean;
  tool?: boolean;
  className?: string;
  basic?: boolean;
}

const ResourceWrap = styled.div`
  display: flex; 
  width: 100%;
  height: 38px;
  padding: 6px 0 0 6px;
`;

const PercentStripe = styled.div`
  position: relative;
  width: calc(100% - 130px);
  height: 20px;
  margin: 0 0 8px 0;
`;

const ClockWrap = styled.div`
  display: flex;
  justify-content: flex-end;
  width: 108px;
  padding: 1px 6px 0 0;
`;

const Kontent = styled.div`
  position: relative;
  display: flex;
  justify-content: space-between;
  width: 100%;
  height: 20px;
  align-items: center;
  z-index: 20;
  overflow: hidden;
`;

const Qty = styled.div`
  position: absolute;
  z-index: 20;
  padding: 0 8px;
  text-shadow: 1px 1px 4px black, -1px -1px 4px black;
`;

const Bar = styled.div<IconProps>`
  position: absolute;
  top: 8px;
  bottom: 6px;
  left: 0;
  z-index: 2;
  border-radius: 0 1px 1px 0;
  overflow: hidden;
  background: linear-gradient(0deg, 
    rgb(52,56,56) 0%,
    rgb(62,66,66) 30%, 
    rgb(62,56,66) 70%, 
    rgb(52,56,56) 100%
  );
  ${props => props.arms && `background: linear-gradient(0deg, 
    rgb(40,0,0) 0%,
    rgb(70,20,0) 30%, 
    rgb(70,20,0) 70%, 
    rgb(70,30,10) 100%
  );`}
  ${props => props.tool && `background: linear-gradient(0deg, 
    rgb(0,0,46) 0%,
    rgb(20,30,76) 30%, 
    rgb(30,30,76) 70%, 
    rgb(30,40,66) 100%
  );`}
  ${props => props.fuel && `background: linear-gradient(0deg, 
    rgb(30,0,34) 0%,
    rgb(50,20,64) 30%, 
    rgb(60,30,64) 70%, 
    rgb(50,40,54) 100%
  );`}
  ${props => props.food && `background: linear-gradient(0deg, 
    rgb(0,20,16) 0%,
    rgb(20,50,36) 30%, 
    rgb(20,50,36) 70%, 
    rgb(10,40,26) 100%
  );`}
  ${props => props.basic && `
    opacity: 0.8;
    top: 11px;
  `}
  @media ${PALLETE.DEVICE.mobileL} {
    opacity: 0.8;
  }
`;

const NotchWrap = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  display: flex;
  z-index: 10;
  overflow: hidden;
`;

interface IDTitle {
  internal?: boolean;
}
const IdTitle = styled.div<IDTitle>`
  position: absolute;
  top: -3px;
  left: 16px;
  opacity: 0.3;
  color: rgb(100,100,100);
  z-index: 1;
  font-size: 26px;
  font-weight: bold;
  letter-spacing: 0.2em;
  line-height: 1;
  ${props => props.internal && `color: rgb(200,200,200); top: -10px;`}
  @media ${PALLETE.DEVICE.mobileL} {
    display: none;
  }
`
interface NotchProps {
  basic?: boolean;
}

const Notches: React.FC<NotchProps> = ({basic}) => (
  <NotchWrap>
    <Notch basic={basic}/>
      <N basic={basic}/><N basic={basic}/><N basic={basic}/><N basic={basic}/>
    <Notch basic={basic}/><N basic={basic}/><N basic={basic}/><N basic={basic}/><N basic={basic}/>
    <Notch basic={basic}/><N basic={basic}/><N basic={basic}/><N basic={basic}/><N basic={basic}/>
    <Notch basic={basic}/><N basic={basic}/><N basic={basic}/><N basic={basic}/><N basic={basic}/>
  </NotchWrap>
);
const Notch = styled.div<NotchProps>`
  margin-right: calc(5% - 1px);
  height: 100%;
  width: 1px;
  background: rgb(80 220 240 / 30%);
  ${props => props.basic && `opacity: 0.5;`}
  @media ${PALLETE.DEVICE.mobileL} {
    opacity: 0.5;
  }
`;

const N = styled.div<NotchProps>`
  margin-right: calc(5% - 1px);
  height: 8px;
  margin-top: 6px;
  width: 1px;
  background: rgb(80 220 240 / 18%);
  ${props => props.basic && `opacity: 0;`}
  @media ${PALLETE.DEVICE.mobileL} {
    opacity: 0;
  }

`;
