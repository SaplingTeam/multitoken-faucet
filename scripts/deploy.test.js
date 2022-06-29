const { BigNumber } = require("ethers");
const { ethers } = require("hardhat");

async function main() {
    [deployer, ...addrs] = await ethers.getSigners();
  
    console.log("Deploying contracts with the account:", deployer.address);
    console.log("Account balance:", (await deployer.getBalance()).toString());

    Faucet = await ethers.getContractFactory("Faucet");
    faucetContract = await Faucet.deploy();
    console.log("Faucet address:", faucetContract.address);
  }
  
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
  