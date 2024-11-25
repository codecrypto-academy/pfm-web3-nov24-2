// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "forge-std/Test.sol";
import "../src/ProductBatch.sol";

contract ProductBatchTest is Test {
    ProductBatch public productBatch;
    address public admin = address(1);
    address public donor = address(2);
    address public transporter = address(3);

    event BatchCreated(uint256 batchId, address currentHandler);
    event ProductAdded(uint256 batchId, uint256 productIndex, address donor);
    event BatchAssignedToTransporter(uint256 batchId, address transporter);

    function setUp() public {
        vm.startPrank(admin);
        productBatch = new ProductBatch();
        
        // Añadir roles
        productBatch.addMember(admin, IDataTypes.Role.ADMIN);
        productBatch.addMember(donor, IDataTypes.Role.DONOR);
        productBatch.addMember(transporter, IDataTypes.Role.TRANSPORTER);
        vm.stopPrank();
    }

    function testCreateBatch() public {
        vm.startPrank(admin);
        
        vm.expectEmit(true, true, false, true);
        emit BatchCreated(1, admin);
        
        productBatch.createBatch("Initial Location");
        
        // Verificar que el batch fue creado correctamente
        (uint256 id, , , IDataTypes.BatchStatus status, address handler, ) = productBatch.batches(1);
        assertEq(id, 1);
        assertEq(uint(status), uint(IDataTypes.BatchStatus.OPEN));
        assertEq(handler, admin);
        vm.stopPrank();
    }

    function testAddDonation() public {
        // Primero crear un batch
        vm.prank(admin);
        productBatch.createBatch("Initial Location");

        // Añadir una donación
        vm.startPrank(donor);
        vm.expectEmit(true, true, true, true);
        emit ProductAdded(1, 0, donor);
        
        productBatch.donationManager().addDonation(1, "Test Product");
        
        // Verificar la donación
        (address donorAddr, string memory desc, , bool validated) = productBatch.donationManager().getDonation(1, 0);
        assertEq(donorAddr, donor);
        assertEq(desc, "Test Product");
        assertTrue(validated);
        vm.stopPrank();
    }

    function testClaimBatch() public {
        // Crear y cerrar un batch
        vm.startPrank(admin);
        productBatch.createBatch("Initial Location");
        productBatch.closeBatch(1);
        vm.stopPrank();

        // Reclamar el batch como transportista
        vm.startPrank(transporter);
        vm.expectEmit(true, true, false, true);
        emit BatchAssignedToTransporter(1, transporter);
        
        productBatch.transportManager().claimBatch(1);
        
        // Verificar el estado del batch
        (, , , IDataTypes.BatchStatus status, address handler, ) = productBatch.batches(1);
        assertEq(uint(status), uint(IDataTypes.BatchStatus.IN_TRANSIT));
        assertEq(handler, transporter);
        vm.stopPrank();
    }

    function testFailUnauthorizedBatchCreation() public {
        vm.prank(donor);
        vm.expectRevert("Unauthorized");
        productBatch.createBatch("Initial Location");
    }

    function testFailUnauthorizedDonation() public {
        vm.prank(admin);
        productBatch.createBatch("Initial Location");

        vm.prank(transporter);
        vm.expectRevert("Unauthorized");
        productBatch.donationManager().addDonation(1, "Test Product");
    }

    function testFailClaimBatchBeforeClosed() public {
        vm.prank(admin);
        productBatch.createBatch("Initial Location");

        vm.prank(transporter);
        vm.expectRevert("Batch not ready");
        productBatch.transportManager().claimBatch(1);
    }
} 