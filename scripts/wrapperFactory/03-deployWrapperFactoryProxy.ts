import { ethers } from "hardhat";
import Web3 from "web3";
import { FACTORY_ABI } from "../../ABIs/FACTORY_ABI";
import {
  GNOSIS_SAFE_FACTORY,
  GNOSIS_SAFE_LOGIC,
  PROVIDER_RINKEBY,
  SAFE_WRAPPER_LOGIC_ADDRESS,
  WRAPPER_FACTORY_LOGIC_ADDRESS,
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
  const wrapperFactoryProxyFactory = await ethers.getContractFactory(
    "springProxy"
  );
  let factoryProxy = await wrapperFactoryProxyFactory.deploy(
    WRAPPER_FACTORY_LOGIC_ADDRESS
  );
  await factoryProxy.deployed();
  console.log("Factory Proxy Address:", factoryProxy.address);

  // INITIALIZE
  const factory = new web3.eth.Contract(FACTORY_ABI, factoryProxy.address);
  const parametersFactory = web3.eth.abi.encodeParameters(
    ["address", "address", "address", "address"],
    [
      deployer.address,
      SAFE_WRAPPER_LOGIC_ADDRESS,
      GNOSIS_SAFE_FACTORY,
      GNOSIS_SAFE_LOGIC,
    ]
  );

  let gas_1 = await factory.methods.initialize(parametersFactory).estimateGas();
  gas_1 = Math.trunc(gas_1 * 1.1);
  const transaction_1 = factory.methods.initialize(parametersFactory);
  await sendTransaction(factoryProxy.address, transaction_1, gas_1);
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
