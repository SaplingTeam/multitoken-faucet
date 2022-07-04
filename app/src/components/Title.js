import {
  Typography,
} from "@mui/material";

function Title(props) {
  return (
    <Typography sx={{ ml: 2, }} component="h2" variant="h6" color="primary" gutterBottom>
      {props.children}
    </Typography>
  );
}

export default Title;
