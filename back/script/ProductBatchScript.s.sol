// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Script} from "../lib/forge-std/src/Script.sol";
import {ProductBatch} from "../src/ProductBatch.sol";
import {IDataTypes} from "../src/IDataTypes.sol";
contract ProductBatchScript is Script {
    function run() external returns (ProductBatch) {
        // uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");    
        vm.startBroadcast();
        ProductBatch productBatch = new ProductBatch();
        // productBatch.addMember("user_admin", msg.sender, IDataTypes.Role.ADMIN);
        vm.stopBroadcast();
        return productBatch;
    }
}
