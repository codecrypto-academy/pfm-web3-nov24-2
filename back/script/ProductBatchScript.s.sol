// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Script} from "../lib/forge-std/src/Script.sol";
import {ProductBatch} from "../src/ProductBatch.sol";
import {IDataTypes} from "../src/IDataTypes.sol";
contract ProductBatchScript is Script {
    function run() external returns (ProductBatch) {
        // Recupera la private key del ambiente
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        // Inicia la transmisión con la private key
        vm.startBroadcast(deployerPrivateKey);

        // Deploy del contrato
        ProductBatch productBatch = new ProductBatch();

        // Configura los roles iniciales
        productBatch.addMember(msg.sender, IDataTypes.Role.ADMIN);
        
        vm.stopBroadcast();
        return productBatch;
    }
}
