// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

interface IDataTypes {
    // Events
    event BatchCreated(uint256 batchId, address currentHandler);
    event ProductAdded(uint256 batchId, uint256 productIndex, address donor);
    event DistributionZoneUpdated(uint256 batchId, DistributionZones destinationZone);
    event LocationUpdated(uint256 batchId, string latitude, string longitude);
    event BatchClosed(uint256 batchId);
    event BatchClaimed(uint256 batchId, BatchStatus status);
    event BatchTransferred(uint256 indexed batchId, address indexed newHandler, string latitude, string longitude);
    event DonationCreated(uint256 donationId, address donor);

    enum DistributionZones { Paiporta, Chiva, Massanassa, Catarroja }
    enum BatchStatus { OPEN, CLOSED, IN_TRANSIT, DELIVERY }
    enum Role { ADMIN, TRANSPORTER, DONOR }
    enum DonationType { Food, CleaningSupplies, Tools }
    
    struct Donation {
        address donor;
        string description;
        uint256 timestamp;
        DonationType donationType;
        string imageUrl;
    }

    struct Location {
        string latitude;
        string longitude;
    }
    
    struct Batch {
        uint256 id;
        DistributionZones destinationZone;
        BatchStatus status;
        address currentHandler;
        Donation[] donations;
        Location[] locations;
    }
    
    struct Members {
        string name;
        address account;
        Role role;
        bool isActive;
    }
} 