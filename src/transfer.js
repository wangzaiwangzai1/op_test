const { ethers } = require('ethers');

const transferFunds = async () => {
    // 连接到 L2 节点
    const provider = new ethers.providers.JsonRpcProvider("http://43.156.76.214:9545");

    // 使用助记词生成钱包
    const mnemonic = 'test test test test test test test test test test test junk';
    const wallet = ethers.Wallet.fromMnemonic(mnemonic).connect(provider);

    // 打印钱包地址
    console.log(`您的钱包地址：${wallet.address}`);

    // 检查钱包余额
    const balance = await wallet.getBalance();
    console.log(`钱包余额：${ethers.utils.formatEther(balance)} ETH`);

    // 确认余额足够转账
    const amountInEth = '10'; // 您想要转账的金额，可以修改
    const amountInWei = ethers.utils.parseEther(amountInEth);

    if (balance.lt(amountInWei)) {
        console.log('余额不足，无法完成转账。');
        return;
    }

    // 目标地址
    const recipientAddress = '0x2cDa6772DC431781e737999e1Ed56594FAFF2876';

    // 创建并发送交易
    try {
        const tx = await wallet.sendTransaction({
            to: recipientAddress,
            value: amountInWei,
            gasLimit: 30000, // 标准 ETH 转账的 gas 限制
            gasPrice: ethers.utils.parseUnits('1', 'gwei'), // 在私有链中，gasPrice 通常为 0
        });

        console.log(`交易已发送！交易哈希：${tx.hash}`);

        // 等待交易被确认
        const receipt = await tx.wait();

        if (receipt.status === 1) {
            console.log('交易成功！');
            console.log(`交易详情：\n${JSON.stringify(receipt, null, 2)}`);
        } else {
            console.log('交易失败。');
        }
    } catch (error) {
        console.error('发送交易时出错：', error);
    }
};

transferFunds();
