// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

interface IDataTypes {
    // Events
    event BatchCreated(uint256 batchId, address currentHandler);
    event ProductAdded(uint256 batchId, uint256 productIndex, address donor);
    event DistributionZoneUpdated(uint256 batchId, DistributionZones destinationZone);
    event LocationUpdated(uint256 batchId, string location);
    event BatchClosed(uint256 batchId);
    event BatchAssignedToTransporter(uint256 batchId, address transporter);
    event BatchTransferred(uint256 indexed batchId, address indexed newHandler, string newLocation);

    enum DistributionZones { Paiporta, Chiva, Massanassa, Catarroja }
    enum BatchStatus { OPEN, CLOSED, IN_TRANSIT }
    enum Role { ADMIN, TRANSPORTER, DONOR }
    
    struct Donation {
        address donor;
        string description;
        uint256 timestamp;
        bool validated;
    }
    
    struct Batch {
        uint256 id;
        DistributionZones destinationZone;
        string[] locations;
        BatchStatus status;
        address currentHandler;
        Donation[] donations;
    }
    
    struct Members {
        address account;
        Role role;
        bool isActive;
    }
} 