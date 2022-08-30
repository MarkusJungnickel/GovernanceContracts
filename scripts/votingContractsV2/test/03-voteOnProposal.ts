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
import { PRIVATE_KEY_USER_2 } from "../../../privateKeys";

const id =
  "60081124955098394449719775840991723229760706883093739681208594563233250274970";

// Set Provider and Wallet
const web3 = new Web3(PROVIDER_XDAI);
const account = web3.eth.accounts.privateKeyToAccount(
  "0x" + PRIVATE_KEY_USER_2
);
web3.eth.accounts.wallet.add(account);
web3.eth.defaultAccount = account.address;

// Get Contracts
const timelock = new web3.eth.Contract(TIMELOCK_V2_ABI, TIMELOCK_V2_ADDRESS);
const governor = new web3.eth.Contract(GOVERNOR_V2_ABI, GOVERNOR_V2_ADDRESS);
const token = new web3.eth.Contract(TOKEN_ABI, TOKEN_ADDRESS);
const account3 = "0x400b95309b2EfFbE5C7a6c2e0088f0dd5f55B7d6";

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log(Number(await token.methods.balanceOf(account3).call()));
  console.log(Number(await token.methods.totalSupply().call()));
  console.log(await governor.methods.quorum(23594351).call());
  // let gas1 = await governor.methods.castVote(id, 1, 32).estimateGas();
  // gas1 = Math.trunc(gas1 * 1.1);
  // const transaction_1 = governor.methods.castVote(id, 1, 32);
  // console.log("pre Transaction...");
  // await sendTransaction(GOVERNOR_V2_ADDRESS, transaction_1, gas1);

  console.log(Number(await token.methods.balanceOf(account3).call()));
  console.log(Number(await token.methods.totalSupply().call()));
  console.log(await governor.methods.quorum(23594351).call());
  const state = await governor.methods.state(id).call();
  console.log("state:", state);
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
    PRIVATE_KEY_USER_2
  );
  console.log("Sending Transaction...");
  const receipt = await web3.eth
    .sendSignedTransaction(signed.rawTransaction!)
    .once("confirmation", function (confNumber, receipt) {
      console.log(confNumber, receipt);
    });
  console.log("Transaction Complete");
}
