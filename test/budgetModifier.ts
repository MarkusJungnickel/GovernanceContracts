import { setBalance } from "@nomicfoundation/hardhat-network-helpers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import chai, { expect } from "chai";
import { solidity } from "ethereum-waffle";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import Web3 from "web3";
import { moveBlocks } from "../helpers";
const provider =
  "https://eth-rinkeby.alchemyapi.io/v2/u4kDg20QopAesjF2c1w_9CuvG84D-78_";
const web3 = new Web3(provider);
chai.use(solidity);

let dummyAvatar: Contract;
let safeWrapper: Contract;
let budgetModifier: Contract;
let deployer: SignerWithAddress;
let addr1: SignerWithAddress;
let addr2: SignerWithAddress;
let addr3: SignerWithAddress;

before(async () => {
  await getAddresses();
  const dummyAvatarFactory = await ethers.getContractFactory("dummyAvatar");
  dummyAvatar = await dummyAvatarFactory.deploy();
  await dummyAvatar.deployed();
  await setBalance(dummyAvatar.address, 10000000000000000000n);

  const budgetModifierFactory = await ethers.getContractFactory(
    "budgetModifier"
  );
  budgetModifier = await budgetModifierFactory.deploy(deployer.address);
  await budgetModifier.deployed();

  const safeWrapperFactory = await ethers.getContractFactory("safeWrapperBase");
  // deployer acts as safe here
  safeWrapper = await safeWrapperFactory.deploy();
  await safeWrapper.deployed();
  const parameters = web3.eth.abi.encodeParameters(
    ["address", "address", "string", "string"],
    [deployer.address, deployer.address, "test", "testSector"]
  );
  await safeWrapper.initialize(parameters);
  await safeWrapper.enableAvatar(dummyAvatar.address);
  await safeWrapper.setTarget(budgetModifier.address, dummyAvatar.address);

  console.log(
    `Contracts have been deployed: \nModule: ${safeWrapper.address}\nModifier: ${budgetModifier.address}\nSafe: ${dummyAvatar.address}\n`
  );
});

describe("Core Functionality", function () {
  it("Enable Modification", async function () {
    await budgetModifier.enableModification(
      safeWrapper.address,
      dummyAvatar.address
    );
    expect(await budgetModifier.isAvatarEnabled(dummyAvatar.address)).to.equal(
      true
    );
    expect(await budgetModifier.isModuleEnabled(safeWrapper.address)).to.equal(
      true
    );
  });
});

describe("One-Off Budget Functionality", function () {
  it("Budget exceeded", async function () {
    await budgetModifier.setBudget(safeWrapper.address, 100, 0);
    await expect(
      safeWrapper.sendEth(addr1.address, 1000, dummyAvatar.address)
    ).to.be.revertedWith("Request exceeds budget");
  });
  it("Within budget", async function () {
    await safeWrapper.sendEth(addr1.address, 99, dummyAvatar.address);
    expect(await addr1.getBalance()).to.equal(10000000000000000000099n);
  });
  it("Budget used up ", async function () {
    await expect(
      safeWrapper.sendEth(addr1.address, 2, dummyAvatar.address)
    ).to.be.revertedWith("Request exceeds budget");
  });
});

describe("Interval budget", function () {
  it("Budget exceeded", async function () {
    await budgetModifier.setBudget(safeWrapper.address, 100, 10);
    await expect(
      safeWrapper.sendEth(addr1.address, 1000, dummyAvatar.address)
    ).to.be.revertedWith("Request exceeds budget");
  });
  it("Within budget", async function () {
    await safeWrapper.sendEth(addr1.address, 100, dummyAvatar.address);
    expect(await addr1.getBalance()).to.equal(10000000000000000000199n);
  });
  it("Interval Works", async function () {
    await moveBlocks(11);
    await safeWrapper.sendEth(addr1.address, 100, dummyAvatar.address);
    expect(await addr1.getBalance()).to.equal(10000000000000000000299n);
    await moveBlocks(4);
    await expect(
      safeWrapper.sendEth(addr1.address, 10, dummyAvatar.address)
    ).to.be.revertedWith("Request exceeds budget");
  });
});

describe("Freeze budget", function () {
  it("Freezing the budget", async function () {
    await moveBlocks(6);
    await budgetModifier.setFreeze(safeWrapper.address);
    await expect(
      safeWrapper.sendEth(addr1.address, 10, dummyAvatar.address)
    ).to.be.revertedWith("Budget is frozen");
  });
  it("Unfreezing the budget", async function () {
    await budgetModifier.setFreeze(safeWrapper.address);
    await safeWrapper.sendEth(addr1.address, 100, dummyAvatar.address);
    expect(await addr1.getBalance()).to.equal(10000000000000000000399n);
  });
});

async function getAddresses() {
  var [deployerLoc, addr1Loc, addr2Loc, addr3Loc] = await ethers.getSigners();
  deployer = deployerLoc;
  addr1 = addr1Loc;
  addr2 = addr2Loc;
  addr3 = addr3Loc;
}
