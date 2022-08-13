import { ethers } from "hardhat";
import Web3 from "web3";
import { BUDGET_MODIFIER_ABI } from "../../ABIs/BUDGET_MODIFIER_ABI";
import {
  BUDGET_MODIFIER_LOGIC_ADDRESS,
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
  const modifierProxyFactory = await ethers.getContractFactory("springProxy");
  let modifierProxy = await modifierProxyFactory.deploy(
    BUDGET_MODIFIER_LOGIC_ADDRESS
  );
  await modifierProxy.deployed();
  console.log("Modifier Proxy Address:", modifierProxy.address);

  // INITIALIZE
  const modifier = new web3.eth.Contract(
    BUDGET_MODIFIER_ABI,
    modifierProxy.address
  );
  const parametersModifier = web3.eth.abi.encodeParameters(
    ["address"],
    [deployer.address]
  );

  let gas_1 = await modifier.methods
    .initialize(parametersModifier)
    .estimateGas();
  gas_1 = Math.trunc(gas_1 * 1.1);
  const transaction_1 = modifier.methods.initialize(parametersModifier);
  await sendTransaction(modifierProxy.address, transaction_1, gas_1);
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
