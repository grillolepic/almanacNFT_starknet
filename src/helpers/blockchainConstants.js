const etherAddress = {
  '0x534e5f4d41494e': '0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7',
  '0x534e5f474f45524c49': '0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7'
}

const networkName = {
  '0x534e5f4d41494e': 'StarkNet Mainnet',
  '0x534e5f474f45524c49': 'StarkNet Goerli Testnet'
}

const serverNetworkTag = {
  '0x534e5f4d41494e': 'starknet',
  '0x534e5f474f45524c49': 'starknet_goerli'
}

const almanacAddress = {
  '0x534e5f4d41494e': '0x07d4dc2bf13ede97b9e458dc401d4ff6dd386a02049de879ebe637af8299f91d',
  '0x534e5f474f45524c49': '0x07d4dc2bf13ede97b9e458dc401d4ff6dd386a02049de879ebe637af8299f91d'
}

const supportedChainIds = ['0x534e5f4d41494e']
const defaultChainId = '0x534e5f4d41494e'
const ownerAddress = '0x00ae69b54f98b2e717c939ece7bd61769f2e47fb675deac2ab24fe9934a67c5f'

function isTestnet(chainId) {
  return chainId != '0x534e5f4d41494e';
}

export {
  networkName,
  almanacAddress,
  supportedChainIds,
  defaultChainId,
  etherAddress,
  serverNetworkTag,
  ownerAddress,
  isTestnet
}
