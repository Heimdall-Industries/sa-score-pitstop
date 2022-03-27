import * as React from "react";
import styled from "styled-components";
import { useAppStore } from "../data/store";

const AppSpinner = () => {
  const appLoading = useAppStore((state) => state.appLoading);
  return (
    <SpinWrapper style={{ display: appLoading.loading ? "flex" : "none" }} >

      <Spinner>
        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="50" r="45"/>
        </svg>
      </Spinner>

      <svg width="200px" height="12px" viewBox="0 0 200 12">
        <defs>
          <clipPath id="ProgressBar-clipPath">
            <rect x="0" y="0" width="100%" height="100%" rx="4%"/>
          </clipPath>
        </defs>
        <rect x="0" y="0" width="100%" height="100%" fill="#b1b1b1" rx="4%" />
        <rect x="0" y="0" width={`${appLoading.pct}%`} 
          height="100%" fill="#10c0f0" 
          clipPath="url(#ProgressBar-clipPath)" />
      </svg>

      <SpinMessage>
        <b style={{ color: "white" }}>{appLoading.message}</b>
      </SpinMessage>

    </SpinWrapper>
  );
};

export default React.memo(AppSpinner);

const SpinWrapper = styled.div`
  align-items: center;
  justify-content: center;
  position: fixed;
  flex-direction: column;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 99999;
`;

const Spinner = styled.div`
  height: 120px;
  width: 120px;
  margin: -60px 0 0 6px;

  svg {
    animation: 2s linear infinite svg-animation;
    max-width: 100px;
  }

  circle {
    animation: 1.4s ease-in-out infinite both circle-animation;
    display: block;
    fill: transparent;
    stroke: rgb(130, 50, 160);
    stroke-linecap: round;
    stroke-dasharray: 283;
    stroke-dashoffset: 280;
    stroke-width: 7px;
    transform-origin: 50% 50%;
  }  
}
`;

const SpinMessage = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 10px;
`;