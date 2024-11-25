// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "./ProductBatchBase.sol";
import "./DonationManager.sol";
import "./TransportManager.sol";

// Este es el contrato principal que combina toda la funcionalidad
contract ProductBatch is ProductBatchBase {
    DonationManager public donationManager;
    TransportManager public transportManager;

    constructor() ProductBatchBase() {
        donationManager = new DonationManager();
        transportManager = new TransportManager();
    }
    
}
