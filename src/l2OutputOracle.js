const { ethers } = require('ethers');

const l1Provider = new ethers.providers.JsonRpcProvider('http://43.156.76.214:8545');
const l2OutputOracleAddress = '0x60d37db59d0D14f7EA5c7425A2C03244E08B162D'; // L2OutputOracle 地址
const l2OutputOracleABI = [
    'function latestBlockNumber() view returns (uint256)',
    'function getL2Output(uint256) view returns (bytes32 outputRoot, uint256 timestamp, bytes32 stateRoot)'
];
const l2OutputOracle = new ethers.Contract(l2OutputOracleAddress, l2OutputOracleABI, l1Provider);

const checkStateRoot = async () => {
    const latestBlockNumber = await l2OutputOracle.latestBlockNumber();
    console.log('Latest L2 Output Block:', latestBlockNumber);
    
    const l2Output = await l2OutputOracle.getL2Output(latestBlockNumber);
    console.log('L2 Output:', l2Output);
};

checkStateRoot().catch(console.error);
