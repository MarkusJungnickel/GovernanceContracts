import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  console.log("Account balance:", (await deployer.getBalance()).toString());

  const logicFactory = await ethers.getContractFactory("bridgeProxyLogic");
  let bridgeProxyLogic = await logicFactory.deploy();
  await bridgeProxyLogic.deployed();

  console.log("Rinkeby Logic address:", bridgeProxyLogic.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
