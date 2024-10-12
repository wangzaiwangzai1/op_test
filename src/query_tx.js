const { ethers } = require('ethers');

const getL2TransactionDetails = async () => {
    // **步骤 1：连接到 L2 节点**
    const l2Provider = new ethers.providers.JsonRpcProvider('http://43.156.76.214:9545'); // L2 RPC 地址

    // **步骤 2：指定要查询的交易哈希**
    const txHash = '0xb5e012795b8f16f173346473b2a0833b81596ef0df5cb9c1b80246835823266c'; // 替换为您的实际交易哈希

    try {
        // **步骤 3：获取交易详情**
        const tx = await l2Provider.getTransaction(txHash);
        if (!tx) {
            console.log('找不到此交易，可能交易哈希不正确或尚未在链上确认。');
            return;
        }

        console.log('交易详细信息：');
        console.log(`  交易哈希：${tx.hash}`);
        console.log(`  发送方地址：${tx.from}`);
        console.log(`  接收方地址：${tx.to}`);
        console.log(`  交易金额：${ethers.utils.formatEther(tx.value)} ETH`);
        console.log(`  Gas 费用上限：${tx.gasLimit.toString()}`);
        console.log(`  Gas 价格：${ethers.utils.formatUnits(tx.gasPrice, 'gwei')} Gwei`);
        console.log(`  交易数据：${tx.data}`);
        console.log(`  区块号：${tx.blockNumber}`);

        // **步骤 4：获取交易收据**
        const receipt = await l2Provider.getTransactionReceipt(txHash);
        if (receipt) {
            console.log('交易收据：');
            console.log(`  状态：${receipt.status === 1 ? '成功' : '失败'}`);
            console.log(`  确认数：${receipt.confirmations}`);
            console.log(`  使用的 Gas：${receipt.gasUsed.toString()}`);
            console.log(`  日志数量：${receipt.logs.length}`);
            receipt.logs.forEach((log, index) => {
                console.log(`  日志 ${index + 1}:`);
                console.log(`    地址：${log.address}`);
                console.log(`    数据：${log.data}`);
                console.log(`    主题：${log.topics.join(', ')}`);
            });
        } else {
            console.log('交易收据不可用，交易可能尚未确认。');
        }
    } catch (error) {
        console.error('获取交易详细信息时出错：', error);
    }
};

getL2TransactionDetails();
