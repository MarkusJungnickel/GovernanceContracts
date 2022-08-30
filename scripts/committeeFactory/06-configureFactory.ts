import { ethers } from "hardhat";
import Web3 from "web3";
import { FACTORY_ABI } from "../../ABIs/FACTORY_ABI";
import {
  BRIDGE_PROXY_ADDRESS_RINKEBY_FACTORY,
  PERMISSION_REG_PROXY_ADDRESS,
  PROVIDER_RINKEBY,
  WRAPPER_FACTORY_PROXY_ADDRESS,
} from "../../constants";
import { PRIVATE_KEY_DEPLOYER } from "../../privateKeys";

// Set Provider and Wallet
const web3 = new Web3(PROVIDER_RINKEBY);
const account = web3.eth.accounts.privateKeyToAccount(
  "0x" + PRIVATE_KEY_DEPLOYER
);
web3.eth.accounts.wallet.add(account);
web3.eth.defaultAccount = account.address;

// Get Contracts
const reg = new web3.eth.Contract(FACTORY_ABI, WRAPPER_FACTORY_PROXY_ADDRESS);

async function main() {
  const [deployer] = await ethers.getSigners();

  let gas_3 = await reg.methods
    .enableModule(BRIDGE_PROXY_ADDRESS_RINKEBY_FACTORY)
    .estimateGas();
  gas_3 = Math.trunc(gas_3 * 1.1);
  const transaction_3 = reg.methods.enableModule(
    BRIDGE_PROXY_ADDRESS_RINKEBY_FACTORY
  );
  console.log("pre Transaction...");
  await sendTransaction(WRAPPER_FACTORY_PROXY_ADDRESS, transaction_3, gas_3);

  let gas_4 = await reg.methods
    .setPermissionReg(PERMISSION_REG_PROXY_ADDRESS)
    .estimateGas();
  gas_4 = Math.trunc(gas_4 * 1.1);
  const transaction_4 = reg.methods.setPermissionReg(
    PERMISSION_REG_PROXY_ADDRESS
  );
  console.log("pre Transaction...");
  await sendTransaction(WRAPPER_FACTORY_PROXY_ADDRESS, transaction_4, gas_4);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
async function sendTransaction(to: string, transaction: any, gasEstimate: any) {
  console.log("in  Transaction...");
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
