import { ethers } from "hardhat";
import Web3 from "web3";
import { PERMISSION_REG_ABI } from "../../ABIs/PERMISSION_REG_ABI";
import {
  PERMISSION_REG_PROXY_ADDRESS,
  PROVIDER_RINKEBY,
} from "../../constants";
import { PRIVATE_KEY_DEPLOYER } from "../../privateKeys";

// Set Provider and Wallet
const web3 = new Web3(PROVIDER_RINKEBY);
const account = web3.eth.accounts.privateKeyToAccount(
  "0x" + PRIVATE_KEY_DEPLOYER
);
web3.eth.accounts.wallet.add(account);
web3.eth.defaultAccount = account.address;
const reg = new web3.eth.Contract(
  PERMISSION_REG_ABI,
  PERMISSION_REG_PROXY_ADDRESS
);

async function main() {
  const [deployer] = await ethers.getSigners();

  let setFreezeSig = web3.eth.abi.encodeFunctionSignature("setFreeze(address)");

  let gas_3 = await reg.methods
    .setUserRole(deployer.address, 2, true)
    .estimateGas();
  gas_3 = Math.trunc(gas_3 * 1.1);
  const transaction_3 = reg.methods.setUserRole(deployer.address, 2, true);
  console.log("pre Transaction...");
  await sendTransaction(PERMISSION_REG_PROXY_ADDRESS, transaction_3, gas_3);

  // const success1 = await reg.methods.balanceOf(deployer.address).call();
  // console.log(success1);

  // let gas_4 = await reg.methods
  //   .setUserRole(deployer.address, 1, false)
  //   .estimateGas();
  // gas_4 = Math.trunc(gas_4 * 1.1);
  // const transaction_4 = reg.methods.setUserRole(deployer.address, 1, false);
  // console.log("pre Transaction...");
  // await sendTransaction(PERMISSION_REG_PROXY_ADDRESS, transaction_4, gas_4);

  // let gas_5 = await reg.methods
  //   .setRoleCapability(0, BUDGET_MODIFIER_PROXY_ADDRESS, setFreezeSig, true)
  //   .estimateGas();
  // gas_5 = Math.trunc(gas_5 * 1.1);
  // const transaction_5 = reg.methods.setRoleCapability(
  //   0,
  //   BUDGET_MODIFIER_PROXY_ADDRESS,
  //   setFreezeSig,
  //   true
  // );
  // console.log("pre Transaction...");
  // await sendTransaction(PERMISSION_REG_PROXY_ADDRESS, transaction_5, gas_5);

  // let gas_6 = await reg.methods
  //   .setRootUser("0x4e5199B4737427C0516E08F19a22f562B69F6371", true)
  //   .estimateGas();
  // gas_6 = Math.trunc(gas_6 * 1.1);
  // const transaction_6 = reg.methods.setRootUser(
  //   "0x4e5199B4737427C0516E08F19a22f562B69F6371",
  //   true
  // );
  // console.log("pre Transaction...");
  // await sendTransaction(PERMISSION_REG_PROXY_ADDRESS, transaction_6, gas_6);

  const success1 = await reg.methods
    .isUserRoot("0x4e5199B4737427C0516E08F19a22f562B69F6371")
    .call();
  console.log(success1);
  // const success2 = await reg.methods
  //   .canCall(deployer.address, BUDGET_MODIFIER_PROXY_ADDRESS, setFreezeSig)
  //   .call();
  // console.log(success2);
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
