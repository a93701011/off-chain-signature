const { privateToAddress } = require("ethereumjs-util");
const { ethers } = require("ethers");
const crypto = require("crypto");
const pvtKey = crypto.randomBytes(32);
const pvtKeyString = pvtKey.toString("hex");
const signerAddress = ethers.utils.getAddress(
privateToAddress(pvtKey).toString("hex"));
console.log({ signerAddress, pvtKeyString });
