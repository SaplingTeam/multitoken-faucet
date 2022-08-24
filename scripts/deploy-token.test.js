const { BigNumber } = require("ethers");
const { ethers } = require("hardhat");

async function main() {
    [deployer, ...addrs] = await ethers.getSigners();
    const arguments = require('./arguments-test-token.js');
  
    console.log("Deploying contracts with the account:", deployer.address);
    console.log("Account balance:", (await deployer.getBalance()).toString());

    TestToken = await ethers.getContractFactory("TestToken");
    tokenContract = await TestToken.deploy(...arguments);
    console.log("Test token address:", tokenContract.address);
  }
  
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
  