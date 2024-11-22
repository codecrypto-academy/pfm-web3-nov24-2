// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";

contract ProductBatch is ERC1155 {
    uint256 public currentBatchId = 1; // Counter for batch IDs
    uint256 public constant MAX_PRODUCTS_PER_BATCH = 5;

    // Enum for distribution zones
    enum DistributionZones {
        Paiporta,
        Chiva,
        Massanassa,
        Catarroja
    }

    // Struct for donation details
    struct Donation {
        address donor;
        string description;
        uint256 timestamp;
        bool validated;
    }

    // Struct for lot details
    struct Batch {
        uint256 id;
        DistributionZones destinationZone;
        string[] locations; // History of locations
        bool closed;
        address currentHandler;
        address token;
        Donation[] donations; // List of products in the batch
    }

    // Mapping from batch ID to batch details
    mapping(uint256 => Batch) private batches;

    // Events
    event BatchCreated(uint256 batchId, bool closed, address currentHandler);
    event ProductAdded(uint256 batchId, uint256 productIndex, address donor);
    event DistributionZoneUpdated(uint256 batchId, DistributionZones destinationZone);
    event LocationUpdated(uint256 batchId, string location);

    constructor() ERC1155("https://token-cdn-domain/{id}.json") {}

    // Create a new batch (ERC-1155 token)
    function createBatch() external {
        _mint(msg.sender, currentBatchId, 1, ""); // Mint the batch token to the sender
        emit BatchCreated(currentBatchId, false, msg.sender);
        currentBatchId++;
    }

    // Add a product to a batch
    function addProduct(uint256 batchId, string memory productDescription) external {
        require(batches[batchId].donations.length < MAX_PRODUCTS_PER_BATCH, "Batch is full");

        batches[batchId].donations.push(Donation({
            donor: msg.sender,
            description: productDescription,
            timestamp: block.timestamp,
            validated: true}));
        emit ProductAdded(batchId, batches[batchId].donations.length - 1, msg.sender);
    }

    // View product details (restricted to product donor)
    function viewProduct(uint256 batchId, uint256 productIndex) external view returns (string memory) {
        require(productIndex < batches[batchId].donations.length, "Invalid product index");
        require(batches[batchId].donations[productIndex].donor == msg.sender, "Access denied");

        return batches[batchId].donations[productIndex].description;
    }


    // Update the zone of a batch
    function addDistributionZone(uint256 batchId, DistributionZones _destinationZone) external {
        require(balanceOf(msg.sender, batchId) > 0, "You don't own this batch");
        batches[batchId].destinationZone = _destinationZone;
        emit DistributionZoneUpdated(batchId, _destinationZone);
    }

    // View batch zone history
    function getDistributionZone(uint256 batchId) external view returns (DistributionZones destinationZone) {
        return batches[batchId].destinationZone;
    }

    // Update the location of a batch
    function updateLocation(uint256 batchId, string memory location) external {
        require(balanceOf(msg.sender, batchId) > 0, "You don't own this batch");
        batches[batchId].locations.push(location);
        emit LocationUpdated(batchId, location);
    }

    // View batch location history
    function getLocationHistory(uint256 batchId) external view returns (string[] memory) {
        return batches[batchId].locations;
    }
}
