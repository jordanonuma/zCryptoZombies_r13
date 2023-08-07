pragma solidity 0.5.0;
import "./../Ownable.sol";
import "./CallerContractInterface.sol";
contract EthPriceOracle is Ownable {
    uint private randNonce = 0;
    uint private modulus = 1000;
    mapping(uint256=>bool) pendingRequests;
    event GetLatestEthPriceEvent(address callerAddress, uint id);
    event SetLatestEthPriceEvent(uint256 ethPrice, address callerAddress);
    
} //end contract EthPriceOracle{}
