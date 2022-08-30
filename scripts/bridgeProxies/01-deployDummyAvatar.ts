import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  console.log("Account balance:", (await deployer.getBalance()).toString());

  const avatarFactory = await ethers.getContractFactory("dummyAvatar");
  let dummyAvatar = await avatarFactory.deploy();
  await dummyAvatar.deployed();

  console.log("Rinkeby avatar address:", dummyAvatar.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
