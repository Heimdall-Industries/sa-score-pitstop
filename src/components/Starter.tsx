import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import styled from "styled-components";
import { PALLETE, FIGMENT_KEY, NEED_API_KEY } from "../constants";
import { Disclaimer } from './Disclaimer';

let keyTest = FIGMENT_KEY; 
let missingAPI = keyTest === NEED_API_KEY;

export const Starter = () => {

  if (missingAPI) {
    return (
      <Wrapper className="startup-modal">
        <Logo>
          <Title style={{width: '280px'}}>API KEY . . . ?</Title>
        </Logo>
        <Info>
          To connect this app <br />
          to on-chain data, <br />
          you need an API key.
        </Info>
        <Info>
        Sign up for an API key at <br />
        <a href="https://datahub.figment.io/signup" target="_blank">
          https://datahub.figment.io
        </a>
        </Info>
        <Info>
          Put your API key in <br />
          the <code>FIGMENT_KEY</code> variable <br />
          here: <code>/src/constants.ts</code>
        </Info>
      </Wrapper>
    );
  }

  return (
    <Wrapper className="startup-modal">
      <Logo>
        <Title>STAR ATLAS SCORE</Title>
      </Logo>
      <WalletMultiButton />
      <Disclaimer />
    </Wrapper>
  );
};

const Wrapper = styled.div`
  position: fixed;
  top: 0;
  right: 0;
  left: 0;
  bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  background: rgba(0, 0, 0, 0.4);
  height: 100vh;
`;


const Title = styled.b``;

const Logo = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 20px;
  b {
    font-size: 2rem;
    color: ${PALLETE.FONT_COLOR};
  }
  svg {
    margin-right: 8px;
  }
`;

const Info = styled.div`
  width: 280px;
  color: rgb(200, 200, 200);
  font-size: 16px;
  line-height: 1.6;
  padding: 16px 0;
  a {
    text-decoration: none;
    font-weight: bold;
    color: rgb(80, 220, 240);
    cursor: pointer;
    &:hover {
      color: rgb(100, 245, 255);
    }
  }

  code {
    font-family: monospace;
    font-weight: bold;
    background: rgb(70, 70, 80);
    border-radius: 4px;
    padding: 4px;
  }
`
