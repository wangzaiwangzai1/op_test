const { ethers } = require("ethers");

async function main() {
  const mnemonic = "test test test test test test test test test test test junk";
  const wallet = ethers.Wallet.fromMnemonic(mnemonic);
  console.log("Private Key:", wallet.privateKey);
}

main().catch((error) => {
  console.error(error);
});