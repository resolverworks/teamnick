// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "forge-std/Script.sol";
import {console2} from "forge-std/Test.sol";
import {TeamNick} from "../src/L2Registry.sol";

contract DeployTeamNick is Script {
    function setUp() public {}

    function run() public {
	address initialOwner = vm.envAddress("OWNER");
	string memory baseURI = vm.envString("BASEURI");

	TeamNick teamnick = new TeamNick(initialOwner, baseURI);
	console2.log("Deployed at: ", address(teamnick));
    }
}
