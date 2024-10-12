const { ethers } = require('ethers');
const optimismSDK = require('@eth-optimism/sdk');

const sendCrossChainMessage = async () => {
    // **L1 和 L2 网络配置**
    const l1Provider = new ethers.providers.JsonRpcProvider('http://43.156.76.214:8545'); // L1 RPC 地址
    const l2Provider = new ethers.providers.JsonRpcProvider('http://43.156.76.214:9545'); // L2 RPC 地址

    // **获取实际的链 ID**
    const l1ChainId = (await l1Provider.getNetwork()).chainId;
    const l2ChainId = (await l2Provider.getNetwork()).chainId;

    // **L2 上的发送者钱包**
    const l2WalletPrivateKey = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'; // 您的 L2 钱包私钥
    const l2Wallet = new ethers.Wallet(l2WalletPrivateKey, l2Provider);

    // **L2CrossDomainMessenger 合约地址**
    const l2MessengerAddress = '0x4200000000000000000000000000000000000007'; // 已确认存在

    // **目标 L1 合约地址**
    const targetL1Address = '0x15910ccc0CA0038a620ae48ee0FfD1a2fE0Aaa7B'; // 替换为目标 L1 合约地址

    // **要发送的消息数据**
    const messageData = ethers.utils.defaultAbiCoder.encode(
        ['string'], // 替换为目标合约的参数类型
        ['Hello from L2!'] // 替换为实际的数据
    );

    // **获取 L2 Messenger 合约实例**
    const l2MessengerABI = [
        'function sendMessage(address _target, bytes memory _message, uint32 _gasLimit) external'
    ];
    const l2Messenger = new ethers.Contract(l2MessengerAddress, l2MessengerABI, l2Wallet);

    // **发送跨链消息到 L1**
    const gasLimit = 2000000; // 发送消息的 gas 限制，可能需要增加
    console.log('正在发送跨链消息到 L1...');
    const tx = await l2Messenger.sendMessage(targetL1Address, messageData, gasLimit);
    console.log(`跨链消息已发送，L2 交易哈希：${tx.hash}`);

    // **等待 L2 上的交易被确认**
    await tx.wait();
    console.log('L2 上的跨链消息已确认。');

    // **步骤 3：在 L1 上确认消息**
    await confirmCrossChainMessageOnL1(tx.hash, l1Provider, l2Provider, l1ChainId, l2ChainId);
};

const confirmCrossChainMessageOnL1 = async (l2TxHash, l1Provider, l2Provider, l1ChainId, l2ChainId) => {
    const l1WalletPrivateKey = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'; // L1 上的私钥，用于确认消息
    const l1Wallet = new ethers.Wallet(l1WalletPrivateKey, l1Provider);

    const messenger = new optimismSDK.CrossChainMessenger({
        l1ChainId: l1ChainId,
        l2ChainId: l2ChainId,
        l1SignerOrProvider: l1Wallet,
        l2SignerOrProvider: l2Provider,
        bedrock: true,
        contracts: {
            l1: {
                AddressManager: '0xe4EB561155AFCe723bB1fF8606Fbfe9b28d5d38D', // 添加 AddressManager 地址
                L1CrossDomainMessenger: '0x15910ccc0CA0038a620ae48ee0FfD1a2fE0Aaa7B',
                OptimismPortal: '0x745556014659F7c493388Ff3ec3Fc31CF840db2a',
                L2OutputOracle: '0x60d37db59d0D14f7EA5c7425A2C03244E08B162D',
                L1StandardBridge: '0x6cb2c88ABCd6391F9496f44BE27d5D3b247E0159', // 添加 L1StandardBridge 地址
                StateCommitmentChain: '0x60d37db59d0D14f7EA5c7425A2C03244E08B162D', // 使用 L2OutputOracle 地址作为 StateCommitmentChain
                CanonicalTransactionChain: '0x745556014659F7c493388Ff3ec3Fc31CF840db2a', // 使用 OptimismPortal 地址作为 CanonicalTransactionChain
                BondManager: '0x745556014659F7c493388Ff3ec3Fc31CF840db2a', // 使用 OptimismPortal 地址作为 BondManager
            },
            l2: {
                StateCommitmentChain:'',
                L2CrossDomainMessenger: '0x4200000000000000000000000000000000000007',
            },
        },
    });

    let status;
    while (true) {
        try {
            console.log('正在检查跨链消息状态...');
            status = await messenger.getMessageStatus(l2TxHash);
            console.log('跨链消息状态：', optimismSDK.MessageStatus[status]);

            if (status === optimismSDK.MessageStatus.READY_FOR_RELAY) {
                console.log('消息已准备好在 L1 上进行确认...');
                const tx = await messenger.finalizeMessage(l2TxHash);
                console.log(`L1 上的消息确认交易哈希：${tx.hash}`);
                await tx.wait();
                console.log('消息已成功在 L1 上确认和执行。');
                break;
            } else if (status === optimismSDK.MessageStatus.RELAYED) {
                console.log('消息已经在 L1 上被确认和执行。');
                break;
            } else {
                console.log('消息尚未准备好在 L1 上确认，等待 30 秒后重试...');
                await new Promise((resolve) => setTimeout(resolve, 30000)); // 等待 30 秒
            }
        } catch (error) {
            console.error('检查消息状态时出错：', error);
            console.log('等待 30 秒后重试...');
            await new Promise((resolve) => setTimeout(resolve, 30000)); // 等待 30 秒
        }
    }
};

// 运行主函数
sendCrossChainMessage().catch((error) => {
    console.error('发生错误：', error);
});
