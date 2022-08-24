import React, { Component } from "react";
import {
  Box,
  Stack,
} from "@mui/material";
import CustomAppBar from "./components/CustomAppBar";
import ProblemBanner from "./components/ProblemBanner";
import Token from "./components/Token";

import Web3 from "web3";

import config from "./contracts/config.json"
import Faucet from "./contracts/Faucet.json";

import "./App.css";

class App extends Component {

  state = {
    web3: null,
    selectedNetworkId: null,
    isLoggedIn: false,
    walletAddress: null,

    faucetContractAddress: null,
    faucetContract: null,
  };

  componentDidMount = async () => {

    try {
      if (window.ethereum) {
        const web3 = new Web3(window.ethereum);
        window.ethereum.on("accountsChanged", (accounts) => this.handleAccountChange(accounts));
        window.ethereum.on("networkChanged", (networkId) => this.handleNetworkChange(networkId));
        this.setState({ web3 }, this.postConstructActions);
      }
    } catch (error) {
      console.error(error);
    }
  };

  postConstructActions = async () => {
    await this.restoreLogin();
    await this.loadContracts();
  }

  postLoginActions = async () => {
    if (!this.state.isLoggedIn) {
      return;
    }
    this.loadPoolBalances();
  }

  logIn = async () => {
    const { web3, isLoggedIn } = this.state;
    if (!web3 || isLoggedIn) {
      return;
    }

    try {
      const networkId = await web3.eth.net.getId();
      if (networkId !== config.APP_NETWORK_ID) {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: config.APP_NETWORK_ID_HEX }],
        });
      }

      await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      const accounts = await web3.eth.getAccounts();
      let walletAddress = null;
      let isLoggedIn = false;
      if (accounts.length > 0) {
        walletAddress = accounts[0];
        isLoggedIn = true;
      } else {
        alert("No wallet addresses found, set up a wallet and try again.");
        console.log("App: No wallet addresses found.");
        return;
      }

      await this.setState({ isLoggedIn, walletAddress, selectedNetworkId: networkId });
      localStorage.setItem("isLoggedIn", true);
      localStorage.setItem("walletAddress", walletAddress);
    } catch (error) {
      console.error(error);
    }

    this.postLoginActions();
  }

  logOut = async () => {
    if (!this.state.isLoggedIn) {
      return;
    }

    localStorage.setItem("isLoggedIn", false);
    localStorage.removeItem("walletAddress");

    this.setState({
      isLoggedIn: false,
      walletAddress: null,

      poolShares: "0",
      poolSharesWorth: "0",
    });
  }

  handleAccountChange = async (accounts) => {
    if (!this.state.isLoggedIn) {
      return;
    }
    this.logOut();
  }

  handleNetworkChange = async (networkId) => {
    if (!this.state.isLoggedIn) {
      return;
    }
    this.setState({ selectedNetworkId: parseInt(networkId, 10) });
  }

  restoreLogin = async () => {
    if (JSON.parse(localStorage.getItem("isLoggedIn")) === true) {
      let walletAddress = localStorage.getItem("walletAddress");
      if (walletAddress !== null) {
        this.setState({ isLoggedIn: true, walletAddress });
      }
    }
  }

  loadContracts = async () => {
    const { web3 } = this.state;
    if (!web3) {
      return;
    }

    try {
      const networkId = await web3.eth.net.getId();
      this.setState({ selectedNetworkId: networkId });

      if (networkId !== config.APP_NETWORK_ID) {
        return;
      }
      const faucetContractAddress = Faucet.networks[config.APP_NETWORK_ID].address;
      const faucetContract = new web3.eth.Contract(Faucet.abi, faucetContractAddress);

      await this.setState({
        faucetContractAddress,
        faucetContract,
      });
    } catch (error) {
      console.error(error);
    }
  };

  render() {
    return (
      <div>
        <Box className="main-container" sx={{ flexGrow: 1 }}>
          <CustomAppBar
            isLoggedIn={this.state.isLoggedIn}
            walletAddress={this.state.walletAddress}
            onLogIn={this.logIn}
            onLogOut={this.logOut}
          />
          <ProblemBanner
            isWalletMissing={this.state.web3 === null}
            isWrongNetwork={this.state.selectedNetworkId !== config.APP_NETWORK_ID}
          />
          <Stack className="padding_0_5_rem" spacing={2}>

            {
              config.tokens.map(
                (token) => <Token key={token.address} address={token.address} data={this.state}/>
              )
            }
          </Stack>
        </Box>
      </div>
    );
  }
}

export default App;
