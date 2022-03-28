import styled from "styled-components";

const clubPath = 'M126.34271,79.2478241 C105.437402,79.2555556 84.1075502,102.679029 ' + 
  '84.1075502,127.5 C84.1075502,152.320971 105.159822,174.745459 126.34271,174.745459 ' + 
  'L174.875753,174.745459 C176.786687,174.745459 178.211024,175.53675 179.414917,177.918454 ' + 
  'C179.763908,178.608874 190.544895,204.413346 191.602691,206.732547 ' + 
  'C192.660487,209.051748 191.602691,211 188.469808,211 L123.940178,211 C83.4670376,211 ' + 
  '43.998422,171.351599 44,127.5 C44.001578,83.6484012 80.2383658,44 126.442322,44 ' + 
  'L188.469808,44 C190.458134,44 192.340989,45.3665394 191.602691,47.564213 ' + 
  'L179.414917,75.6913426 C178.368019,78.2021412 176.864079,79.2555556 174.875753,79.2555556';

const clubTransform  = 'translate(211.000000, 129.000000) rotate(-270.000000) ' + 
  'translate(-211.000000, -129.000000)'

const ClubLogo = () => {
  return (
    <svg width="26px" height="26px" viewBox="0 0 256 256">
      <defs>
        <linearGradient x1="50%" y1="0%" x2="50%" y2="100%" id="linearGradient-1">
          <stop stopColor="#901539" offset="0%"></stop>
          <stop stopColor="#FF3267" offset="100%"></stop>
        </linearGradient>
      </defs>
      <g id="StarAtlas" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
        <g id="Logo-B">
          <circle id="Oval" fill="#000000" cx="128" cy="128" r="128"></circle>
          <path d={clubPath} id="Fill-9" fill="#FFFFFF" fillRule="nonzero"></path>
          <polygon id="Triangle" fill="url(#linearGradient-1)" 
            transform={clubTransform} points="211 98 245 160 177 160"></polygon>
        </g>
      </g>
    </svg>
  );
};

export const Attribution = () => {
  return (
    <Attrib>
      <div style={{width: '100%'}}>Big thanks to the original</div>
      <ClubLogo /> 
      <div><a href="https://pitstop.theclubguild.com/">Club Pitstop</a></div>
      <div>app!</div>
    </Attrib>
  );
};

export const Disclaimer = () => {
  return (
    <Notice>
      <div className="disclaimer">
        <div className="notice">
          <Box>
            <div>BETA SOFTWARE</div>
            <div style={{height: '14px'}}> </div>
            <div>This app is</div>
            <div>not audited</div>
          </Box>

          <div>
            <a href="https://github.com/mattsahr/sa-score-pitstop">
              &raquo; source code &raquo;
            </a>
          </div>

        </div>
      </div>
    </Notice>
  );
};


const Notice = styled.div`
  max-width: 480px;
  padding: 36px 0 0 0;
  line-height: 1.4;
  color: rgb(170, 180, 190);
  font-size: 18px;

  a {
    text-decoration: none;
    font-weight: bold;
    color: rgb(20, 140, 200);
    cursor: pointer;

    &:hover {
      color: rgb(0,190,250);
    }
  }
  .notice {
  }
`

const Box = styled.div`
  padding: 16px;
  border-radius: 4px;
  border: solid rgb(140, 140, 140);
  border-width 1px;
  margin: 0 -17px 26px -17px;
  text-align: center;
`


const Attrib = styled.div`
  font-size: 16px;
  width: 240px;
  margin: 0 0 0 -120px;
  position: absolute;
  bottom: 32px;
  left: 50%;
  color: rgb(130, 140, 150);
  line-height: 1.4;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  text-align: center;
  border-radius: 10px;
  background-color: rgba(0, 0, 0, 0.3);
  padding: 12px 0;

  a {
    text-decoration: none;
    font-weight: bold;
    color: rgb(20, 140, 200);
    cursor: pointer;

    &:hover {
      color: rgb(0,190,250);
    }
  }

  > div {
    padding: 0 3px;
  }

  svg {
    opacity: 0.7;
    margin: -2px 0 0 0;
  }
`