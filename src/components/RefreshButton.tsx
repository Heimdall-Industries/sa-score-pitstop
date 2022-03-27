import * as React from "react";
import styled, { keyframes } from "styled-components";
import { useWallet } from "@solana/wallet-adapter-react";
import { useAppStore } from "../data/store";
import { FleetService } from "../services/fleetService";
import { ReactComponent as LoadingSpinner } from "../assets/images/spinner.svg";
import { PALLETE, REFRESH_INTERVAL} from "../constants";

// Prepend `0` for one digit numbers. For that the number has to be
// converted to string, as numbers don't have length method
const padTime = (time: number) => {
  return String(time).length === 1 ? `0${time}` : `${time}`;
};

const formatTime = (time: number) => {
  // Convert seconds into minutes and take the whole part
  const minutes = Math.floor(time / 60);

  // Get the seconds left after converting minutes
  const seconds = time % 60;

  //Return combined values as string in format mm:ss
  return `${minutes}:${padTime(seconds)}`;
};

function usePrevious(value:any) {
  const ref = React.useRef();
  React.useEffect(() => {
    ref.current = value;
  },[value]);
  return ref.current;
}
// class FirstComponent extends React.Component <{}> {
const RefreshButton = () => {
  const [counter, setCounter] = React.useState(Math.round(REFRESH_INTERVAL/1000));
  const isRefreshing = useAppStore((state) => state.refreshing);
  const { publicKey } = useWallet();

  const onRefresh = () => {
    if (publicKey) {
      FleetService.refresh(publicKey);
    }
  };


  React.useEffect(() => {
    let timer: any;
    if (counter > 0) {
      timer = setTimeout(() => {
        return setCounter((c:number) => c - 1)
      }, 1000);
    } else {
      onRefresh();
    }

    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [counter])

  React.useEffect(() => {
    if (isRefreshing) { 
      return setCounter(Math.round(REFRESH_INTERVAL/1000)); 
    }
  }, [isRefreshing])

  return (
    <RefreshWrapper disabled={isRefreshing} onClick={onRefresh}>
      {isRefreshing
        ? <LoadingSpinner style={{position: 'absolute', top: '11px', left: '44%'}} /> 
        : null
      }
      <div className="contents title">REFRESH</div>
      <div className="contents">{counter === 0 ? '0' : formatTime(counter)}</div>
    </RefreshWrapper>
  );
};


export default RefreshButton;

const lineBase = 'rgb(60, 66, 90)';
const lineBold = 'rgb(140, 156, 160)';

const RefreshWrapper = styled.button`
  border: 1px solid ${lineBase};
  color: ${lineBase};
  font-size: 12px;
  padding: 0 10px;
  cursor: pointer;
  background-color: transparent;
  border-radius: 6px;
  width: 84px;
  position: relative;
  letter-spacing: 0.07em;
  margin: 0 4px 0 0;
  &:hover {
    color: ${lineBold};
    border: 1px solid ${lineBold};
  }
  .contents {
    transition: opacity 300ms ease;
    opacity: .90;
    line-height: 1;
    width: 100%;
    text-align: center;
    opacity: 0.8;
  }
  .contents.title {
    margin: -2px 0 2px 0;
    opacity: 1;
  }
  &:disabled .contents {
    opacity: 0.4;
  }
  &:disabled .contents.title {
    opacity: 0.4;
  }
`;