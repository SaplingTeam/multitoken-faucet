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
    // this.postLoginActions();
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

  // loadPoolBalances = async () => {
  //   if (!this.state.isLoggedIn) {
  //     return;
  //   }

  //   const { walletAddress, bankContract, tokenDecimals } = this.state;

  //   bankContract.methods.sharesOf(walletAddress).call((error, poolShares) => {
  //     if (error) {
  //       return;
  //     }
  //     bankContract.methods.sharesToTokens(poolShares).call((error, poolSharesWorth) => {
  //       if (error) {
  //         return;
  //       }
  //       this.setState({
  //         poolShares: converter.tokenToDisplayValue(poolShares, tokenDecimals, 2),
  //         poolSharesWorth: converter.tokenToDisplayValue(poolSharesWorth, tokenDecimals, 2)
  //       });
  //     });
  //   });
  // }

  // loadStakedShares = async () => {
  //   const { bankContract, tokenDecimals } = this.state;

  //   try {
  //     bankContract.methods.sharesStaked().call((error, sharesStaked) => {
  //       if (error) {
  //         return;
  //       }
  //       bankContract.methods.sharesToTokens(sharesStaked).call((error, sharesStakedWorth) => {
  //         if (error) {
  //           return;
  //         }
  //         this.setState({
  //           sharesStaked: converter.tokenToDisplayValue(sharesStaked, tokenDecimals, 2),
  //           sharesStakedWorth: converter.tokenToDisplayValue(sharesStakedWorth, tokenDecimals, 2)
  //         });
  //       });
  //     });

  //   } catch (error) {
  //     console.log(error);
  //   }
  // }

  // loadStats = async () => {
  //   const { web3, bankContract, tokenDecimals, } = this.state;
  //   if (!web3) {
  //     return;
  //   }

  //   bankContract.methods.tokenBalance().call((error, value) => {
  //     if (!error) {
  //       this.setState({ contractTokenBalance: converter.tokenToDisplayValue(value, tokenDecimals, 2) });
  //     }
  //   });

  //   bankContract.methods.poolLiqudity().call((error, value) => {
  //     if (!error) {
  //       this.setState({ contractPoolLiqudity: converter.tokenToDisplayValue(value, tokenDecimals, 2) });
  //     }
  //   });

  //   bankContract.methods.loanFundsPendingWithdrawal().call((error, value) => {
  //     if (!error) {
  //       this.setState({ loanFundsPendingWithdrawal: converter.tokenToDisplayValue(value, tokenDecimals, 2) });
  //     }
  //   });

  //   bankContract.methods.borrowedFunds().call((error, value) => {
  //     if (!error) {
  //       this.setState({ contractBorrowedFunds: converter.tokenToDisplayValue(value, tokenDecimals, 2) });
  //     }
  //   });

  //   bankContract.methods.poolFunds().call((error, value) => {
  //     if (!error) {
  //       this.setState({ contractPoolFunds: converter.tokenToDisplayValue(value, tokenDecimals, 2) });
  //     }
  //   });

  //   bankContract.methods.totalPoolShares().call((error, value) => {
  //     if (!error) {
  //       this.setState({ totalPoolShares: converter.tokenToDisplayValue(value, tokenDecimals, 2) });
  //     }
  //   });

  //   /*
  //   bankContract.methods.sharesStaked().call((error, value) => {
  //     if (!error) {
  //       this.setState({ sharesStaked: converter.tokenToDisplayValue(value, tokenDecimals, 2) });
  //     }
  //   });
  //   */

  //   bankContract.methods.sharesStakedUnlocked().call((error, value) => {
  //     if (!error) {
  //       this.setState({ sharesStakedUnlocked: converter.tokenToDisplayValue(value, tokenDecimals, 2) });
  //     }
  //   });
  // }

  // loadLoanParams = async () => {
  //   const { web3, bankContract, tokenDecimals, percentDecimals } = this.state;
  //   if (!web3) {
  //     return;
  //   }

  //   bankContract.methods.defaultAPR().call((error, value) => {
  //     if (!error) {
  //       this.setState({ defaultAPR: converter.percentToDisplayValue(value, percentDecimals, 2) });
  //     }
  //   });

  //   bankContract.methods.defaultLateFeePercent().call((error, value) => {
  //     if (!error) {
  //       this.setState({ defaultLateFeePercent: converter.percentToDisplayValue(value, percentDecimals, 2) });
  //     }
  //   });

  //   bankContract.methods.minAmount().call((error, value) => {
  //     if (!error) {
  //       this.setState({ minAmount: converter.tokenToDisplayValue(value, tokenDecimals, 2) });
  //     }
  //   });

  //   bankContract.methods.minDuration().call((error, value) => {
  //     if (!error) {
  //       this.setState({ minDuration: converter.secondsToDays(value) });
  //     }
  //   });

  //   bankContract.methods.maxDuration().call((error, value) => {
  //     if (!error) {
  //       this.setState({ maxDuration: converter.secondsToDays(value) });
  //     }
  //   });
  // }

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
