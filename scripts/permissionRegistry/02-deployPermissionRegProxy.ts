import { ethers } from "hardhat";
import Web3 from "web3";
import { PERMISSION_REG_ABI } from "../../ABIs/PERMISSION_REG_ABI";
import {
  LINK_CONTR,
  LINK_EXEC,
  LINK_MEM,
  PERMISSION_REG_LOGIC_ADDRESS,
  PROVIDER_RINKEBY,
} from "../../constants";
import { PRIVATE_KEY_DEPLOYER } from "../../privateKeys";

// Set Provider and account
const web3 = new Web3(PROVIDER_RINKEBY);
const account = web3.eth.accounts.privateKeyToAccount(
  "0x" + PRIVATE_KEY_DEPLOYER
);
web3.eth.accounts.wallet.add(account);
web3.eth.defaultAccount = account.address;

async function main() {
  // DEPLOYMENT
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());
  const permissionProxyFactory = await ethers.getContractFactory("springProxy");
  let permissionProxy = await permissionProxyFactory.deploy(
    PERMISSION_REG_LOGIC_ADDRESS
  );
  await permissionProxy.deployed();
  console.log("Permission Proxy Address:", permissionProxy.address);

  // INITIALIZE
  const perm = new web3.eth.Contract(
    PERMISSION_REG_ABI,
    permissionProxy.address
  );
  const parametersPermissionReg = web3.eth.abi.encodeParameters(
    ["string", "string"],
    ["Governance Roles", "GOVRLS"]
  );

  let gas_1 = await perm.methods
    .initialize(parametersPermissionReg)
    .estimateGas();
  gas_1 = Math.trunc(gas_1 * 1.1);
  const transaction_1 = perm.methods.initialize(parametersPermissionReg);
  await sendTransaction(permissionProxy.address, transaction_1, gas_1);

  let gas_2 = await perm.methods.setLink(2, LINK_MEM).estimateGas();
  gas_2 = Math.trunc(gas_2 * 1.1);
  const transaction_2 = perm.methods.setLink(2, LINK_MEM);
  console.log("pre Transaction...");
  await sendTransaction(permissionProxy.address, transaction_2, gas_2);

  let gas_3 = await perm.methods.setLink(1, LINK_CONTR).estimateGas();
  gas_3 = Math.trunc(gas_3 * 1.1);
  const transaction_3 = perm.methods.setLink(1, LINK_CONTR);
  console.log("pre Transaction...");
  await sendTransaction(permissionProxy.address, transaction_3, gas_3);

  let gas_4 = await perm.methods.setLink(0, LINK_EXEC).estimateGas();
  gas_4 = Math.trunc(gas_4 * 1.1);
  const transaction_4 = perm.methods.setLink(0, LINK_EXEC);
  console.log("pre Transaction...");
  await sendTransaction(permissionProxy.address, transaction_4, gas_4);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

async function sendTransaction(to: string, transaction: any, gasEstimate: any) {
  const options = {
    to: to,
    data: transaction.encodeABI(),
    gas: gasEstimate,
  };
  const signed = await web3.eth.accounts.signTransaction(
    options,
    PRIVATE_KEY_DEPLOYER
  );
  console.log("Sending Transaction...");
  const receipt = await web3.eth
    .sendSignedTransaction(signed.rawTransaction!)
    .once("confirmation", function (confNumber, receipt) {
      console.log(confNumber, receipt);
    });
  console.log("Transaction Complete");
}
