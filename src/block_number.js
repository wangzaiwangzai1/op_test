const { ethers, JsonRpcProvider } = require('ethers');

const getBlock = async() => {
    const provider = new ethers.providers.JsonRpcProvider("http://43.156.76.214:9545");
    const blockNumber = await provider.getBlockNumber();
    console.log(blockNumber)
}

getBlock();