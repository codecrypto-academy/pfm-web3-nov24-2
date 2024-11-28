// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "forge-std/Test.sol";
import "../src/ProductBatch.sol";

contract ProductBatchTest is Test {
    ProductBatch public productBatch;
    address admin = address(1);
    address donor = address(2);
    address transporter = address(3);
    string latitude = "40.416775";
    string longitude = "-3.703790";

    function setUp() public {
        vm.startPrank(address(this));
        productBatch = new ProductBatch();

        // Add members
        productBatch.addMember(admin, IDataTypes.Role.ADMIN);
        productBatch.addMember(donor, IDataTypes.Role.DONOR);
        productBatch.addMember(transporter, IDataTypes.Role.TRANSPORTER);
        vm.stopPrank();
    }

    function testBatchCreation() public {
        vm.startPrank(admin);
        productBatch.createBatch(latitude, longitude);

        // Verify batch creation
        IDataTypes.Batch memory batch = productBatch.getBatch(1);
        assertEq(batch.id, 1);
        assertEq(batch.locations[0].latitude, latitude);
        assertEq(batch.locations[0].longitude, longitude);
        assertEq(uint(batch.status), uint(IDataTypes.BatchStatus.OPEN));
        assertEq(batch.currentHandler, admin);
        vm.stopPrank();
    }

    function testAddMultipleDonations() public {
        vm.startPrank(donor);
        productBatch.addDonation(1, "Donation test 1");
        productBatch.addDonation(1, "Donation test 2");
        vm.stopPrank();

        // Verify that donations were added
        IDataTypes.Batch memory batch = productBatch.getBatch(1);
        assertEq(batch.donations[0].description, "Donation test 1");
        assertEq(batch.donations[1].description, "Donation test 2");
        assertEq(batch.donations[0].donor, donor);
        assertEq(batch.donations[1].donor, donor);
    }

    function testBatchClosing() public {
        vm.startPrank(admin);
        productBatch.closeBatch(1);
        vm.stopPrank();
    }

    function testBatchClaimForTransporter() public {
        // First create and close a batch
        vm.startPrank(admin);
        productBatch.createBatch(latitude, longitude);
        productBatch.closeBatch(1);
        vm.stopPrank();

        // Then the transporter claims it
        vm.startPrank(transporter);
        productBatch.claimBatchForTransporter(1);
        vm.stopPrank();

        // Verify that the batch was claimed
        IDataTypes.Batch memory batch = productBatch.getBatch(1);
        assertEq(batch.currentHandler, transporter);
        assertEq(uint(batch.status), uint(IDataTypes.BatchStatus.IN_TRANSIT));
    }

    function testBatchClaimForDelivery() public {
        // First create and close the batch
        vm.startPrank(admin);
        productBatch.createBatch(latitude, longitude);
        productBatch.closeBatch(1);
        vm.stopPrank();

        // Transporter claims the batch
        vm.startPrank(transporter);
        productBatch.claimBatchForTransporter(1);
        vm.stopPrank();

        // Now the admin can claim it for delivery
        vm.startPrank(admin);
        productBatch.claimBatchForDelivery(1);
        vm.stopPrank();

        // Verifications
        IDataTypes.Batch memory batch = productBatch.getBatch(1);
        assertEq(batch.currentHandler, admin);
        assertEq(uint(batch.status), uint(IDataTypes.BatchStatus.DELIVERY));
    }

    function testLocationUpdate() public {
        // Create and close the batch
        vm.startPrank(admin);
        productBatch.createBatch(latitude, longitude);
        productBatch.closeBatch(1);
        vm.stopPrank();

        // Transporter claims the batch
        vm.startPrank(transporter);
        productBatch.claimBatchForTransporter(1);
        
        // Update location
        string memory newLatitude = "36.721357";
        string memory newLongitude = "-0.800341";
        productBatch.updateLocation(1, newLatitude, newLongitude);
        vm.stopPrank();

        // Verify that location was updated
        IDataTypes.Batch memory batch = productBatch.getBatch(1);
        assertEq(batch.locations[1].latitude, newLatitude);
        assertEq(batch.locations[1].longitude, newLongitude);
    }

    function testDonationAddition() public {
        vm.startPrank(donor);
        productBatch.addDonation(1, "Donation test");
        vm.stopPrank();

        // Verify that donation was added
        IDataTypes.Batch memory batch = productBatch.getBatch(1);
        assertEq(batch.donations[0].description, "Donation test");
        assertEq(batch.donations[0].donor, donor);
    }

    function testOpenBatchCloseBatchClaimUpdateLocationTransferBatch() public {
        // Create and close the batch
        vm.startPrank(admin);
        productBatch.createBatch(latitude, longitude);
        productBatch.closeBatch(1);
        vm.stopPrank();

        // Transporter claims the batch and updates location
        vm.startPrank(transporter);
        productBatch.claimBatchForTransporter(1);
        string memory newLatitude = "36.721357";
        string memory newLongitude = "-0.800341";
        productBatch.updateLocation(1, newLatitude, newLongitude);

        string memory destinationLatitude = "40.416775";
        string memory destinationLongitude = "-3.703790";
        productBatch.transferBatch(1, address(4), destinationLatitude, destinationLongitude);
        vm.stopPrank();

        // Verify that batch was transferred
        IDataTypes.Batch memory batch = productBatch.getBatch(1);
        assertEq(batch.currentHandler, address(4));
        // Validate all locations
        assertEq(batch.locations[0].latitude, latitude);
        assertEq(batch.locations[0].longitude, longitude);
        assertEq(batch.locations[1].latitude, newLatitude);
        assertEq(batch.locations[1].longitude, newLongitude);
        assertEq(batch.locations[2].latitude, destinationLatitude);
        assertEq(batch.locations[2].longitude, destinationLongitude);
    }

    function testAllDonations() public {
        vm.startPrank(admin);
        productBatch.createBatch(latitude, longitude);
        vm.stopPrank();

        // Add donations
        vm.startPrank(donor);
        productBatch.addDonation(1, "Donation 1");
        productBatch.addDonation(1, "Donation 2");
        vm.stopPrank();

        vm.startPrank(admin);
        string memory newLatitude = "36.721357";
        string memory newLongitude = "-0.800341";   
        productBatch.createBatch(newLatitude, newLongitude);
        vm.stopPrank();

        // Add donations
        vm.startPrank(donor);
        productBatch.addDonation(2, "Donation 1");
        productBatch.addDonation(2, "Donation 2");
        productBatch.addDonation(2, "Donation 3");
        vm.stopPrank();

        // Get all donations as admin
        vm.startPrank(admin);
        IDataTypes.Donation[] memory donations = productBatch.getAllDonationsInAllBatches();
        vm.stopPrank();

        assertEq(donations.length, 5);
    }

    function testGetAllListOfMembers() public {
        // Verify that the members were added Admin, Donor and Transporter and owner
        vm.startPrank(admin);
        IDataTypes.Members[] memory initialMembers = productBatch.getAllListOfMembers();
        vm.stopPrank();
        assertEq(initialMembers.length, 4);

        // Add 2 more members
        vm.startPrank(admin);
        productBatch.addMember(address(5), IDataTypes.Role.DONOR);
        productBatch.addMember(address(6), IDataTypes.Role.DONOR);
        vm.stopPrank();

        vm.startPrank(admin);
        IDataTypes.Members[] memory members = productBatch.getAllListOfMembers();
        vm.stopPrank();

        assertEq(members.length, 6);
    }

    function testGetAllBatches() public {
        // Create and close the batch
        vm.startPrank(admin);
        productBatch.createBatch(latitude, longitude);
        string memory newLatitude = "36.721357";
        string memory newLongitude = "-0.800341";
        productBatch.createBatch(newLatitude, newLongitude);
        vm.stopPrank();

        vm.startPrank(admin);
        IDataTypes.Batch[] memory batches = productBatch.getAllBatches();
        vm.stopPrank();

        assertEq(batches.length, 2);
    }

    function testGetAllBatchesWithStatusClosedReadyForTransporter() public {
        // Create batch add donations and claim for transporter
        vm.startPrank(admin);
        productBatch.createBatch(latitude, longitude);
        productBatch.closeBatch(1);
        string memory newLatitude = "36.721357";
        string memory newLongitude = "-0.800341";
        productBatch.createBatch(newLatitude, newLongitude);
        productBatch.closeBatch(2);
        string memory newLatitude2 = "40.416775";
        string memory newLongitude2 = "-3.703790";
        productBatch.createBatch(newLatitude2, newLongitude2);
        productBatch.closeBatch(3);
        vm.stopPrank();

        vm.startPrank(transporter);
        productBatch.claimBatchForTransporter(3);
        vm.stopPrank();

        vm.startPrank(admin);
        IDataTypes.Batch[] memory batches = productBatch.getAllBatchesWithStatusClosedReadyForTransporter();
        vm.stopPrank();

        assertEq(batches.length, 2);
    }

    function testGetAllBatchesWithStatusInTransitReadyForDelivery() public {
        // Create batch add donations and claim for transporter
        vm.startPrank(admin);
        productBatch.createBatch(latitude, longitude);
        productBatch.closeBatch(1);
        vm.stopPrank();

        vm.startPrank(transporter);
        productBatch.claimBatchForTransporter(1);
        vm.stopPrank();

        vm.startPrank(admin);
        IDataTypes.Batch[] memory batches = productBatch.getAllBatchesWithStatusInTransitReadyForDelivery();
        vm.stopPrank();

        assertEq(batches.length, 1);
    }
}
