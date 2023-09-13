async function getZkSyncProvider(zksync, networkName) {
    let zkSyncProvider
    try {
        zkSyncProvider = await zksync.getDefaultProvider(networkName)
    } catch (error) {
        console.log('Unable to connect to zkSync.')
        console.log(error)
    }
    return zkSyncProvider
} //end function getZkSyncProvider()
  
async function getEthereumProvider (ethers, networkName) {
    let ethersProvider
    try {
        // eslint-disable-next-line new-cap
        ethersProvider = new ethers.getDefaultProvider(networkName)
    } catch (error) {
        console.log('Could not connect to Rinkeby')
        console.log(error)
    }
    return ethersProvider
} //end function getEthereumProvider()

async function initAccount(rinkebyWallet, zkSyncProvider, zksync) {
    const zkSyncWallet = await zksync.Wallet.fromEthSigner(rinkebyWallet, zkSyncProvider)
    return zkSyncWallet
} //end function initAccount()

async function registerAccount (wallet) {
    console.log(`Registering the ${wallet.address()} account on zkSync`)
    if (!await wallet.isSigningKeySet()) {
        if (await wallet.getAccountId() === undefined) {
            throw new Error('Unknown account')
        } //end if()
        const changePubkey = await wallet.setSigningKey()
        await changePubkey.awaitReceipt()
    } //end if()
    console.log(`Account ${wallet.address()} registered`)
    
} //end function registerAccount()

async function depositToZkSync(zkSyncWallet, token, amountToDeposit, ethers) {
    const deposit = await zkSyncWallet.depositToSyncFromEthereum({
      depositTo: zkSyncWallet.address(),
      token: token,
      amount: ethers.utils.parseEther(amountToDeposit)
    })
    try {
      await deposit.awaitReceipt()
    } catch (error) {
      console.log('Error while awaiting confirmation from the zkSync operators.')
      console.log(error)
    }
} //end function depositToZkSync()
  
async function transfer(from, toAddress, amountToTransfer, transferFee, token, zksync, ethers) {

} //end function transfer()