const express = require('express');
const Web3 = require('web3').default;
const bodyParser = require('body-parser');
const forge = require('node-forge');
const { abi } = require('./CertificateAuthority.json');
const path = require('path');
const cors = require('cors');

const app = express();
const port = 3000;

// Connect to Ganache CLI
const web3 = new Web3('http://localhost:8545');

// Replace with deployed contract address
const contractAddress = '0xa3085d81FcCcB871c21Da25A736952a12127146c'; // Replace with actual address

const contract = new web3.eth.Contract(abi, contractAddress);

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));
// Temporary in-memory storage
let entityAddresses = {};
let certificates = {};

// Generate X.509 certificate
function generateX509Certificate(userAddress, blockchainName, caPublicKey) {
    const keys = forge.pki.rsa.generateKeyPair(2048);
    const cert = forge.pki.createCertificate();
    cert.publicKey = keys.publicKey;
    cert.serialNumber = String(Date.now());
    cert.validFrom = new Date();
    cert.validTo = new Date();
    cert.validTo.setFullYear(cert.validTo.getFullYear() + 1);

    // Set Subject and Issuer
    cert.setSubject([{ name: 'commonName', value: userAddress }]);
    cert.setIssuer([{ name: 'commonName', value: 'Root CA' }]);

    // Add Subject Key Identifier (Derived from public key)
    const subjectKeyIdentifier = forge.md.sha256
        .create()
        .update(forge.asn1.toDer(forge.pki.publicKeyToAsn1(keys.publicKey)).getBytes())
        .digest()
        .toHex();
    cert.setExtensions([
        {
            name: 'subjectKeyIdentifier',
            keyIdentifier: subjectKeyIdentifier,
        },
        {
            name: 'authorityKeyIdentifier',
            keyIdentifier: forge.md.sha256
                .create()
                .update(forge.asn1.toDer(forge.pki.publicKeyToAsn1(caPublicKey)).getBytes())
                .digest()
                .toHex(),
        },
        {
            name: 'blockchainName',
            value: blockchainName,
        },
        {
            name: 'basicConstraints',
            cA: false,
        },
        {
            name: 'keyUsage',
            digitalSignature: true,
            keyEncipherment: true,
        },
        {
            name: 'extendedKeyUsage',
            serverAuth: true,
            clientAuth: true,
        },
    ]);

    // Sign certificate using SHA-256
    cert.sign(keys.privateKey, forge.md.sha256.create());

    const pem = forge.pki.certificateToPem(cert);
    return { pem, keys };
}

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

// Issue Certificate
app.post('/issueCertificate', async (req, res) => {
    console.log('Request body:', req.body);

    const { issuedTo } = req.body;
    const { pem } = generateX509Certificate(issuedTo);


    // Ensure that 'issuedTo' is a valid Ethereum address
    if (!web3.utils.isAddress(issuedTo)) {
        return res.status(400).send({ success: false, error: "Invalid Ethereum address for issuedTo." });
    }

    // Generate the certificate ID and certificate hash
    const certId = 'CERT-' + Date.now();
    const certHash = web3.utils.sha3(pem);

    const certIdBytes32 = web3.utils.keccak256(certId);
    // const certHash = web3.utils.sha3(certId);

    // Assuming the parentCertId is provided as the Root CA's certificate ID for testing purposes
    const parentCertId = web3.utils.keccak256("ROOT_CA_CERTIFICATE"); // Replace with a valid parent certificate ID

    // Log the values for debugging
    console.log('Cert ID:', certId);
    console.log('Cert Hash:', certHash);
    console.log('Parent Cert ID:', parentCertId);

    try {
        const accounts = await web3.eth.getAccounts();
        const rootCA = await contract.methods.rootCA().call();

        if (accounts[0] !== rootCA) {
            return res.status(403).send({ success: false, error: "Only the Root CA can issue certificates." });
        }

        const receipt = await contract.methods
            .issueCertificate(certIdBytes32, issuedTo, certHash, parentCertId) // Pass parentCertId here
            .send({ from: accounts[0], gas: 6000000 });

            const normalizedReceipt = JSON.parse(
                JSON.stringify(receipt, (key, value) =>
                    typeof value === 'bigint' ? value.toString() : value
                )
            );
    
            res.send({ success: true, certId, receipt: normalizedReceipt });
        } catch (error) {
            console.error('Error issuing certificate:', error.message);
            res.status(400).send({ success: false, error: error.message });
        }
    });

// Verify Certificate
app.post('/verifyCertificate', async (req, res) => {
    const { certId } = req.body;

    try {
        // Convert the certId to bytes32
        const certIdBytes32 = web3.utils.keccak256(certId);

        // Fetch certificate details from the contract
        const certificate = await contract.methods.certificates(certIdBytes32).call();

        if (!certificate.exists) {
            return res.status(404).send({ success: false, message: 'Certificate not found.' });
        }

        const isRevoked = certificate.revoked;
        const issuedTo = certificate.issuedTo;

        if (isRevoked) {
            return res.send({ success: false, message: 'Certificate has been revoked.' });
        }

        res.send({
            success: true,
            message: 'Certificate is valid.',
            certId,
            issuedTo,
        });
    } catch (error) {
        console.error('Error verifying certificate:', error.message);
        res.status(400).send({ success: false, error: error.message });
    }
});



// Revoke Certificate
app.post('/revokeCertificate', async (req, res) => {
    const { certId } = req.body;

    try {
        const certIdBytes32 = web3.utils.keccak256(certId);

        const accounts = await web3.eth.getAccounts();
        const rootCA = await contract.methods.rootCA().call();

        if (accounts[0] !== rootCA) {
            throw new Error('Only the Root CA can revoke certificates.');
        }

        const receipt = await contract.methods
            .revokeCertificate(certIdBytes32)
            .send({ from: accounts[0], gas: 6000000 });

        const normalizedReceipt = JSON.parse(
            JSON.stringify(receipt, (key, value) =>
                typeof value === 'bigint' ? value.toString() : value
            )
        );

        res.send({ success: true, certId, receipt: normalizedReceipt });
    } catch (error) {
        console.error('Error revoking certificate:', error.message);
        res.status(400).send({ success: false, error: error.message });
    }
});

// Serve static index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
