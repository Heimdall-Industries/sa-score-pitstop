import styled from "styled-components";
import { PALLETE } from "../../constants";

export const Button = styled.div`
  padding: 8px 16px;
  border-radius: 4px;
  height: 34px;
  background-color: rgba(0, 10, 20, 0.4);
  color: ${PALLETE.FONT_COLOR};
  cursor: pointer;
  display: flex;
  border: solid 1px ${PALLETE.BASE_GREY_BORDER};
  justify-content: center;
  align-items: center;
  &:active {
    background-color: rgba(40, 50, 60, 0.5);
  }
  &:hover {
    background-color: rgba(40, 50, 60, 0.5);
  }

  h3 {
    margin: 0 0 0 10px;
    padding: 0;
  }
`;
