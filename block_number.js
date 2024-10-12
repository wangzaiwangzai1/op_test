const { ethers } = require('ethers');

const getBalance = async () => {
    // 连接到您的 L2 节点
    const provider = new ethers.providers.JsonRpcProvider("http://43.156.76.214:9545");

    // 使用助记词生成钱包
    const mnemonic = 'test test test test test test test test test test test junk';
    const wallet = ethers.Wallet.fromMnemonic(mnemonic);

    // 将钱包连接到提供商
    const connectedWallet = wallet.connect(provider);

    // 获取钱包余额
    const balance = await connectedWallet.getBalance();

    // 输出余额
    console.log(`地址 ${connectedWallet.address} 的余额为：`, ethers.utils.formatEther(balance), 'ETH');
}

getBalance();
