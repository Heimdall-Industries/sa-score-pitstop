import * as React from "react";
import styled from "styled-components";
import { PALLETE } from "../constants";
import Resources from "./Resources";
import { Container } from "./shared/styled/Styled";

export const Content = () => {
  return (
    <Wrapper>
      <Container>
        <ContentWrapper className="overview-wrapper">
          <ResourcesSection>
            <Resources />
          </ResourcesSection>
        </ContentWrapper>
      </Container>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  width: 100%;
`;

const ContentWrapper = styled.div`
  display: flex;
  justify-content: center;
  padding: 26px 0 14px 0;
  border-radius: 2px;
  margin: 16px 0 16px 0;
  background-color: rgba(10, 10, 10, 0.6);
  border: solid rgba(85, 230, 255, 0.95);
  border-width: 1px 0 1px 0;

  @media ${PALLETE.DEVICE.mobileL} {  
    flex-direction: column;
    justify-content: space-between;
  }
`;

const ResourcesSection = styled.div`
  color: ${PALLETE.FONT_COLOR};
  flex: 5;
  justify-content: center;
  flex-direction: column;
  max-width: 880px;
  padding: 0 14px;
  @media ${PALLETE.DEVICE.mobileL} {
    padding: 16px 16px 6px 16px;
  }
`;
