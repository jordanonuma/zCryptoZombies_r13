pragma solidity >=0.5.0 <0.6.0;

import "./zombiefactory.sol";

contract KittyInterface {
    function getKitty(uint256 _id) external view returns (
        bool isGestating,
        bool isReady,
        uint256 cooldownIndex,
        uint256 nextActionAt,
        uint256 siringWithId,
        uint256 birthTime,
        uint256 matronId,
        uint256 sireId,
        uint256 generation,
        uint256 genes
    ); //end function getKitty()
} //end contract KittyInterface{}

contract ZombieFeeding is ZombieFactory {
    KittyInterface kittyContract;

    modifier onlyOwnerOf(uint _zombieId) {
        require(msg.sender == zombieToOwner[_zombieId]);
        _;
    } //end modifier onlyOwnerOf()

    function setKittyContractAddress(address _address) external onlyOwner {
        kittyContract = KittyInterface(_address);
    } //end function setKittyContractAddress()

    function _triggerCooldown(Zombie storage _zombie) internal {
        _zombie.readyTime = uint32(now + cooldownTime);
    } //end function _triggerCooldown()

    function _isReady(Zombie storage _zombie) internal view returns(bool) {
        return (_zombie.readyTime <= now);
    } //end function _isReady()

    function feedAndMultiply(uint _zombieId, uint _targetDna) internal onlyOwnerOf(_zombieId) {
        Zombie storage myZombie = zombies[_zombieId];
        require(_isReady(myZombie));
        _targetDna = _targetDna % dnaModulus;
        uint newDna = (myZombie.dna + _targetDna) / 2;
        if(keccak256(abi.encodePacked(_species)) == keccak256(abi.encodePacked("kitty"))) {
            newDna = newDna - newDna % 100 + 99;
        } //end if()
        _createZombie("NoName", newDna);
        _triggerCooldown(myZombie);
    } //end function feedAndMultiply()

    function feedOnKitty(uint _zombieId, uint _kittyId, string memory _species) public {
        uint kittyDna;
        (,,,,,,,,,kittyDna) = kittyContract.getKitty(_kittyId);
        feedAndMultiply(_zombieId, kittyDna, "kitty");
    } //end function feedOnKitty()
} //end contract ZombieFeeding{}