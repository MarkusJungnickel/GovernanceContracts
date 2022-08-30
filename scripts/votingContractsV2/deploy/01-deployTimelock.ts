import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  console.log("Account balance:", (await deployer.getBalance()).toString());

  const timelockFactory = await ethers.getContractFactory("TimeLockModuleV2");
  let timelock = await timelockFactory.deploy();
  await timelock.deployed();

  console.log("xDai timelock address:", timelock.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
