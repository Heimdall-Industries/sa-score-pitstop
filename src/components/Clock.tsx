import * as React from "react";
import { ImClock } from 'react-icons/im';
import styled from "styled-components";
interface IProps {
  seconds: number;
  color?: string;
  tooltip?: string;
  hideClock?: boolean;
}
const ClockSVG = (color: string) => (
  <svg
    width="20px"
    height="20px"
    viewBox="0 0 36 36"
    version="1.1"
    preserveAspectRatio="xMidYMid meet"
    fill={color} >
    <path
      d="M18,9.83a1,1,0,0,0-1,1v8.72l5.9,4A1,1,0,0,0,24,21.88l-5-3.39V10.83A1,1,0,0,0,18,9.83Z"
      className="clr-i-outline clr-i-outline-path-1"
    ></path>
    <path
      d="M18,2A16.09,16.09,0,0,0,4,10.26V5.2a1,1,0,0,0-2,0V14h8.8a1,1,0,0,0,0-2H5.35A14,14,0,1,1,8.58,28.35a1,1,0,0,0-1.35,1.48A16,16,0,1,0,18,2Z"
      className="clr-i-outline clr-i-outline-path-2"
    ></path>
    <rect x="0" y="0" width="36" height="36" fillOpacity="0" />
  </svg>
);

export const Clock: React.FC<IProps> = ({
  seconds,
  color = "#c5c3c3",
  tooltip = "",
  hideClock = false
}) => {
  const minutes = seconds / 60;
  const hours = minutes / 60;
  const days = hours / 24;
  let time = ``;  

  if (minutes == 0) {
    time = `00H 00M`;
  } else if (days >= 1) {
    let daysCount = Math.floor(days);
    let hoursCount = Math.round((days % 1) * 24);

    time = `${daysCount < 10 ? "0" + daysCount : daysCount}D ${
      hoursCount < 10 ? "0" + hoursCount : hoursCount
    }H`;
  } else {
    let hoursCount = Math.floor(hours);
    let minutesCount = Math.floor((hours % 1) * 60);

    time = `${hoursCount < 10 ? "0" + hoursCount : hoursCount}H ${
      minutesCount < 10 ? "0" + minutesCount : minutesCount
    }M`;
  }

  return (
    <ClockWrap>
      {hideClock ? null : <ClockIcon style={{color: color}}><ImClock /></ClockIcon>}
      <div style={{ color: color }}>{time}</div>
    </ClockWrap>
  );
};

const ClockWrap = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: flex-start;
  svg {
    margin-right: 8px;
  }
`;

const ClockIcon = styled.div`
  padding: 1px 0 0 0;
  opacity: 0.7;
`;
