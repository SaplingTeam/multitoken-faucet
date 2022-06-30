const { BigNumber } = require("ethers");
const { ethers } = require("hardhat");

async function main() {
    [deployer, ...addrs] = await ethers.getSigners();
  
    console.log("Deploying contracts with the account:", deployer.address);
    console.log("Account balance:", (await deployer.getBalance()).toString());

    TestUSDC = await ethers.getContractFactory("TestUSDC");
    tokenContract = await TestUSDC.deploy();
    console.log("TestUSDC address:", tokenContract.address);
  }
  
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
  