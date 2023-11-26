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
        address initialOwner = address(123);
	string memory baseUri = "http//www.google.com/";
        teamnick = new TeamNick(initialOwner, baseUri);
    }

    function test_RegisterAndTransfer() public {
	vm.startPrank(address(123));
	vm.deal(address(123), 100 ether);

        console2.log("Deployed to: ", address(teamnick));
	teamnick.register("lcfr", address(123), address(123), "http://msn.com");
	// node for lcfr is 71556845390930511116542978182046292420618941324241853217323411142934832950810


	teamnick.setAddr(71556845390930511116542978182046292420618941324241853217323411142934832950810, address(666));

	teamnick.setApprovalForAll(0x00000000000000ADc04C56Bf30aC9d3c0aAF14dC, true);

	vm.stopPrank();
	vm.startPrank(0x00000000000000ADc04C56Bf30aC9d3c0aAF14dC);
	teamnick.safeTransferFrom(address(123), address(321), 71556845390930511116542978182046292420618941324241853217323411142934832950810);
    }
}
