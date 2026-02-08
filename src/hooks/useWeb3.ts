import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useToast } from '@/hooks/use-toast';

// Updated Web3 integration for new contracts

declare global {
  interface Window {
    ethereum?: any;
  }
}

// Contract addresses and ABIs
const BLUE_CARBON_REGISTRY_ADDRESS = '0x4d95087d586d34e160abba196b98b7605c7cdad6';
const CARBON_CREDIT_TOKEN_ADDRESS = '0x877eb514a2e4b6b61262829d2002e3340bea8237';

const BLUE_CARBON_REGISTRY_ABI = [
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [],
    "name": "AccessControlBadConfirmation",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      },
      {
        "internalType": "bytes32",
        "name": "neededRole",
        "type": "bytes32"
      }
    ],
    "name": "AccessControlUnauthorizedAccount",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "addApprover",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "projectId",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "creditsToMint",
        "type": "uint256"
      }
    ],
    "name": "approveProject",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "ApproverAdded",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "ApproverRemoved",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "role",
        "type": "bytes32"
      },
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "grantRole",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "id",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "approver",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "creditsMinted",
        "type": "uint256"
      }
    ],
    "name": "ProjectApproved",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "id",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "owner",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "name",
        "type": "string"
      }
    ],
    "name": "ProjectRegistered",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "id",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "approver",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "reason",
        "type": "string"
      }
    ],
    "name": "ProjectRejected",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "name",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "description",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "metadataURI",
        "type": "string"
      },
      {
        "internalType": "int256",
        "name": "lat",
        "type": "int256"
      },
      {
        "internalType": "int256",
        "name": "lon",
        "type": "int256"
      },
      {
        "internalType": "uint256",
        "name": "creditsRequested",
        "type": "uint256"
      }
    ],
    "name": "registerProject",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "projectId",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "reason",
        "type": "string"
      }
    ],
    "name": "rejectProject",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "removeApprover",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "role",
        "type": "bytes32"
      },
      {
        "internalType": "address",
        "name": "callerConfirmation",
        "type": "address"
      }
    ],
    "name": "renounceRole",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "role",
        "type": "bytes32"
      },
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "revokeRole",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "role",
        "type": "bytes32"
      },
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "previousAdminRole",
        "type": "bytes32"
      },
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "newAdminRole",
        "type": "bytes32"
      }
    ],
    "name": "RoleAdminChanged",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "APPROVER_ROLE",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "DEFAULT_ADMIN_ROLE",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "deployer",
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
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "role",
        "type": "bytes32"
      }
    ],
    "name": "getRoleAdmin",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "role",
        "type": "bytes32"
      },
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "hasRole",
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
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "projects",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "id",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "owner",
        "type": "address"
      },
      {
        "internalType": "string",
        "name": "name",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "description",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "metadataURI",
        "type": "string"
      },
      {
        "internalType": "int256",
        "name": "latitude",
        "type": "int256"
      },
      {
        "internalType": "int256",
        "name": "longitude",
        "type": "int256"
      },
      {
        "internalType": "uint256",
        "name": "creditsRequested",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "creditsApproved",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "timestamp",
        "type": "uint256"
      },
      {
        "internalType": "enum BlueCarbonRegistry.Status",
        "name": "status",
        "type": "uint8"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes4",
        "name": "interfaceId",
        "type": "bytes4"
      }
    ],
    "name": "supportsInterface",
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
    "name": "token",
    "outputs": [
      {
        "internalType": "contract IBlueCarbonToken",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

const CARBON_CREDIT_TOKEN_ABI = [
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [],
    "name": "AccessControlBadConfirmation",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      },
      {
        "internalType": "bytes32",
        "name": "neededRole",
        "type": "bytes32"
      }
    ],
    "name": "AccessControlUnauthorizedAccount",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "spender",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "value",
        "type": "uint256"
      }
    ],
    "name": "approve",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "mint",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "value",
        "type": "uint256"
      }
    ],
    "name": "transfer",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "from",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "value",
        "type": "uint256"
      }
    ],
    "name": "transferFrom",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "owner",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "spender",
        "type": "address"
      }
    ],
    "name": "allowance",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "balanceOf",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "decimals",
    "outputs": [
      {
        "internalType": "uint8",
        "name": "",
        "type": "uint8"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "DEFAULT_ADMIN_ROLE",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "role",
        "type": "bytes32"
      }
    ],
    "name": "getRoleAdmin",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "role",
        "type": "bytes32"
      },
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "hasRole",
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
    "name": "MINTER_ROLE",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "name",
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
        "internalType": "bytes4",
        "name": "interfaceId",
        "type": "bytes4"
      }
    ],
    "name": "supportsInterface",
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
    "name": "symbol",
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
    "inputs": [],
    "name": "totalSupply",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

// Polygon Amoy testnet configuration
const POLYGON_AMOY_CHAIN_ID = '0x13882'; // 80002 in hex
const POLYGON_AMOY_CONFIG = {
  chainId: POLYGON_AMOY_CHAIN_ID,
  chainName: 'Polygon Amoy Testnet',
  nativeCurrency: {
    name: 'MATIC',
    symbol: 'MATIC',
    decimals: 18,
  },
  rpcUrls: ['https://rpc-amoy.polygon.technology/'],
  blockExplorerUrls: ['https://www.oklink.com/amoy'],
};

export const useWeb3 = () => {
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null);
  const [account, setAccount] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [carbonBalance, setCarbonBalance] = useState<string>('0');
  const { toast } = useToast();

  const switchToPolygonAmoy = async () => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: POLYGON_AMOY_CHAIN_ID }],
      });
    } catch (switchError: any) {
      // This error code indicates that the chain has not been added to MetaMask
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [POLYGON_AMOY_CONFIG],
          });
        } catch (addError) {
          throw addError;
        }
      } else {
        throw switchError;
      }
    }
  };

  const connectWallet = async () => {
    if (!window.ethereum) {
      toast({
        title: "MetaMask Not Found",
        description: "Please install MetaMask to connect your wallet",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsConnecting(true);
      
      // Switch to Polygon Amoy network
      await switchToPolygonAmoy();
      
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send('eth_requestAccounts', []);
      const signer = await provider.getSigner();
      
      setProvider(provider);
      setSigner(signer);
      setAccount(accounts[0]);
      
      // Fetch carbon credit balance
      await fetchCarbonBalance(accounts[0], provider);
      
      toast({
        title: "Wallet Connected",
        description: `Connected to ${accounts[0].substring(0, 6)}...${accounts[0].substring(-4)}`,
      });
    } catch (error) {
      console.error('Error connecting wallet:', error);
      toast({
        title: "Connection Failed",
        description: "Failed to connect wallet. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const fetchCarbonBalance = async (address: string, web3Provider?: ethers.BrowserProvider) => {
    try {
      const providerToUse = web3Provider || provider;
      if (!providerToUse) return;
      
      const tokenContract = new ethers.Contract(
        CARBON_CREDIT_TOKEN_ADDRESS,
        CARBON_CREDIT_TOKEN_ABI,
        providerToUse
      );
      
      const balance = await tokenContract.balanceOf(address);
      setCarbonBalance(ethers.formatEther(balance));
    } catch (error) {
      console.error('Error fetching carbon balance:', error);
    }
  };

  const registerProject = async (
    name: string,
    description: string,
    location: string,
    latitude: number,
    longitude: number,
    creditsRequested: number
  ) => {
    try {
      if (!signer) throw new Error('Wallet not connected');
      
      const contract = new ethers.Contract(
        BLUE_CARBON_REGISTRY_ADDRESS,
        BLUE_CARBON_REGISTRY_ABI,
        signer
      );
      
      // Convert latitude and longitude to integers (multiply by 1e6 for precision)
      const latInt = Math.round(latitude * 1000000);
      const lonInt = Math.round(longitude * 1000000);
      
      // Create metadata URI (could be IPFS hash in production)
      const metadataURI = `data:application/json;base64,${btoa(JSON.stringify({
        name,
        description,
        location,
        coordinates: { latitude, longitude }
      }))}`;
      
      const tx = await contract.registerProject(
        name,
        description,
        metadataURI,
        latInt,
        lonInt,
        ethers.parseEther(creditsRequested.toString())
      );
      
      await tx.wait();
      return tx;
    } catch (error: any) {
      console.error('Error registering project:', error);
      // Provide more detailed error information
      if (error.code === 'UNPREDICTABLE_GAS_LIMIT') {
        throw new Error('Transaction may fail - check network and try again');
      } else if (error.code === 'INSUFFICIENT_FUNDS') {
        throw new Error('Insufficient funds for transaction');
      } else if (error.code === 'USER_REJECTED') {
        throw new Error('Transaction cancelled by user');
      }
      throw error;
    }
  };

  const getProjects = async () => {
    if (!provider) return [];
    
    try {
      const contract = new ethers.Contract(
        BLUE_CARBON_REGISTRY_ADDRESS,
        BLUE_CARBON_REGISTRY_ABI,
        provider
      );
      
      // Get project count first
      let projectCount = 0;
      try {
        projectCount = Number(await contract.projectCount());
      } catch (error) {
        console.log('No projectCount method, trying individual projects...');
      }
      
      const projects = [];
      
      // If we have projectCount, use it, otherwise try up to 10 projects
      const maxProjects = projectCount > 0 ? projectCount : 10;
      
      for (let projectId = 1; projectId <= maxProjects; projectId++) {
        try {
          const project = await contract.projects(projectId);
          if (project.id === 0n) break; // No more projects
          
          projects.push({
            id: Number(project.id),
            owner: project.owner,
            name: project.name,
            description: project.description,
            metadataURI: project.metadataURI,
            latitude: Number(project.latitude) / 1000000, // Convert back from integer
            longitude: Number(project.longitude) / 1000000,
            requestedCredits: ethers.formatEther(project.requestedCredits || project.creditsRequested || 0),
            approvedCredits: ethers.formatEther(project.approvedCredits || project.creditsApproved || 0),
            isApproved: project.isApproved || false,
            isRejected: project.isRejected || false,
            timestamp: Number(project.timestamp) || Date.now() / 1000,
            status: Number(project.status) || 0, // 0: Pending, 1: Approved, 2: Rejected
            location: `${(Number(project.latitude) / 1000000).toFixed(4)}, ${(Number(project.longitude) / 1000000).toFixed(4)}`,
            uploader: project.owner,
            date: new Date((Number(project.timestamp) || Date.now() / 1000) * 1000).toLocaleDateString()
          });
        } catch (error) {
          console.log(`Error fetching project ${projectId}:`, error);
          // Continue to next project
        }
      }
      
      return projects;
    } catch (error) {
      console.error('Error fetching projects:', error);
      return [];
    }
  };

  const getUserProjects = async (userAddress: string) => {
    const allProjects = await getProjects();
    return allProjects.filter(project => project.owner.toLowerCase() === userAddress.toLowerCase());
  };

  const approveProject = async (projectId: number, creditsToMint: number) => {
    if (!signer) throw new Error('Wallet not connected');
    
    const contract = new ethers.Contract(
      BLUE_CARBON_REGISTRY_ADDRESS,
      BLUE_CARBON_REGISTRY_ABI,
      signer
    );
    
    const tx = await contract.approveProject(
      projectId,
      ethers.parseEther(creditsToMint.toString())
    );
    
    await tx.wait();
    return tx;
  };

  const rejectProject = async (projectId: number, reason: string) => {
    if (!signer) throw new Error('Wallet not connected');
    
    const contract = new ethers.Contract(
      BLUE_CARBON_REGISTRY_ADDRESS,
      BLUE_CARBON_REGISTRY_ABI,
      signer
    );
    
    const tx = await contract.rejectProject(projectId, reason);
    await tx.wait();
    return tx;
  };

  const checkAdminRole = async (address: string) => {
    if (!provider) return false;
    
    try {
      const contract = new ethers.Contract(
        BLUE_CARBON_REGISTRY_ADDRESS,
        BLUE_CARBON_REGISTRY_ABI,
        provider
      );
      
      const DEFAULT_ADMIN_ROLE = "0x0000000000000000000000000000000000000000000000000000000000000000";
      const APPROVER_ROLE = await contract.APPROVER_ROLE();
      
      const isAdmin = await contract.hasRole(DEFAULT_ADMIN_ROLE, address);
      const isApprover = await contract.hasRole(APPROVER_ROLE, address);
      
      return isAdmin || isApprover;
    } catch (error) {
      console.error('Error checking admin role:', error);
      return false;
    }
  };

  const mintCarbonCredits = async (to: string, amount: number) => {
    if (!signer) throw new Error('Wallet not connected');
    
    const contract = new ethers.Contract(
      CARBON_CREDIT_TOKEN_ADDRESS,
      CARBON_CREDIT_TOKEN_ABI,
      signer
    );
    
    const amountInWei = ethers.parseEther(amount.toString());
    const tx = await contract.mint(to, amountInWei);
    await tx.wait();
    
    // Refresh carbon balance after minting
    if (account) {
      await fetchCarbonBalance(account);
    }
    
    return tx;
  };

  const disconnectWallet = () => {
    setProvider(null);
    setSigner(null);
    setAccount(null);
    setCarbonBalance('0');
    
    toast({
      title: "Wallet Disconnected",
      description: "Your wallet has been disconnected",
    });
  };

  useEffect(() => {
    const checkConnection = async () => {
      if (window.ethereum) {
        try {
          const provider = new ethers.BrowserProvider(window.ethereum);
          const accounts = await provider.listAccounts();
          
          if (accounts.length > 0) {
            const signer = await provider.getSigner();
            setProvider(provider);
            setSigner(signer);
            setAccount(accounts[0].address);
          }
        } catch (error) {
          console.error('Error checking connection:', error);
        }
      }
    };

    checkConnection();

    // Listen for account changes
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          fetchCarbonBalance(accounts[0]);
        } else {
          disconnectWallet();
        }
      });

      window.ethereum.on('chainChanged', () => {
        window.location.reload();
      });
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeAllListeners('accountsChanged');
        window.ethereum.removeAllListeners('chainChanged');
      }
    };
  }, []);

  // Fetch carbon balance when account changes
  useEffect(() => {
    if (account && provider) {
      fetchCarbonBalance(account);
    }
  }, [account, provider]);

  return {
    provider,
    signer,
    account,
    isConnecting,
    carbonBalance,
    connectWallet,
    disconnectWallet,
    registerProject,
    getProjects,
    getUserProjects,
    approveProject,
    rejectProject,
    checkAdminRole,
    mintCarbonCredits,
    fetchCarbonBalance,
  };
};