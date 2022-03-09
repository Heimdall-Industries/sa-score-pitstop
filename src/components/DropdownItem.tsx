import * as React from "react";
import styled from "styled-components";
import { BUY_SUPPLY_MODES, PALLETE } from "../constants";
import { ReactComponent as InfoIcon } from "../assets/images/info.svg";
import { MarketService } from "../services/marketService";

interface Props {
  text: BUY_SUPPLY_MODES;
  onClick: (text: BUY_SUPPLY_MODES) => void;
  choosed: boolean;
}
export const DropdownItem: React.FC<Props> = ({ text, onClick, choosed }) => {
  return (
    <Wrapper onClick={() => onClick(text)}>
      <span style={{ display: "flex" }}>
        <span style={{ marginRight: 8, display: "flex" }}>
          <InfoIcon width={15} />
        </span>{" "}
        {text}
      </span>

      {choosed ? (
        <svg width="15px" height="15px" viewBox="0 0 1024 1024">
          <path
            fill="currentColor"
            d="M406.656 706.944L195.84 496.256a32 32 0 10-45.248 45.248l256 256 512-512a32 32 0 00-45.248-45.248L406.592 706.944z"
          />
        </svg>
      ) : null}
    </Wrapper>
  );
};

const Wrapper = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 8px 8px;
  width: 100%;
  font-size: ${PALLETE.FONT_SM};
  align-items: center;
  cursor: pointer;
  &:hover {
    background-color: ${PALLETE.BASE_GREY_HOVER};
  }
`;
