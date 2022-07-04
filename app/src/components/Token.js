import React, { useEffect } from "react";
import NumberFormat from 'react-number-format';
import {
  Box,
  Grid,
  Card,
  Button,
  Typography,
  TextField,
  InputAdornment,
  CircularProgress,
} from "@mui/material";

import Title from "./Title";
import GridRow from "./GridRow";

import ERC20 from "../contracts/ERC20.json";
import converter, { BigNumber2RD } from "../util/converter";

const NumberFormatCustom = React.forwardRef(function NumberFormatCustom(props, ref) {
  const { onChange, ...other } = props;

  return (
    <NumberFormat
      {...other}
      getInputRef={ref}
      onValueChange={(values) => {
        onChange({
          target: {
            name: props.name,
            value: values.value,
          },
        });
      }}
      thousandSeparator
      isNumericString
      allowNegative={false}
      decimalScale={2}
    />
  );
});

function Token(props) {

  const [isLoading, setLoading] = React.useState(true);

  // const [contract, setContract] = React.useState(null);
  const [name, setName] = React.useState(null);
  const [symbol, setSymbol] = React.useState(null);
  const [decimals, setDecimals] = React.useState(null);
  const [balance, setBalance] = React.useState(null);
  const [allowance, setAllowance] = React.useState(null);
  const [allowanceBN, setAllowanceBN] = React.useState(new BigNumber2RD(0));
  // const [allowanceResetTime, setAllowanceResetTime] = React.useState(null);

  const [requestAmount, setRequestAmount] = React.useState(null);
  const [requestAmountBN, setRequestAmountBN] = React.useState(new BigNumber2RD(0));

  const [faucetCap, setFaucetCap] = React.useState(null);
  const [faucetPeriod, setFaucetPeriod] = React.useState(null);
  const [faucetLimit, setFaucetLimit] = React.useState(null);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.data]);

  const load = async () => {
    const { isLoggedIn, walletAddress, web3, faucetContract } = props.data;
    if (!isLoggedIn || !walletAddress || !web3 || !faucetContract) {
      return;
    }

    setLoading(true);

    const tokenContract = new web3.eth.Contract(ERC20.abi, props.address);
    // setContract(tokenContract);
    setName(await tokenContract.methods.name().call());
    setSymbol(await tokenContract.methods.symbol().call());
    const tokenDecimals = parseInt(await tokenContract.methods.decimals().call());
    setDecimals(tokenDecimals);

    tokenContract.methods.balanceOf(walletAddress).call((error, value) => {
      if (error) {
        return;
      }
      setBalance(converter.tokenToDisplayValue(value, tokenDecimals, 2));
    });

    faucetContract.methods.currentAllowance(props.address, walletAddress).call((error, value) => {
      if (error) {
        return;
      }
      const curentAllowance = converter.tokenToDisplayValue(value, tokenDecimals, 2);
      setAllowance(curentAllowance);
      setAllowanceBN(new BigNumber2RD(curentAllowance.replaceAll(',', '')));
    });

    faucetContract.methods.tokenCaps(props.address).call((error, value) => {
      if (error) {
        return;
      }
      if (value.isCapped === true) {
        setFaucetCap(converter.tokenToDisplayValue(value.amountRemaining, tokenDecimals, 2));
      } else {
        setFaucetCap("Uncapped");
      }
    });

    faucetContract.methods.tokenPeriodicLimits(props.address).call((error, value) => {
      if (error) {
        return;
      }

      setFaucetPeriod(parseInt(value.period) / (24 * 60 * 60));
      setFaucetLimit(converter.tokenToDisplayValue(value.allowancePerWallet, tokenDecimals, 2));
    });

    setLoading(false);
  }

  const handleAmountInput = (event) => {
    let inputBN = new BigNumber2RD(event.target.value)
    if (inputBN.comparedTo(allowanceBN) <= 0) {
      setRequestAmount(event.target.value);
      setRequestAmountBN(inputBN);
    } else {
      setRequestAmount(allowance);
      setRequestAmountBN(allowanceBN);
    }
  };

  const requestTokens = async () => {
    const { isLoggedIn, walletAddress, faucetContract } = props.data;
    if (!isLoggedIn || !walletAddress || !faucetContract) {
      return;
    }

    setLoading(true);

    try {

      const amount = converter.displayToTokenValue(requestAmount, decimals);
      await faucetContract.methods.getTokens(props.address, amount)
        .send({ from: walletAddress })
        .on('receipt', function (receipt) {
          load();
        })
        .on('error', function (error, receipt) {
        });
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Card className="content">
        <Title>{name} at {props.address}</Title>
        <Grid container spacing={1} sx={{ ml: 1, }}>
          <GridRow label="Your balance" value={balance ? balance + " " + symbol : ""} lcWidth="6" rcWidth="6" />
          <GridRow label="Faucet period" value={faucetPeriod ? faucetPeriod + " day(s)" : ""} lcWidth="6" rcWidth="6" />
          <GridRow label="Wallet limit per period" value={faucetLimit ? faucetLimit + " " + symbol : ""} lcWidth="6" rcWidth="6" />
          <GridRow label="Remaining faucet cap" value={faucetCap && faucetCap !== "Uncapped" ? faucetCap + " " + symbol : faucetCap === "Uncapped" ? faucetCap : ""} lcWidth="6" rcWidth="6" />
        </Grid>
        <Box sx={{ padding: 2, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', minHeight: '8rem', }}>
          <TextField sx={{ width:'100%', input: { textAlign: "right" } }}
            label="Request Amount"
            variant="standard"
            value={requestAmount}
            onChange={handleAmountInput}
            InputProps={{
              endAdornment: <InputAdornment position="end">{symbol}</InputAdornment>,
              inputComponent: NumberFormatCustom,
            }}
          />
          
          <Typography sx={{ ml: 2, mb: 1, mt: 1,}} color="text.secondary">
            Current allowance {allowance} {symbol}
          </Typography>

          <Button onClick={requestTokens} className="action-button" variant="outlined" color="success"
            disabled={!props.data.isLoggedIn || isLoading || (requestAmountBN.comparedTo(0) === 0 || requestAmountBN.comparedTo(allowanceBN) > 0)}>
            {isLoading ? <CircularProgress size={18} /> : 'Get Tokens'}
          </Button>
        </Box>

      </Card>
    </>
  );
}


export default Token;
