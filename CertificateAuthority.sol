// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract CertificateAuthority {
    string public rootCAName = "GSMA CI"; // Explicit name for Root CA
    address public rootCA; // Address of Root CA (GSMA CI)

    // Mapping for intermediate CAs (e.g., SM-DP+, SM-DS, EUM)
    mapping(address => bool) public intermediateCAs;

    // Structure for certificates
    struct Certificate {
        bytes32 id; // Certificate ID as bytes32
        address issuedTo; // Address the certificate is issued to (e.g., LPA, eUICC)
        bytes32 certHash; // Hash of the certificate
        address issuedBy; // Address of the issuer (Root CA or Intermediate CA)
        bytes32 parentCertId; // ID of the parent certificate (for chain of trust)
        bool exists; // Whether the certificate exists
        bool revoked; // Whether the certificate is revoked
    }

    // Mapping to store certificates by their ID
    mapping(bytes32 => Certificate) public certificates;

    // Events for logging
    event CertificateIssued(
        bytes32 indexed id,
        address indexed issuedTo,
        bytes32 certHash,
        address indexed issuedBy,
        bytes32 parentCertId
    );
    event CertificateRevoked(bytes32 indexed id, address indexed revokedBy);
    event IntermediateCAAdded(address indexed caAddress);
    event IntermediateCARemoved(address indexed caAddress);

    // Modifiers to restrict access
    modifier onlyRootCA() {
        require(msg.sender == rootCA, "Only GSMA CI can perform this action");
        _;
    }

    modifier onlyIntermediateCA() {
        require(intermediateCAs[msg.sender], "Only an intermediate CA can perform this action");
        _;
    }

    modifier onlyRootCAOrIntermediate() {
        require(
            msg.sender == rootCA || intermediateCAs[msg.sender],
            "Only Root CA or an intermediate CA can perform this action"
        );
        _;
    }

    constructor() {
        rootCA = msg.sender; // Set the contract creator as the Root CA
    }

    // Validate the issuer and parent certificate
    function isValidIssuer(address issuer, bytes32 parentCertId) internal view returns (bool) {
        if (issuer == rootCA) {
            return true; // Root CA can issue any certificate
        }
        return
            certificates[parentCertId].issuedTo == issuer && // Issuer must match parent cert
            intermediateCAs[issuer]; // Issuer must be an intermediate CA
    }

    // Promote an entity to intermediate CA
    function promoteToIntermediateCA(address entity) internal {
        if (!intermediateCAs[entity]) {
            intermediateCAs[entity] = true;
            emit IntermediateCAAdded(entity);
        }
    }

    // Issue a certificate (GSMA CI to intermediate CA, or intermediate CA to sub-entity)
    function issueCertificate(
        bytes32 certId,
        address issuedTo,
        bytes32 certHash,
        bytes32 parentCertId
    ) public onlyRootCAOrIntermediate {
        // Validate inputs
        require(issuedTo != address(0), "Invalid address");
        require(certId != bytes32(0), "Invalid certId");
        require(certHash != bytes32(0), "Invalid certHash");

        // Ensure certificate doesn't already exist
        require(!certificates[certId].exists, "Certificate already exists");

        // Validate the issuer and chain of trust
        require(isValidIssuer(msg.sender, parentCertId), "Invalid issuer or parent certificate");

        // Issue the certificate
        certificates[certId] = Certificate({
            id: certId,
            issuedTo: issuedTo,
            certHash: certHash,
            issuedBy: msg.sender,
            parentCertId: parentCertId,
            exists: true,
            revoked: false
        });

        // Promote the issued entity to intermediate CA if applicable
        if (issuedTo != rootCA) {
            promoteToIntermediateCA(issuedTo);
        }

        emit CertificateIssued(certId, issuedTo, certHash, msg.sender, parentCertId);
    }

    // Revoke a certificate
    function revokeCertificate(bytes32 certId) public {
        require(certificates[certId].exists, "Certificate does not exist");
        require(
            msg.sender == certificates[certId].issuedBy,
            "Only the issuer can revoke this certificate"
        );

        certificates[certId].revoked = true;

        emit CertificateRevoked(certId, msg.sender);
    }

    // Add an intermediate CA (only Root CA can do this)
    function addIntermediateCA(address caAddress) public onlyRootCA {
        require(caAddress != address(0), "Invalid address");
        intermediateCAs[caAddress] = true;
        emit IntermediateCAAdded(caAddress);
    }

    // Remove an intermediate CA (only Root CA can do this)
    function removeIntermediateCA(address caAddress) public onlyRootCA {
        require(caAddress != address(0), "Invalid address");
        intermediateCAs[caAddress] = false;
        emit IntermediateCARemoved(caAddress);
    }

    // Verify certificate chain of trust
    function verifyCertificateChain(bytes32 certId) public view returns (bool) {
        Certificate memory cert = certificates[certId];
        require(cert.exists, "Certificate does not exist");
        require(!cert.revoked, "Certificate is revoked");

        address currentIssuer = cert.issuedBy;

        // Traverse the chain back to the root
        while (currentIssuer != rootCA) {
            Certificate memory parentCert = certificates[cert.parentCertId];
            require(parentCert.exists, "Parent certificate does not exist");
            require(!parentCert.revoked, "Parent certificate is revoked");
            currentIssuer = parentCert.issuedBy;
        }

        return true; // Chain is valid
    }
}
