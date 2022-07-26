
const {keccak256 } = require('ethereumjs-util');
const ethers = require('ethers');
const fs = require('fs'); 

let csv = fs.readFileSync("csv/address.csv")
let array = csv.toString().split("\r");
let result = [];
for (let i = 1; i < array.length; i++) {
    let obj = {}
    let str = array[i].split(",")
    obj['address'] = str[0].replace(/(\r\n|\n|\r)/gm, "");
    obj['qty'] = str[1]
    result.push(obj)
}
// console.log(result)
const main = async () => {


    let coupons = {};
    let provider = ethers.getDefaultProvider('ropsten' ,{
        infura: 'your infura key',
    });
    
    //testing contract 
	let abi = [
        "function verifyHash(bytes32, uint8, bytes32, bytes32) public pure returns (address)"
    ];
    let contractAddress = '0x80F85dA065115F576F1fbe5E14285dA51ea39260';
    let contract = new ethers.Contract(contractAddress, abi, provider);

	const owner = '0x9C5Ed15b34FBDf6ffF180e900429D6A6431b91fc'; 
	const privateKey = 'aca1b8af8f53745643f64b200784b4919ed6347c944be42d0dd57a53496ab4e4';
  
	const signer = new ethers.Wallet(privateKey);

	console.log(signer.address)

    console.log(result.length)
    for (let i = 0; i < result.length; i++) {
	
    //校正
    const userAddress = ethers.utils.getAddress(result[i]['address']);
    const amount = result[i]['qty']
 
	// let message = ethers.utils.defaultAbiCoder.encode(["uint256", "address"],[amount , userAddress]); 
    let message = ethers.utils.solidityPack(["uint256", "address"],[amount , userAddress]);
    // let message = ethers.utils.solidityPack(["address"],[userAddress]);

	// Compute hash of the address
	let messageHash = ethers.utils.keccak256(message);
	
	// Sign the hashed address
	let messageBytes = ethers.utils.arrayify(messageHash);
	let signature = await signer.signMessage(messageBytes);

    // recover testing
    let sig = ethers.utils.splitSignature(signature);
    let recovered = await contract.verifyHash(messageHash, sig.v, sig.r, sig.s);
    console.log(recovered)

    console.log(userAddress)
    console.log({'amount': amount, 'signature' : signature})
    coupons[userAddress] = {'amount': amount, 'signature' : signature}
    }
    
    // console.log(coupons)
    fs.writeFileSync("json/signatureowner.json", JSON.stringify(coupons)); 
	
}


const runMain = async () => {
    try {
        await main(); 
        process.exit(0);
    }
    catch (error) {
        console.log(error);
        process.exit(1);
    }
};

runMain();