const CryptoZombies = artifacts.require("CryptoZombies");

contract("CryptoZombies", (accounts) => {
    let [alice, bob] = accounts;
    let contractInstance;

    beforeEach(async () => {
        contractInstance = await CryptoZombies.new();
        
    }); //end beforeEach()

    it("should be able to create a new zombie", async () => {
        const contractInstance = new CryptoZombies.new();
        const result = await contractInstance.createRandomZombie(zombieNames[0], {from: alice});
        assert.equal(result.receipt.status, true);
        assert.equal(result.logs[0].args.name, zombieNames[0]);
    }) //end it()

    it("should not allow two zombies", async () => {

    }) //end it()
}) //end contract()