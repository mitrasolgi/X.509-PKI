const Web3 = require('web3').default;
const web3 = new Web3('http://localhost:8545');
const fs = require('fs');
contractABI =[
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "caAddress",
				"type": "address"
			}
		],
		"name": "addIntermediateCA",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "bytes32",
				"name": "id",
				"type": "bytes32"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "issuedTo",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "bytes32",
				"name": "certHash",
				"type": "bytes32"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "issuedBy",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "bytes32",
				"name": "parentCertId",
				"type": "bytes32"
			}
		],
		"name": "CertificateIssued",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "bytes32",
				"name": "id",
				"type": "bytes32"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "revokedBy",
				"type": "address"
			}
		],
		"name": "CertificateRevoked",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "caAddress",
				"type": "address"
			}
		],
		"name": "IntermediateCAAdded",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "caAddress",
				"type": "address"
			}
		],
		"name": "IntermediateCARemoved",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "bytes32",
				"name": "certId",
				"type": "bytes32"
			},
			{
				"internalType": "address",
				"name": "issuedTo",
				"type": "address"
			},
			{
				"internalType": "bytes32",
				"name": "certHash",
				"type": "bytes32"
			},
			{
				"internalType": "bytes32",
				"name": "parentCertId",
				"type": "bytes32"
			}
		],
		"name": "issueCertificate",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "caAddress",
				"type": "address"
			}
		],
		"name": "removeIntermediateCA",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "bytes32",
				"name": "certId",
				"type": "bytes32"
			}
		],
		"name": "revokeCertificate",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "bytes32",
				"name": "",
				"type": "bytes32"
			}
		],
		"name": "certificates",
		"outputs": [
			{
				"internalType": "bytes32",
				"name": "id",
				"type": "bytes32"
			},
			{
				"internalType": "address",
				"name": "issuedTo",
				"type": "address"
			},
			{
				"internalType": "bytes32",
				"name": "certHash",
				"type": "bytes32"
			},
			{
				"internalType": "address",
				"name": "issuedBy",
				"type": "address"
			},
			{
				"internalType": "bytes32",
				"name": "parentCertId",
				"type": "bytes32"
			},
			{
				"internalType": "bool",
				"name": "exists",
				"type": "bool"
			},
			{
				"internalType": "bool",
				"name": "revoked",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "intermediateCAs",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "rootCA",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "rootCAName",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "bytes32",
				"name": "certId",
				"type": "bytes32"
			}
		],
		"name": "verifyCertificateChain",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
];
const contractAddress = '0xFB6FB479DE120e4aA3Bb48deBCcAD33Aca1c9817';  // Smart Contract Address
const contract = new web3.eth.Contract(contractABI, contractAddress);

const senderAddress = '0x2ee4E707B11D70711613d6a6c1c3a5c56F202fE2';  // Replace with your sender address
const recipientAddress = '0x4a326570513e031275d35F15B1192eFFa2382c28';  // Replace with recipient address
async function measureSmartContractExecutionTime() {
    const results = [];

    // Try to read existing results if the file exists
    let existingResults = [];
    if (fs.existsSync('smart_contract_performance.json')) {
        const fileContent = fs.readFileSync('smart_contract_performance.json', 'utf-8');
        existingResults = JSON.parse(fileContent);
    }

    // Iterate for different trust chain lengths (for example, from 1 to 10)
	for (let trustChainLength = 1; trustChainLength <= 1000; trustChainLength++) {
		const startTime = Date.now();
	
		try {
			const parentCertId = web3.utils.keccak256("ROOT_CA_CERTIFICATE"); // Initialize the root parent certificate ID
			let currentParentCertId = parentCertId;
	
			// Loop to simulate different trust chain lengths (e.g., issuing intermediate certificates)
			for (let i = 0; i < trustChainLength; i++) {
				// Generate a unique certificate ID for each intermediate certificate
				const certId = `CERT-${Date.now()}-${i}`; // Include iteration index for uniqueness
				const certIdBytes32 = web3.utils.keccak256(certId);
				const certHash = web3.utils.sha3(certId);
	
				// Issue the certificate with the current parent certificate ID
				const receipt = await contract.methods
					.issueCertificate(certIdBytes32, recipientAddress, certHash, currentParentCertId)
					.send({ from: senderAddress, gas: 6000000 });
	
				// Update the parentCertId to the current certificate's ID for the next iteration
				currentParentCertId = certIdBytes32;
			}
	
			const endTime = Date.now();
			const executionTime = endTime - startTime;
	
			// Record results for this trust chain length
			results.push({
				trustChainLength: trustChainLength,
				executionTime: executionTime
			});
			console.log(`Execution time for chain length ${trustChainLength}: ${executionTime} ms`);
		} catch (error) {
			console.error(`Error while issuing certificates for chain length ${trustChainLength}:`, error);
		}
	}
    // Combine new results with existing ones
    const allResults = existingResults.concat(results);

    // Write all results back to the file (overwrite)
    fs.writeFileSync('smart_contract_performance.json', JSON.stringify(allResults, null, 2), 'utf-8');
    console.log('Results written to smart_contract_performance.json');
}

// Call the function to measure execution time
measureSmartContractExecutionTime();