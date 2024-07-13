import { ethers, Provider, Contract, getDefaultProvider } from "ethers"; // Updated imports
import React, { useState } from "react";
const contractABI = [
  {
    inputs: [],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "allowance",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "confirmationsFromGuardiansForReset",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_from",
        type: "address",
      },
    ],
    name: "denySending",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "getWalletFunds",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "guardian",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "isAllowedToSend",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address payable",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "proposeNewOwner",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_from",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "_amount",
        type: "uint256",
      },
    ],
    name: "setAllowance",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address payable",
        name: "_to",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "_amount",
        type: "uint256",
      },
      {
        internalType: "bytes",
        name: "payload",
        type: "bytes",
      },
    ],
    name: "transfer",
    outputs: [
      {
        internalType: "bytes",
        name: "",
        type: "bytes",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    stateMutability: "payable",
    type: "receive",
  },
];

const contractAddress = "0x1bf0f2198bF707B75a29F80ea9539e72af1D8074"; // Replace with your contract address

const SmartContractWallet = () => {
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [value, setValue] = useState<string | number>("");
  const [weiSent, setWeiSent] = useState<string | number>("");

  const [address, setAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [payload, setPayload] = useState("");
  const [result, setResult] = useState("");

  const contract = new ethers.Contract(contractAddress, contractABI, signer);

  const connectWalletHandler = async () => {
    if (window.ethereum) {
      try {
        // Using getDefaultProvider for general purpose
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        setSigner(signer);
        console.log("Wallet connected", signer.address);
      } catch (err) {
        console.error(err);
      }
    } else {
      console.log("Install MetaMask");
    }
  };

  const fetchValueHandler = async () => {
    if (signer && contractABI && contractAddress) {
      try {
        const weiValue = await contract.getWalletFunds();
        console.log("Value fetched in Wei:", weiValue.toString()); // Display the Wei value as string

        // Convert Wei to Ether
        const etherValue = ethers.formatEther(weiValue);
        setValue(etherValue); // Assuming setValue can handle string representation of Ether
        console.log("Converted Ether value:", etherValue);
      } catch (error: any) {
        console.error("Error fetching value:", error);
      }
    }
  };

  const sendWeiToContract = async () => {
    try {
      // Ensure that the signer and contract address are provided
      if (!signer || !ethers.isAddress(contractAddress)) {
        await connectWalletHandler();
        throw new Error("Invalid signer or contract address.");
      }

      // Define the transaction parameters
      const tx = {
        to: contractAddress, // Address of the contract
        value: ethers.parseUnits("100", "wei"), // Amount in Wei
      };
      // to be loaded from input
      // Send the transaction
      const transactionResponse = await signer.sendTransaction(tx);
      console.log("Transaction sent! Hash:", transactionResponse.hash);

      // Await the transaction to be mined
      await transactionResponse.wait();
      console.log("Transaction confirmed!");
      setWeiSent(100);
    } catch (error: any) {
      console.error("Failed to send Wei:", error);
      setWeiSent("Error, not sent");
    }
  };

  async function getAllowance(address: string) {
    try {
      const allowance = await contract.allowance(address);
      console.log(`Allowance for ${address}:`, allowance.toString());
      return allowance;
    } catch (error: any) {
      console.error("Error fetching allowance:", error);
    }
  }

  async function getConfirmationsForReset() {
    try {
      const confirmations = await contract.confirmationsFromGuardiansForReset();
      console.log(
        "Confirmations needed from guardians for reset:",
        confirmations.toString()
      );
      return confirmations;
    } catch (error: any) {
      console.error("Error fetching confirmations:", error);
    }
  }

  async function denySending(address: string) {
    try {
      const tx = await contract.denySending(address);
      await tx.wait();
      console.log(`Sending rights denied to ${address}`);
    } catch (error: any) {
      console.error("Error denying sending:", error);
    }
  }

  async function getWalletFunds() {
    try {
      const funds = await contract.getWalletFunds();
      console.log("Total wallet funds:", ethers.formatEther(funds) + " ETH");
      return funds;
    } catch (error: any) {
      console.error("Error fetching wallet funds:", error);
    }
  }

  async function isGuardian(address: string) {
    try {
      const isGuard = await contract.guardian(address);
      console.log(`${address} is a guardian:`, isGuard);
      return isGuard;
    } catch (error: any) {
      console.error("Error checking guardian status:", error);
    }
  }

  async function checkAllowedToSend(address: string) {
    try {
      const isAllowed = await contract.isAllowedToSend(address);
      console.log(`${address} is allowed to send:`, isAllowed);
      return isAllowed;
    } catch (error: any) {
      console.error("Error checking if allowed to send:", error);
    }
  }

  async function proposeNewOwner(newOwnerAddress: string) {
    try {
      const tx = await contract.proposeNewOwner(newOwnerAddress);
      await tx.wait();
      console.log(`Proposed ${newOwnerAddress} as the new owner`);
    } catch (error: any) {
      console.error("Error proposing new owner:", error);
    }
  }

  async function setAllowance(address: string, amountInWei: number) {
    try {
      const tx = await contract.setAllowance(address, amountInWei);
      await tx.wait();
      console.log(`Allowance set for ${address}:`, amountInWei.toString());
    } catch (error: any) {
      console.error("Error setting allowance:", error);
    }
  }

  async function transfer(toAddress: string, amount: number, payload: any) {
    try {
      const tx = await contract.transfer(toAddress, amount, payload);
      await tx.wait();
      console.log(
        `Transferred ${ethers.formatEther(amount)} ETH to ${toAddress}`
      );
      return tx;
    } catch (error: any) {
      console.error("Error transferring funds:", error);
    }
  }

  const handleAllowance = async () => {
    try {
      const allowance = await contract.allowance(address);
      setResult(`Allowance: ${allowance.toString()}`);
    } catch (error: any) {
      console.error("Error:", error);
      setResult(`Error: ${error.message}`);
    }
  };

  const handleGetConfirmationsForReset = async () => {
    try {
      const confirmations = await contract.confirmationsFromGuardiansForReset();
      setResult(`Confirmations Needed: ${confirmations.toString()}`);
    } catch (error: any) {
      console.error("Error:", error);
      setResult(`Error: ${error.message}`);
    }
  };

  const handleDenySending = async () => {
    try {
      const tx = await contract.denySending(address);
      await tx.wait();
      setResult(`Sending rights denied to ${address}`);
    } catch (error: any) {
      console.error("Error:", error);
      setResult(`Error: ${error.message}`);
    }
  };

  const handleGetWalletFunds = async () => {
    try {
      const funds = await contract.getWalletFunds();
      setResult(`Wallet Funds: ${ethers.formatEther(funds)} ETH`);
    } catch (error: any) {
      console.error("Error:", error);
      setResult(`Error: ${error.message}`);
    }
  };

  const handleIsGuardian = async () => {
    try {
      const isGuard = await contract.guardian(address);
      setResult(`${address} is a guardian: ${isGuard}`);
    } catch (error: any) {
      console.error("Error:", error);
      setResult(`Error: ${error.message}`);
    }
  };

  const handleIsAllowedToSend = async () => {
    try {
      const isAllowed = await contract.isAllowedToSend(address);
      setResult(`${address} is allowed to send: ${isAllowed}`);
    } catch (error: any) {
      console.error("Error:", error);
      setResult(`Error: ${error.message}`);
    }
  };

  const handleProposeNewOwner = async () => {
    try {
      const tx = await contract.proposeNewOwner(address);
      await tx.wait();
      setResult(`New owner proposed: ${address}`);
    } catch (error: any) {
      console.error("Error:", error);
      setResult(`Error: ${error.message}`);
    }
  };

  const handleSetAllowance = async () => {
    try {
      const tx = await contract.setAllowance(
        address,
        ethers.parseEther(amount)
      );
      await tx.wait();
      setResult(`Allowance set for ${address}: ${amount} ETH`);
    } catch (error: any) {
      console.error("Error:", error);
      setResult(`Error: ${error.message}`);
    }
  };

  // const handleTransfer = async () => {
  //   try {
  //     const tx = await contract.transfer(address, ethers.parseEther(amount), ethers.utils.arrayify(payload));
  //     await tx.wait();
  //     setResult(`Transferred ${amount} ETH to ${address} with payload.`);
  //   } catch (error: any) {
  //     console.error('Error:', error);
  //     setResult(`Error: ${error.message}`);
  //   }
  // };

  return (
    <div className="p-5">
      <h1 className="mb-4 text-xl font-bold">Smart Contract Interaction</h1>

      <div className="mb-4 flex flex-wrap gap-2">
        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Enter address"
          className="flex-1 rounded border p-2 text-black"
        />
        <input
          type="text"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Enter amount"
          className="flex-1 rounded border p-2 text-black"
        />
        <input
          type="text"
          value={payload}
          onChange={(e) => setPayload(e.target.value)}
          placeholder="Enter payload"
          className="flex-1 rounded border p-2 text-black"
        />
      </div>

      <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {!signer && (
          <button
            onClick={connectWalletHandler}
            className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-700"
          >
            Connect Wallet
          </button>
        )}

        {signer && (
          <div className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-700">
            Wallet Connected
          </div>
        )}
        <button
          onClick={handleAllowance}
          className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-700"
        >
          Check Allowance
        </button>
        <button
          onClick={handleGetConfirmationsForReset}
          className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-700"
        >
          Confirmations Needed
        </button>
        <button
          onClick={handleDenySending}
          className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-700"
        >
          Deny Sending
        </button>
        <button
          onClick={handleGetWalletFunds}
          className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-700"
        >
          Get Wallet Funds
        </button>
        <button
          onClick={handleIsGuardian}
          className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-700"
        >
          Is Guardian?
        </button>
        <button
          onClick={handleIsAllowedToSend}
          className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-700"
        >
          Is Allowed to Send?
        </button>
        <button
          onClick={handleProposeNewOwner}
          className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-700"
        >
          Propose New Owner
        </button>
        <button
          onClick={handleSetAllowance}
          className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-700"
        >
          Set Allowance
        </button>
        {/* Button for transfer is commented out in your example, uncomment if needed
        <button onClick={handleTransfer} className="bg-blue-500 hover:bg-blue-700 text-white px-4 py-2 rounded">Transfer</button> 
        */}
      </div>

      <button
        onClick={fetchValueHandler}
        className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-700"
      >
        Fetch Value
      </button>
      <p className="mb-4 text-gray-100">
        Value: <span className="font-semibold">{value} ETH</span>
      </p>

      <button
        onClick={sendWeiToContract}
        className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-700"
      >
        Send Wei To Contract
      </button>
      <p className="text-gray-100">
        Sent: <span className="font-semibold">{weiSent} Wei</span>
      </p>

      <p className="mt-4 text-gray-800">Result: {result}</p>
    </div>
  );
};

export default SmartContractWallet;
