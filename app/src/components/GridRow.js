import {
  Grid,
  Typography,
} from "@mui/material";

function GridRow(props) {
  return (
    <>
      <Grid item xs={parseInt(props.lcWidth)}>
        <Typography>{props.label}</Typography>
      </Grid><Grid item xs={parseInt(props.rcWidth)}>
        <Typography>{props.value}</Typography>
      </Grid>
    </>
  );
}

export default GridRow;
