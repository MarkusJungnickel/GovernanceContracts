// initialize the timelock
// enable timelock avatars

import { ethers } from "hardhat";
import Web3 from "web3";
import { GOVERNOR_V2_ABI } from "../../../ABIs/GOVERNOR_V2_ABI";
import { TIMELOCK_V2_ABI } from "../../../ABIs/TIMELOCK_V2_ABI";
import { TOKEN_ABI } from "../../../ABIs/TOKEN_ABI";
import {
  GOVERNOR_V2_ADDRESS,
  PROVIDER_XDAI,
  TIMELOCK_V2_ADDRESS,
  TOKEN_ADDRESS,
} from "../../../constants";
import { PRIVATE_KEY_USER_1 } from "../../../privateKeys";

// Set Provider and Wallet

const web3 = new Web3(PROVIDER_XDAI);

const account2 = "0xa453E7a4bDe94B7A10F1a012832F471d6f5C80c3";
const account3 = "0x400b95309b2EfFbE5C7a6c2e0088f0dd5f55B7d6";
const account = web3.eth.accounts.privateKeyToAccount(
  "0x" + PRIVATE_KEY_USER_1
);
web3.eth.accounts.wallet.add(account);
web3.eth.defaultAccount = account.address;

// Get Contracts
const timelock = new web3.eth.Contract(TIMELOCK_V2_ABI, TIMELOCK_V2_ADDRESS);
const governor = new web3.eth.Contract(GOVERNOR_V2_ABI, GOVERNOR_V2_ADDRESS);
const token = new web3.eth.Contract(TOKEN_ABI, TOKEN_ADDRESS);

async function main() {
  const [deployer] = await ethers.getSigners();

  // let gas_1 = await timelock.methods
  //   .initialize(
  //     15,
  //     [GOVERNOR_V2_ADDRESS, deployer.address],
  //     [GOVERNOR_V2_ADDRESS, deployer.address]
  //   )
  //   .estimateGas();
  // gas_1 = Math.trunc(gas_1 * 1.1);
  // const transaction_1 = timelock.methods.initialize(
  //   15,
  //   [GOVERNOR_V2_ADDRESS, deployer.address],
  //   [GOVERNOR_V2_ADDRESS, deployer.address]
  // );
  // console.log("pre Transaction...");
  // await sendTransaction(TIMELOCK_V2_ADDRESS, transaction_1, gas_1);

  // let gas_2 = await timelock.methods
  //   .enableAvatar(BRIDGE_PROXY_ADDRESS_XDAI_FACTORY)
  //   .estimateGas();
  // gas_2 = Math.trunc(gas_2 * 1.1);
  // const transaction_2 = timelock.methods.enableAvatar(
  //   BRIDGE_PROXY_ADDRESS_XDAI_FACTORY
  // );
  // console.log("pre Transaction...");
  // await sendTransaction(TIMELOCK_V2_ADDRESS, transaction_2, gas_2);

  // let gas_3 = await timelock.methods
  //   .enableAvatar(BRIDGE_PROXY_ADDRESS_XDAI_PERM)
  //   .estimateGas();
  // gas_3 = Math.trunc(gas_3 * 1.1);
  // const transaction_3 = timelock.methods.enableAvatar(
  //   BRIDGE_PROXY_ADDRESS_XDAI_PERM
  // );
  // console.log("pre Transaction...");
  // await sendTransaction(TIMELOCK_V2_ADDRESS, transaction_3, gas_3);

  // let gas_5 = await governor.methods
  //   .initialize(TOKEN_ADDRESS, TIMELOCK_V2_ADDRESS, 10, 10)
  //   .estimateGas();
  // gas_5 = Math.trunc(gas_5 * 1.1);
  // const transaction_5 = governor.methods.initialize(
  //   TOKEN_ADDRESS,
  //   TIMELOCK_V2_ADDRESS,
  //   10,
  //   10
  // );
  // console.log("pre Transaction...");
  // await sendTransaction(GOVERNOR_V2_ADDRESS, transaction_5, gas_5);

  // let gas_6 = await token.methods.initialize("GovToken", "GVT").estimateGas();
  // gas_6 = Math.trunc(gas_6 * 1.1);
  // const transaction_6 = token.methods.initialize("GovToken", "GVT");
  // console.log("pre Transaction...");
  // await sendTransaction(TOKEN_ADDRESS, transaction_6, gas_6);

  // let gas_7 = await token.methods.mint(deployer.address, 10000).estimateGas();
  // gas_7 = Math.trunc(gas_7 * 1.1);
  // const transaction_7 = token.methods.mint(deployer.address, 10000);
  // console.log("pre Transaction...");
  // await sendTransaction(TOKEN_ADDRESS, transaction_7, gas_7);

  // let gas_8 = await token.methods.mint(account2, 10000).estimateGas();
  // gas_8 = Math.trunc(gas_8 * 1.1);
  // const transaction_8 = token.methods.mint(account2, 10000);
  // console.log("pre Transaction...");
  // await sendTransaction(TOKEN_ADDRESS, transaction_8, gas_8);

  // let gas_9 = await token.methods.mint(account3, 1).estimateGas();
  // gas_9 = Math.trunc(gas_9 * 1.1);
  // const transaction_9 = token.methods.mint(account3, 1);
  // console.log("pre Transaction...");
  // await sendTransaction(TOKEN_ADDRESS, transaction_9, gas_9);

  // let gas_10 = await token.methods.delegate(deployer.address).estimateGas();
  // gas_10 = Math.trunc(gas_10 * 1.1);
  // const transaction_10 = token.methods.delegate(deployer.address);
  // console.log("pre Transaction...");
  // await sendTransaction(TOKEN_ADDRESS, transaction_10, gas_10);

  let gas_11 = await token.methods.delegate(account2).estimateGas();
  gas_11 = Math.trunc(gas_11 * 1.1);
  const transaction_11 = token.methods.delegate(account2);
  console.log("pre Transaction...");
  await sendTransaction(TOKEN_ADDRESS, transaction_11, gas_11);

  // let gas_12 = await token.methods.delegate(account3).estimateGas();
  // gas_12 = Math.trunc(gas_12 * 1.1);
  // const transaction_12 = token.methods.delegate(account3);
  // console.log("pre Transaction...");
  // await sendTransaction(TOKEN_ADDRESS, transaction_12, gas_12);

  console.log(Number(await token.methods.balanceOf(account3).call()));
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
    PRIVATE_KEY_USER_1
  );
  console.log("Sending Transaction...");
  const receipt = await web3.eth
    .sendSignedTransaction(signed.rawTransaction!)
    .once("confirmation", function (confNumber, receipt) {
      console.log(confNumber, receipt);
    });
  console.log("Transaction Complete");
}
