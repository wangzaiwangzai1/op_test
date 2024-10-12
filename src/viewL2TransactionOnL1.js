const { ethers } = require('ethers');
const optimismSDK = require('@eth-optimism/sdk');

const viewL2TransactionOnL1 = async () => {
    // **步骤 1：获取 Batcher 的地址**
    const mnemonic = 'test test test test test test test test test test test junk';
    const batcherWallet = ethers.Wallet.fromMnemonic(mnemonic);
    const batcherAddress = batcherWallet.address;
    console.log(`Batcher 地址：${batcherAddress}`);

    // **步骤 2：连接到 L2 和 L1 节点**
    const l1Provider = new ethers.providers.JsonRpcProvider('http://43.156.76.214:8545'); // L1 RPC 地址
    const l2Provider = new ethers.providers.JsonRpcProvider('http://43.156.76.214:9545'); // L2 RPC 地址

    // **步骤 3：获取 L2 区块的时间戳**
    const l2BlockNumber = 481955; // 您的 L2 区块高度
    // const l2BlockNumber = await l2Provider.getBlockNumber();
    const l2Block = await l2Provider.getBlock(l2BlockNumber);
    if (!l2Block) {
        console.log(`在 L2 上找不到区块 ${l2BlockNumber}`);
        return;
    }
    const l2BlockTimestamp = l2Block.timestamp;
    console.log(`L2 区块 ${l2BlockNumber} 的时间戳为 ${l2BlockTimestamp}`);

    // **步骤 4：根据 L2 区块的时间戳，在 L1 上查找 Batch 提交交易**
    console.log('正在查找 L1 上的 Batch 提交交易...');
    const maxBlocksToCheck = 10000; // 检查最近 10,000 个区块
    let batchTx = null;

    // 获取 L1 上最近的区块高度
    const latestL1Block = await l1Provider.getBlockNumber();

    // 从最新区块往前查找
    for (let i = latestL1Block; i > latestL1Block - maxBlocksToCheck && i >= 0; i--) {
        const block = await l1Provider.getBlockWithTransactions(i);
        if (!block) {
            console.log(`区块 ${i} 数据不可用，跳过该区块。`);
            continue;
        }

        // 如果 L1 区块的时间戳比 L2 的区块时间戳还要小，停止查找
        if (block.timestamp < l2BlockTimestamp) {
            break;
        }

        // 检查每个交易，看看是否是从 Batcher 地址发出的
        for (const tx of block.transactions) {
            if (tx.from.toLowerCase() === batcherAddress.toLowerCase()) {
                batchTx = tx;
                console.log(`找到的 Batch 提交交易哈希：${batchTx.hash}`);
                break;
            }
        }

        if (batchTx) {
            break;
        }
    }

    if (!batchTx) {
        console.log('在给定的区块范围内没有找到来自 Batcher 的交易。');
        return;
    }

    // **步骤 5：获取 Batch 提交交易的详细信息**
    const receipt = await l1Provider.getTransactionReceipt(batchTx.hash);
    if (receipt) {
        console.log('Batch 提交交易的详细信息：');
        console.log(`  交易哈希：${receipt.transactionHash}`);
        console.log(`  区块号：${receipt.blockNumber}`);
        console.log(`  Gas 使用情况：${receipt.gasUsed.toString()}`);
        console.log(`  确认数：${receipt.confirmations}`);
        console.log(`  日志数量：${receipt.logs.length}`);

        // 解析交易收据中的日志
        const messenger = new optimismSDK.CrossChainMessenger({
            l1ChainId: 1, // L1 链 ID
            l2ChainId: 10, // L2 链 ID
            l1SignerOrProvider: l1Provider,
            l2SignerOrProvider: l2Provider,
        });

        const parsedLogs = receipt.logs.map((log) => {
            try {
                return messenger.contracts.l1.OptimismPortal.interface.parseLog(log);
            } catch (error) {
                return null;
            }
        }).filter(log => log !== null);

        if (parsedLogs.length > 0) {
            console.log('解析到以下事件：');
            parsedLogs.forEach((log, index) => {
                console.log(`事件 ${index + 1}:`);
                console.log(`  事件名称：${log.name}`);
                console.log(`  事件数据：${JSON.stringify(log.args, null, 2)}`);
            });
        } else {
            console.log('未能解析任何事件。');
        }
    } else {
        console.log('Batch 提交的交易收据不可用。');
    }
};

viewL2TransactionOnL1();
