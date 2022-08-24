import {
  AppBar,
  Toolbar,
  Typography,
  Button,
} from "@mui/material";
import LoginIcon from '@mui/icons-material/Login';
import LogoutIcon from '@mui/icons-material/Logout';

function LoginLogoutButton(props) {

  if (props.isLoggedIn) {
    return (
      <Button startIcon={<LogoutIcon />} color="inherit" onClick={props.onLogOut}>Disconnect Wallet</Button>
    );
  }

  return (
    <Button startIcon={<LoginIcon />} color="inherit" onClick={props.onLogIn}>Connect Wallet</Button>
  );
}

function LoggedInUser(props) {
  if (props.isLoggedIn && props.walletAddress) {
    return (<Typography className="padding_0_5_rem">Wallet {props.walletAddress}</Typography>);
  }

  return null;
}

function CustomAppBar(props) {
  return (
    <AppBar position="static">
      <Toolbar variant="regular">
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>Polygon Mumbai Faucet</Typography>
        <LoggedInUser isLoggedIn={props.isLoggedIn} walletAddress={props.walletAddress} />
        <LoginLogoutButton isLoggedIn={props.isLoggedIn} onLogIn={props.onLogIn} onLogOut={props.onLogOut} />
      </Toolbar>
    </AppBar>
  );
}

export default CustomAppBar;
