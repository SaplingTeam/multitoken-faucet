import Typography from "@mui/material/Typography";

function ProblemBanner(props) {

  if (props.isWalletMissing) {
    return (
      <div className="banner-error">
        <Typography className="padding_0_5_rem">Install Metamask and reload</Typography>);
      </div>
    );
  } else if (props.isWrongNetwork) {
    return (
      <div className="banner-error">
        <Typography className="padding_0_5_rem">Switch to Kovan Test Network</Typography>
      </div>
    );
  }

  return null;
}

export default ProblemBanner;
