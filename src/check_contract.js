const { ethers } = require('ethers');

const checkIfContractExists = async () => {
    // 连接到以太坊网络（可以是 L1 或 L2）
    const provider = new ethers.providers.JsonRpcProvider('http://43.156.76.214:8545'); // 替换为您的节点 RPC 地址

    // 要检查的合约地址
    const contractAddress = '0x15910ccc0CA0038a620ae48ee0FfD1a2fE0Aaa7B'; // 替换为您要检查的合约地址

    // 获取该地址上的字节码
    const code = await provider.getCode(contractAddress);
    
    // 检查字节码是否为空
    if (code === '0x') {
        console.log(`地址 ${contractAddress} 上没有部署合约。`);
    } else {
        console.log(`地址 ${contractAddress} 上存在一个合约。`);
    }
};

checkIfContractExists();
