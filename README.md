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



