// initialize the timelock
// enable timelock avatars

import { ethers } from "hardhat";
import Web3 from "web3";
import { GOVERNOR_V2_ABI } from "../../../ABIs/GOVERNOR_V2_ABI";
import { TIMELOCK_V2_ABI } from "../../../ABIs/TIMELOCK_V2_ABI";
import { TOKEN_ABI } from "../../../ABIs/TOKEN_ABI";
import {
  BRIDGE_PROXY_ADDRESS_XDAI,
  GOVERNOR_V2_ADDRESS,
  PROVIDER_XDAI,
  TIMELOCK_V2_ADDRESS,
  TOKEN_ADDRESS,
} from "../../../constants";
import { PRIVATE_KEY_DEPLOYER } from "../../../privateKeys";

// Set Provider and Wallet

const web3 = new Web3(PROVIDER_XDAI);

const account = web3.eth.accounts.privateKeyToAccount(
  "0x" + PRIVATE_KEY_DEPLOYER
);
web3.eth.accounts.wallet.add(account);
web3.eth.defaultAccount = account.address;

// Get Contracts
const timelock = new web3.eth.Contract(TIMELOCK_V2_ABI, TIMELOCK_V2_ADDRESS);
const governor = new web3.eth.Contract(GOVERNOR_V2_ABI, GOVERNOR_V2_ADDRESS);
const token = new web3.eth.Contract(TOKEN_ABI, TOKEN_ADDRESS);

// Data for committee creation
const wrapperJson =
  "/Users/markusjungnickel/Desktop/Ethereum/zodiac/artifacts/contracts/Proxy/factory/wrapperFactory.sol/wrapperFactory.json";
var fs = require("fs");
var parsed = JSON.parse(fs.readFileSync(wrapperJson));
var abi = parsed.abi;
const iface = new ethers.utils.Interface(abi);

async function main() {
  const [deployer] = await ethers.getSigners();

  const owners = [
    "0xd377e2f8f2bFA990C7Ca2988c82e175aE5Faa341",
    "0x529F7DbD167ea367f72d95589DA986d2575F84e7",
  ];
  const salt = Date.now() * 1000 + Math.floor(Math.random() * 1000);
  const data = iface.encodeFunctionData("createSafeWrapperWithBudget", [
    deployer.address,
    "0x529F7DbD167ea367f72d95589DA986d2575F84e7",
    10000000000,
    0,
    "0x48cFabE06FD3c9B0cC0C602dAa8b6e893Fc31d96",
    1233124236,
    owners,
    1,
    "Voting Committee",
    "xDai",
  ]);

  let gas1 = await governor.methods
    .propose(
      [BRIDGE_PROXY_ADDRESS_XDAI],
      [0],
      [data],
      "Committee creation test",
      10
    )
    .estimateGas();
  gas1 = Math.trunc(gas1 * 1.1);
  const transaction_1 = governor.methods.propose(
    [BRIDGE_PROXY_ADDRESS_XDAI],
    [0],
    [data],
    "Committee creation test",
    10
  );
  console.log("pre Transaction...");
  await sendTransaction(GOVERNOR_V2_ADDRESS, transaction_1, gas1);

  let descriptionHash: String = web3.utils.keccak256("Committee creation test");
  const id = await governor.methods
    .hashProposal([BRIDGE_PROXY_ADDRESS_XDAI], [0], [data], descriptionHash)
    .call();
  console.log("id:", id);

  const state = await governor.methods.state(id.toString()).call();
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
