# Blockchain Certificate Authority (CA) System

## Overview

This project implements a **Blockchain-based Certificate Authority (CA)** system for managing a hierarchical certificate issuance process. The root CA (GSMA CI) signs certificates for intermediate entities, which can then issue certificates to other entities, following the hierarchical trust model shown in the diagram.

### Key Features
- **Root CA**: The **GSMA CI** is the Root Certificate Authority.
- **Intermediate CAs**: 
  - **SM-DP+**
  - **SM-DS**
  - **EUM**
- **Certificate Issuance Flow**:
  - GSMA CI → SM-DP+, SM-DS, EUM.
  - EUM → eUICC → LPA.
- **Authentication**: All entities authenticate one another based on the established trust hierarchy.

## Prerequisites

### Required Tools
- **Node.js**: Backend server runtime.
- **Ganache CLI**: Local Ethereum blockchain simulator.
- **Remix IDE**: For smart contract deployment.
- **Web3.js**: Blockchain interaction library for Node.js.

### Installation
1. **Install Dependencies:**:
   ```bash
    npm install
2. **Install Ganache CLI:**:
   ```bash
    npm install -g ganache-cli
3. **Start Ganache CLI: Run the following command to start Ganache on port 8545:**:
   ```bash
    ganache-cli --port 8545
4. **Deploy Smart Contract:**:
  - Open Remix IDE (https://remix.ethereum.org)
  - Connect to Ganache using the HTTP Provider. The provider URL is http://localhost:8545.
  - Deploy the CertificateAuthority.sol contract to the Ganache blockchain.
5. **Start the Backend Server: Run the following command to start the backend server:**:
   ```bash
    node server.js
## Usage

### Setup

1. **Configure Ethereum addresses for entities**:
   Set Ethereum addresses for the following entities. These addresses will be used for interactions and signing certificates:

   - **GSMA CI** (Root CA)
   - **SM-DP+**
   - **SM-DS**
   - **EUM**
   - **eUICC**
   - **LPA**
2. **GSMA CI Issues Certificates**: A function is included to simulate the certificate issuance from the Root CA (GSMA CI) to intermediate CAs.
3. **Intermediate CAs Issue Certificates**: Intermediate CAs (e.g., EUM) can issue certificates to their child entities, represented in a code snippet.
## API Endpoints

### 1. Configure Entity Addresses
- **Endpoint**: `POST /setUpEntityAddresses`
- **Purpose**: Set Ethereum addresses for entities in the system.
  
  This endpoint configures the Ethereum addresses of the various entities, such as GSMA CI (Root CA), SM-DP+, SM-DS, EUM, eUICC, and LPA.

### 2.  Issue Certificate
- **Endpoint**: `POST /issueCertificate`
- **Purpose**: Issue a certificate to a specified entity.
  
### 3. Verify Certificate
- **Endpoint**: `POST /verifyCertificate`
- **Purpose**: Verify the validity of a certificate.
  
### 4. Revoke Certificate
- **Endpoint**: `POST /revokeCertificate`
- **Purpose**: Revoke a certificate issued to an entity.




