import { network } from "hardhat";

// tells the network i.e. hardhat in this case, to mine a block
// the amount of times specified
export const moveBlocks = async (amount: number) => {
  for (let i = 0; i < amount; i++) {
    await network.provider.request({
      method: "evm_mine",
      params: [],
    });
  }
  //console.log(`Moved ${amount} blocks`);
};

export const moveTime = async (amount: number) => {
  await network.provider.send("evm_increaseTime", [amount]);
  //console.log(`Moved ${amount} seconds`);
};
