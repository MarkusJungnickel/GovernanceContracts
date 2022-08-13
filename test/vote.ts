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
const description = "test";
const descriptionHash: String = web3.utils.keccak256(description);
chai.use(solidity);

let governor: Contract;
let token: Contract;
let timelock: Contract;
let deployer: SignerWithAddress;
let user1: SignerWithAddress;
let user2: SignerWithAddress;
let user3: SignerWithAddress;

before(async () => {
  await getAddresses();
  const governorFactoyr = await ethers.getContractFactory("GovernorCoreV2");
  governor = await governorFactoyr.deploy();
  await governor.deployed();

  const timelockFactory = await ethers.getContractFactory("TimeLockModuleV2");
  timelock = await timelockFactory.deploy();
  await timelock.deployed();
  await timelock.initialize(
    1,
    [governor.address, deployer.address],
    [governor.address, deployer.address]
  );
  await setBalance(timelock.address, 100000000000000000000n);

  const tokenFactory = await ethers.getContractFactory("GovToken");
  token = await tokenFactory.deploy();
  await token.deployed();
  await token.initialize("GovToken", "GVT");

  await governor.initialize(token.address, timelock.address, 10, 10);

  console.log(
    `Contracts have been deployed: \nGovernor: ${governor.address}\nTimelock: ${timelock.address}\nToken: ${token.address}\n`
  );
});

describe("Gov token", function () {
  it("Grant voting rights", async function () {
    await token.mint(user1.address, 1000);
    await token.connect(user1).delegate(user1.address);
    expect(Number(await token.balanceOf(user1.address))).to.equal(1000);
    expect(Number(await token.getVotes(user1.address))).to.equal(1000);
  });
  it("Read past voting rights", async function () {
    let blockNumber = await ethers.provider.getBlock("latest");
    await moveBlocks(2);
    await token.mint(user1.address, 1000);
    await token.connect(user1).delegate(user1.address);
    expect(Number(await token.balanceOf(user1.address))).to.equal(2000);
    expect(Number(await token.getVotes(user1.address))).to.equal(2000);
    expect(
      Number(await token.getPastVotes(user1.address, blockNumber.number))
    ).to.equal(1000);
  });
  it("Use voting rights", async function () {
    await token.burn(user1.address, 1100);
    expect(Number(await token.balanceOf(user1.address))).to.equal(900);
    expect(Number(await token.getVotes(user1.address))).to.equal(900);
  });
  it("Transfer voting rights", async function () {
    await token.transferFrom(user1.address, user2.address, 100);
    await token.connect(user2).delegate(user2.address);
    expect(Number(await token.balanceOf(user1.address))).to.equal(800);
    expect(Number(await token.getVotes(user1.address))).to.equal(800);
    expect(Number(await token.balanceOf(user2.address))).to.equal(100);
    expect(Number(await token.getVotes(user2.address))).to.equal(100);
  });
  it("Lock voting rights", async function () {
    await token.lockVotes(user1.address, 100, 1);
    expect(Number(await token.balanceOf(user1.address))).to.equal(800);
    expect(Number(await token.getVotes(user1.address))).to.equal(700);
    expect(Number(await token.getLockedVotes(user1.address, 1))).to.equal(100);
    await token.freeVotes(user1.address, 100, 1);
    expect(Number(await token.getVotes(user1.address))).to.equal(800);
    expect(Number(await token.getLockedVotes(user1.address, 1))).to.equal(0);
  });
});

describe("Optimistic governance", function () {
  it("Create a proposal", async function () {
    await governor
      .connect(user1)
      .propose(
        ["0x0000000000000000000000000000000000000000"],
        [1],
        [0],
        description,
        10
      );

    const id = await governor.hashProposal(
      ["0x0000000000000000000000000000000000000000"],
      [1],
      [0],
      descriptionHash
    );
    expect(Number(await token.getLockedVotes(user1.address, id))).to.equal(10);
  });
  it("Queue & execute unobjected proposal", async function () {
    const id = await governor.hashProposal(
      ["0x0000000000000000000000000000000000000000"],
      [1],
      [0],
      descriptionHash
    );

    expect(await governor.state(id)).to.equal(0);
    await moveBlocks(3);
    expect(await governor.state(id)).to.equal(1);
    await moveBlocks(33);
    await governor.queue(
      ["0x0000000000000000000000000000000000000000"],
      [1],
      [0],
      descriptionHash
    );
    await moveBlocks(2);
    expect(await governor.state(id)).to.equal(5);
    await governor.execute(
      ["0x0000000000000000000000000000000000000000"],
      [1],
      [0],
      descriptionHash
    );
    expect(await governor.state(id)).to.equal(7);
    await governor.retrieveStake(id);
  });
  it("Proposal objected", async function () {
    await governor
      .connect(user1)
      .propose(
        ["0x0000000000000000000000000000000000000000"],
        [2],
        [0],
        description,
        10
      );
    const id = await governor.hashProposal(
      ["0x0000000000000000000000000000000000000000"],
      [2],
      [0],
      descriptionHash
    );
    await moveBlocks(1);
    await governor.connect(user2).object(id, 10, "", [0]);
    expect(Number(await token.getLockedVotes(user1.address, id))).to.equal(10);
    expect(Number(await token.getLockedVotes(user2.address, id))).to.equal(10);
    await moveBlocks(3);
    expect(await governor.state(id)).to.equal(1);
    await moveBlocks(33);
    await expect(
      governor.queue(
        ["0x0000000000000000000000000000000000000000"],
        [2],
        [0],
        descriptionHash
      )
    ).to.be.reverted;
  });
  it("Stake transferred to winner", async function () {
    const id = await governor.hashProposal(
      ["0x0000000000000000000000000000000000000000"],
      [2],
      [0],
      descriptionHash
    );
    expect(Number(await token.balanceOf(user2.address))).to.equal(100);
    expect(Number(await token.getVotes(user2.address))).to.equal(90);
    expect(Number(await token.balanceOf(user1.address))).to.equal(800);
    expect(Number(await token.getVotes(user1.address))).to.equal(790);
    await governor.retrieveStake(id);
    await moveBlocks(3);
    expect(Number(await token.balanceOf(user2.address))).to.equal(110);
    expect(Number(await token.getVotes(user2.address))).to.equal(110);
    expect(Number(await token.balanceOf(user1.address))).to.equal(790);
    expect(Number(await token.getVotes(user1.address))).to.equal(790);
  });
});

describe("Quadratic Voting", function () {
  it("Unable to vote on unobjected proposal", async function () {
    await governor
      .connect(user1)
      .propose(
        ["0x0000000000000000000000000000000000000000"],
        [3],
        [0],
        description,
        10
      );
    const id = await governor.hashProposal(
      ["0x0000000000000000000000000000000000000000"],
      [3],
      [0],
      descriptionHash
    );
    await expect(governor.castVote(id, 1, 1)).to.be.reverted;
  });
  // PROBLEM -> when reset the deadline also reset the time at which check the available votes
  it("Vote on objected proposal", async function () {
    await token.mint(user3.address, 1000);
    await token.connect(user3).delegate(user3.address);
    expect(Number(await token.balanceOf(user3.address))).to.equal(1000);
    expect(Number(await token.getVotes(user3.address))).to.equal(1000);
    await token.mint(deployer.address, 1000);
    await token.delegate(deployer.address);
    const id = await governor.hashProposal(
      ["0x0000000000000000000000000000000000000000"],
      [3],
      [0],
      descriptionHash
    );
    await moveBlocks(1);
    await governor.connect(user2).object(id, 10, "", [0]);
    await moveBlocks(1);
    await governor.connect(user3).castVote(id, 0, 1);
    expect(Number(await token.balanceOf(user3.address))).to.equal(999);
    expect(Number(await token.getVotes(user3.address))).to.equal(999);
  });
  it("Cannot exceed available votes", async function () {
    const id = await governor.hashProposal(
      ["0x0000000000000000000000000000000000000000"],
      [3],
      [0],
      descriptionHash
    );
    await expect(governor.castVote(id, 1, 100)).to.be.reverted;
  });
  it("Counting is quadratic", async function () {
    const id = await governor.hashProposal(
      ["0x0000000000000000000000000000000000000000"],
      [3],
      [0],
      descriptionHash
    );
    await governor.castVote(id, 1, 30);
    expect(Number(await token.balanceOf(deployer.address))).to.equal(100);
    expect(Number(await token.getVotes(deployer.address))).to.equal(100);
    const votes = await governor.proposalVotes(id);
    expect(votes[0]).to.equal(4);
    expect(votes[1]).to.equal(33);
    expect(votes[2]).to.equal(0);
  });

  it("Stake is transferred to winner", async function () {
    const id = await governor.hashProposal(
      ["0x0000000000000000000000000000000000000000"],
      [3],
      [0],
      descriptionHash
    );
    await moveBlocks(33);
    expect(Number(await token.balanceOf(user2.address))).to.equal(110);
    expect(Number(await token.getVotes(user2.address))).to.equal(100);
    expect(Number(await token.balanceOf(user1.address))).to.equal(790);
    expect(Number(await token.getVotes(user1.address))).to.equal(780);
    await governor.retrieveStake(id);
    await moveBlocks(3);
    expect(Number(await token.balanceOf(user2.address))).to.equal(100);
    expect(Number(await token.getVotes(user2.address))).to.equal(100);
    expect(Number(await token.balanceOf(user1.address))).to.equal(800);
    expect(Number(await token.getVotes(user1.address))).to.equal(800);
  });
  it("Queue and Execute", async function () {
    await governor.queue(
      ["0x0000000000000000000000000000000000000000"],
      [3],
      [0],
      descriptionHash
    );
    await moveBlocks(3);
    await governor.execute(
      ["0x0000000000000000000000000000000000000000"],
      [3],
      [0],
      descriptionHash
    );
  });
});

async function getAddresses() {
  var [deployerLoc, addr1Loc, addr2Loc, addr3Loc] = await ethers.getSigners();
  deployer = deployerLoc;
  user1 = addr1Loc;
  user2 = addr2Loc;
  user3 = addr3Loc;
}
