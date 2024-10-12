const { ethers } = require('ethers');

const getContractCode = async (provider, address) => {
  const code = await provider.getCode(address);
  if (code === '0x') {
    console.log(`地址 ${address} 上没有合约部署`);
  } else {
    console.log(`地址 ${address} 上存在合约`);
  }
};

// 替换为您的 L1 和 L2 提供者
const l1Provider = new ethers.providers.JsonRpcProvider('http://43.156.76.214:8545');
const l2Provider = new ethers.providers.JsonRpcProvider('http://43.156.76.214:9545');

// 检查可能的合约地址
getContractCode(l1Provider, '0x6900000000000000000000000000000000000001'); // L1CrossDomainMessenger
getContractCode(l1Provider, '0x6900000000000000000000000000000000000002'); // OptimismPortal
getContractCode(l1Provider, '0x6900000000000000000000000000000000000003'); // L2OutputOracle
getContractCode(l2Provider, '0x4200000000000000000000000000000000000007'); // L2CrossDomainMessenger
