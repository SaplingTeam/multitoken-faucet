const { BigNumber } = require("ethers");
const { ethers } = require("hardhat");

async function main() {
    [deployer, ...addrs] = await ethers.getSigners();
  
    console.log("Deploying contracts with the account:", deployer.address);
    console.log("Account balance:", (await deployer.getBalance()).toString());

    TestUSDC = await ethers.getContractFactory("TestUSDC");
    tokenContract = await TestUSDC.deploy();
    console.log("TestUSDC address:", tokenContract.address);

    const TOKEN_DECIMALS = await tokenContract.decimals();

    Faucet = await ethers.getContractFactory("Faucet");
    faucetContract = await Faucet.deploy();
    console.log("Faucet address:", faucetContract.address);

    let allowance = BigNumber.from(100000).mul(BigNumber.from(10).pow(TOKEN_DECIMALS));
    let period = BigNumber.from(30).mul(24).mul(60).mul(60); //30 days in seconds
    await faucetContract.setTokenLimit(tokenContract.address, allowance, period);
  }
  
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
  