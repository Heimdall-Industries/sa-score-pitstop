import styled from "styled-components";


export const Disclaimer = () => {
  return (
    <Notice>
      <div className="disclaimer">
        <div className="notice">
          <Box>
            <div>BETA SOFTWARE</div>
            <div style={{height: '28px'}}> </div>
            <div>This app is</div>
            <div>not audited</div>
          </Box>

          <div>However, Heimdall</div>
          <div>guild members</div>
          <div>use it every day.</div>

          <div style={{height: '22px'}}> </div>

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
    display: none;
  }
`

const Box = styled.div`
  padding: 22px 16px 22px 16px;
  border-radius: 4px;
  border: solid rgb(140, 140, 140);
  border-width 1px;
  margin: 0 -17px 26px -17px;
  text-align: center;
`
