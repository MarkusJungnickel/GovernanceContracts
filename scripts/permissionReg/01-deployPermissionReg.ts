import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  console.log("Account balance:", (await deployer.getBalance()).toString());

  const permissionRegFactory = await ethers.getContractFactory(
    "permissionRegistryLogic"
  );
  let permissionReg = await permissionRegFactory.deploy();
  await permissionReg.deployed();

  console.log("PermissionRegistry address:", permissionReg.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
