const { ethers } = require('ethers');

const getChainIds = async () => {
    const l1Provider = new ethers.providers.JsonRpcProvider('http://43.156.76.214:8545');
    const l2Provider = new ethers.providers.JsonRpcProvider('http://43.156.76.214:9545');
  
    const l1ChainId = (await l1Provider.getNetwork()).chainId;
    const l2ChainId = (await l2Provider.getNetwork()).chainId;
  
    console.log('L1 Chain ID:', l1ChainId);
    console.log('L2 Chain ID:', l2ChainId);
  };
  
  getChainIds();