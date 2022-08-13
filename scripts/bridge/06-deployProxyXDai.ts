import { ethers } from "hardhat";
import { BRIDGE_LOGIC_ADDRESS_XDAI } from "../../constants";

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  console.log("Account balance:", (await deployer.getBalance()).toString());

  const proxyFactory = await ethers.getContractFactory("springProxy");
  let bridgeProxy = await proxyFactory.deploy(BRIDGE_LOGIC_ADDRESS_XDAI);
  await bridgeProxy.deployed();

  console.log("xDai Proxy address:", bridgeProxy.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
