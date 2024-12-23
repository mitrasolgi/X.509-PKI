const express = require('express');
const bodyParser = require('body-parser');
const forge = require('node-forge');
const fs = require('fs');
const Web3 = require('web3').default;
const web3 = new Web3('http://localhost:8545');
const app = express();
const path = require('path');

const cors = require('cors');
const port = 3000;
contractABI= [
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
	]
;

const contractAddress = '0xFB6FB479DE120e4aA3Bb48deBCcAD33Aca1c9817'; // Smart Contract Address
const contract = new web3.eth.Contract(contractABI, contractAddress);
// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));
// Temporary in-memory storage
let entityAddresses = {};
let certificates = {};

// Endpoint: Set up entity addresses
app.post('/setUpEntityAddresses', (req, res) => {
    const { gsmaCI, smDP, smDS, eum, eUICC, lpa } = req.body;

    if (gsmaCI && smDP && smDS && eum && eUICC && lpa) {
        entityAddresses = { gsmaCI, smDP, smDS, eum, eUICC, lpa };
        res.json({ success: true, message: "Entity addresses saved.", entityAddresses });
    } else {
        res.json({ success: false, error: "All fields are required." });
    }
});

app.post('/issueCertificate', async (req, res) => {
    console.log('Request body:', req.body);

    const { issuedTo } = req.body;

    // Ensure that 'issuedTo' is a valid Ethereum address
    if (!web3.utils.isAddress(issuedTo)) {
        return res.status(400).send({ success: false, error: "Invalid Ethereum address for issuedTo." });
    }

    // Generate the certificate ID and certificate hash
    const certId = 'CERT-' + Date.now();
    const certIdBytes32 = web3.utils.keccak256(certId);
    const certHash = web3.utils.sha3(certId);

    const parentCertId = web3.utils.keccak256("ROOT_CA_CERTIFICATE"); // Replace with a valid parent certificate ID

    // Log the values for debugging
    console.log('Cert ID:', certId);
    console.log('Cert Hash:', certHash);
    console.log('Parent Cert ID:', parentCertId);

    try {
        const accounts = await web3.eth.getAccounts();
        const rootCA = await contract.methods.rootCA().call();
        const recipientAddress = '0xabA54d2Cc3338eB194d284961C634230e222a913';  // Replace with recipient address

        if (accounts[0] !== rootCA) {
            return res.status(403).send({ success: false, error: "Only the Root CA can issue certificates." });
        }

        // Start timer
        const startTime = Date.now();

        const receipt = await contract.methods
            .issueCertificate(certIdBytes32, recipientAddress, certHash, parentCertId)
            .send({ from: accounts[0], gas: 6000000 });

        // Stop timer and calculate elapsed time
        const endTime = Date.now();
        const elapsedTime = endTime - startTime;

        // Normalize the receipt to handle BigInt
        const normalizedReceipt = JSON.parse(
            JSON.stringify(receipt, (key, value) =>
                typeof value === 'bigint' ? value.toString() : value
            )
        );

        // Log performance data
        const performanceData = {
            timestamp: new Date().toISOString(),
            certId,
            issuedTo,
            elapsedTime,
            receipt: normalizedReceipt, // Use normalized receipt
        };

        // Read existing performance log data
        const logFilePath = path.join(__dirname, 'performance_log.json');
        let existingData = [];
        if (fs.existsSync(logFilePath)) {
            const fileContent = fs.readFileSync(logFilePath, 'utf-8');
            existingData = JSON.parse(fileContent);
        }

        // Append new data
        existingData.push(performanceData);

        // Write back to the file
        fs.writeFileSync(logFilePath, JSON.stringify(existingData, null, 2), 'utf-8');

        console.log('Certificate issued:', performanceData);

        res.send({ success: true, certId, elapsedTime, receipt: normalizedReceipt });
    } catch (error) {
        console.error('Error issuing certificate:', error.message);
        res.status(400).send({ success: false, error: error.message });
    }
});
// Serve static index.html
// app.get('/', (req, res) => {
//     res.sendFile(path.join(__dirname, 'index.html'));
// });
app.listen(3000, () => {
    console.log('Server listening on port 3000');
});