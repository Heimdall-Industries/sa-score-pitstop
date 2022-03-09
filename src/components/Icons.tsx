import * as React from "react";
import styled, { keyframes } from "styled-components";
import { RiGasStationFill } from 'react-icons/ri';
import { GiCrownedExplosion /* GiHeavyBullets */ } from 'react-icons/gi';
import { ImWrench } from 'react-icons/im';
import { MdFastfood } from 'react-icons/md';

interface Props {
    width: number | string;
    height: number | string;
    className: string;
}

export const AtlasIcon: React.FC<Props> = ({width, height, className}) => {
  return (
    <TokenIcon width={width} height={height} viewBox="0 0 76.736 100.854"  className={className || ''}>
      <circle r="50" cy={50} cx={38} fill="#f00" className="atlas-bg" />

      <g
        id="Group_846"
        data-name="Group 846"
        transform="scale(0.7) translate(-66.49 -22.646)"
      >
        <g
          id="Group_844"
          data-name="Group 844"
          transform="translate(82.49 48.646)"
        >
          <path
            id="Path_2275"
            data-name="Path 2275"
            d="M912.637,1045.323l-20.181,45.764c-.667,1.468-1.013,2.659-2.479,2.659l-13.329,0c-1.911,0-2.965-.524-2.037-2.657l32.592-74.932c.667-1.246,1.08-2.162,2.548-2.162h5.772c1.466,0,1.879.915,2.546,2.162l32.594,74.932c.927,2.133-.126,2.657-2.037,2.657l-13.329,0c-1.469,0-1.813-1.191-2.479-2.659Z"
            transform="translate(-874.268 -1014)"
            fill="#000"
          />
        </g>
        <g
          id="Group_845"
          data-name="Group 845"
          transform="translate(133.768 149.5) rotate(180)"
        >
          <path
            id="Path_2283"
            data-name="Path 2283"
            d="M12.882,0,26.211,26.659H0Z"
            transform="translate(0 0)"
            fill="#32feff"
          />
        </g>
      </g>
    </TokenIcon>
  );
};

export const PolisIcon: React.FC<Props> = ({width, height, className}) => {
  return (
    <TokenIcon width={width} height={height} viewBox="0 0 76.736 100.854" className={className || ''}>
      <circle r="50" cy={50} cx={38} fill="#f00" className="polis-bg" />

      <g
        id="Group_846"
        data-name="Group 846"
        transform="scale(0.7) translate(-66.49 -22.646)"
      >
        <g
          id="Group_844"
          data-name="Group 844"
          transform="translate(82.49 48.646)"
        >
          <path
            id="Path_2275"
            data-name="Path 2275"
            d="M912.637,1045.323l-20.181,45.764c-.667,1.468-1.013,2.659-2.479,2.659l-13.329,0c-1.911,0-2.965-.524-2.037-2.657l32.592-74.932c.667-1.246,1.08-2.162,2.548-2.162h5.772c1.466,0,1.879.915,2.546,2.162l32.594,74.932c.927,2.133-.126,2.657-2.037,2.657l-13.329,0c-1.469,0-1.813-1.191-2.479-2.659Z"
            transform="translate(-874.268 -1014)"
            fill="#FFF"
          />
        </g>
        <g
          id="Group_845"
          data-name="Group 845"
          transform="translate(133.768 149.5) rotate(180)"
        >
          <path
            id="Path_2283"
            data-name="Path 2283"
            d="M12.882,0,26.211,26.659H0Z"
            transform="translate(0 0)"
            fill="#32feff"
          />
        </g>
      </g>
    </TokenIcon>
  );
};

const TokenIcon = styled.svg`
  margin: 0 2px;
  &.header-token-icon {
    margin: 0 4px 0 0;
  }
  &.button-token-icon {
    margin: 0 10px;
  }
`;


interface IconProps {
  arms?: boolean;
  food?: boolean;
  fuel?: boolean;
  tool?: boolean;
  className?: string;
}

const ResourceWrapper = styled.div<IconProps>`
  height: 32px;
  width: 32px;
  margin: 0;
  color: rgb(250,250,250);
  font-size: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  ${props => props.fuel && `color: rgb(200, 0, 220); font-size: 22px;`}
  ${props => props.food && `color: rgb(0, 210, 70); margin-top: -2px;`}
  ${props => props.arms && `color: rgb(230,60,0); font-size: 21px; margin-right: -1px;`}
  ${props => props.tool && `color: rgb(30,150,250); font-size: 18px; margin-right: -3px;`}

  &.fleet-total {
    height: 26px;
    width: 36px;
    justify-content: flex-start;
    margin-right: 0;
  }
  &.fleet-basic {
    height: 26px;
    width: 36px;
    justify-content: flex-start;
    margin-right: 0;
    opacity: 0.5;
  }
`;

export const ResourceIcon: React.FC<IconProps> = ({arms, food, fuel, tool, className}) => {
  const IconEl = arms ? GiCrownedExplosion : food ? MdFastfood : fuel ? RiGasStationFill : ImWrench;
  return (
    <ResourceWrapper arms={arms} food={food} fuel={fuel} tool={tool} className={className}>
      <IconEl />
    </ResourceWrapper>
  );
};
