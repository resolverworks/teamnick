// SPDX-License-Identifier: UNLICENSED

// porting to forge:
//
// forge init
// forge install openzeppelin/openzeppelin-contracts
// cp rv teamNick/contracts/src/ ./src/
//

pragma solidity ^0.8.13;

import {Test, console2} from "forge-std/Test.sol";

import {TeamNick} from "../src/L2Registry.sol";

contract TeamNickTest is Test {
    TeamNick public teamnick;

    function setUp() public {
	// initial owner
        address initialOwner = address(123);
	// baseuri
	string memory baseUri = "http//www.google.com/";
        teamnick = new TeamNick(initialOwner, baseUri);
    }

    function test_RegisterAndTransfer() public {
	// impersonate 123 address
	vm.startPrank(address(123));
	// give it 100 ether
	vm.deal(address(123), 100 ether);

	// test registering a name
	teamnick.register("lcfr", address(123), address(123), "http://msn.com");

	// node for lcfr is 71556845390930511116542978182046292420618941324241853217323411142934832950810

	// setapprovalforall for seaport 1.5
	teamnick.setApprovalForAll(0x00000000000000ADc04C56Bf30aC9d3c0aAF14dC, true);
	// stop impersonating 123 address
	vm.stopPrank();
	// start impersonating seaport 1.5
	vm.startPrank(0x00000000000000ADc04C56Bf30aC9d3c0aAF14dC);
	// try to transfer as approved seaport contract
	teamnick.safeTransferFrom(address(123), address(321), 71556845390930511116542978182046292420618941324241853217323411142934832950810);
    }
}
