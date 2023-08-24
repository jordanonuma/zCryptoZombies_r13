const axios = require('axios')
const BN = require('bn.js')
const common = require('./utils/common.js')
const SLEEP_INTERVAL = process.env.SLEEP_INTERVAL || 2000
const PRIVATE_KEY_FILE_NAME = process.env.PRIVATE_KEY_FILE || './oracle/oracle_private_key' //hypothetically stored
const CHUNK_SIZE = process.env.CHUNK_SIZE || 3
const MAX_RETRIES = process.env.MAX_RETRIES || 5
const OracleJSON = require('./oracle/build/contracts/EthPriceOracle.json') //hypothetically stored
var pendingRequests = []

async function getOracleContract(web3js) {
    const networkId = await web3js.eth.net.getId()
    return new web3js.eth.Contract(OracleJSON.abi, OracleJSON.networks[networkId].address)
} //end function getOracleContract()

async function retrieveLatestEthPrice () {
    const resp = await axios({
      url: 'https://api.binance.com/api/v3/ticker/price',
      params: {
        symbol: 'ETHUSDT'
      },
      method: 'get'
    })
    return resp.data.price
} //end function retrieveLatestEthPrice()

async function filterEvents (oracleContract, web3js) {
    oracleContract.events.GetLatestEthPriceEvent(async (err, event) => {
      if (err) {
        console.error('Error on event', err)
        return
      } //end if()
      await addRequestToQueue(event)
    }) //end GetLatestEthPriceEvent()
  
    oracleContract.events.SetLatestEthPriceEvent(async (err, event) => {
      if (err) {
        console.error('Error on event', err)
        return
      } //end if()
      
    }) //end SetLatestEthPriceEvent()
} //end filterEvents()

async function addRequestToQueue (event) {
    const callerAddress = event.returnValues.callerAddress
    const id = event.returnValues.id
    pendingRequests.push({ callerAddress, id })
} //end function addRequestToQueue()

async function processQueue (oracleContract, ownerAddress) {
    let processedRequests = 0
    while (pendingRequests.length > 0 && processedRequests < CHUNK_SIZE) {
        const req = pendingRequests.shift()
        await processRequest(oracleContract, ownerAddress, req.id, req.callerAddress)
        processedRequests++
    } //end while()
} //end function processQueue()

async function processRequest(oracleContract, ownerAddress, id, callerAddress) {
    let retries = 0
    while (retries < MAX_RETRIES) {
        try {
            const ethPrice = await retrieveLatestEthPrice()
            await setLatestEthPrice(oracleContract, callerAddress, ownerAddress, ethPrice, id)
            return
        } catch (error) {
            if (retries === MAX_RETRIES - 1) {
                await setLatestEthPrice(oracleContract, callerAddress, ownerAddress, '0', id)
                return
            } //end if()
            retries++
        } //end try-catch{}
    } //end while()
} //end function processRequest()

async function setLatestEthPrice (oracleContract, callerAddress, ownerAddress, ethPrice, id) {
    ethPrice = ethPrice.replace('.', '')
    const multiplier = new BN(10**10, 10)
    const ethPriceInt = (new BN(parseInt(ethPrice), 10)).mul(multiplier)
    const idInt = new BN(parseInt(id))
    try {
        await oracleContract.methods.setLatestEthPrice(ethPriceInt.toString(), callerAddress, idInt.toString()).send({ from: ownerAddress })
    } catch (error) {
        console.log('Error encountered while calling setLatestEthPrice.')
        
    }
} //end function setLatestEthPrice()

async function init () {
    const {ownerAddress, web3js, client} = common.loadAccount(FILE_NAME)
    const oracleContract = await getOracleContract(web3js)
    filterEvents(oracleContract, web3js)
    return {oracleContract, ownerAddress, client}
} //end function init()

(async () => {
    const { oracleContract, ownerAddress, client } = await init()
    process.on( 'SIGINT', () => {
        console.log('Calling client.disconnect()')
      
        process.exit( )
    })
    setInterval(async () => {
        
    }, SLEEP_INTERVAL)
  })()