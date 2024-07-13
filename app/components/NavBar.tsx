"use client";

import React, { useState } from "react";
import { FaWallet } from "react-icons/fa";
import { MetaMaskProvider, useSDK } from "@metamask/sdk-react";
import { formatAddress } from "@/lib/utils";
import Popover from "./Popover";

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}

const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  disabled,
  className = "",
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 ${className}`}
  >
    {children}
  </button>
);

export const ConnectWalletButton: React.FC = () => {
  const { sdk, connected, connecting, account } = useSDK();

  const connect = async () => {
    try {
      await sdk?.connect();
    } catch (err) {
      console.warn(`No accounts found`, err);
    }
  };

  const disconnect = () => {
    if (sdk) {
      sdk.terminate();
    }
  };

  const signMessage = async () => {
    if (sdk) {
      const result = await sdk.connectAndSign({ msg: "Login with MetaMask" });
      sdk.getProvider()?.sendAsync(
        {
          jsonrpc: "2.0",
          id: 83,
          method: "eth_chainId",
          params: [],
        },
        (error, result) => {
          console.log(error);
          console.log(result);
        }
      );
    }
  };

  const sendRpcReq = async () => {
    if (sdk) {
      try {
        // Assuming sdk.getProvider() returns a provider that is EIP-1193 compliant
        const provider = sdk.getProvider();
        if (provider) {
          const result = await provider.request({
            method: "eth_chainId",
            params: [],
          });
          console.log("Result:", result);
        } else {
          console.error("Provider is not available.");
        }
      } catch (error) {
        console.error("Error sending RPC request:", error);
      }
    } else {
      console.error("SDK is not initialized.");
    }
  };

  return (
    <div className="relative">
      {connected ? (
        <Popover
          trigger={<Button>{formatAddress(account)}</Button>}
          className="right-0 top-10 z-10 mt-2 w-44 rounded-md border bg-gray-100 shadow-lg"
        >
          <button
            onClick={() => {
              signMessage();
              // setIsOpen(false);  // Close popover after action
            }}
            className="block w-full py-2 pl-2 pr-4 text-left text-[#F05252] hover:bg-gray-200"
          >
            SignIn
          </button>

          <button
            onClick={() => {
              sendRpcReq();
              // setIsOpen(false);  // Close popover after action
            }}
            className="block w-full py-2 pl-2 pr-4 text-left text-[#F05252] hover:bg-gray-200"
          >
            SendRpcReq
          </button>

          <button
            onClick={() => {
              disconnect();
              // setIsOpen(false);  // Close popover after action
            }}
            className="block w-full py-2 pl-2 pr-4 text-left text-[#F05252] hover:bg-gray-200"
          >
            Disconnect
          </button>
        </Popover>
      ) : (
        <Button disabled={connecting} onClick={connect} className="flex">
          <FaWallet className="mr-2 h-4 w-4" /> Connect Wallet
        </Button>
      )}
    </div>
  );
};

export const NavBar = () => {
  const host =
    typeof window !== "undefined" ? window.location.host : "defaultHost";

  const sdkOptions = {
    logging: { developerMode: false },
    checkInstallationImmediately: false,
    dappMetadata: {
      name: "Next-Metamask-Boilerplate",
      url: host, // using the host constant defined above
    },
  };

  return (
    <nav className="flex w-full items-center justify-between rounded-xl px-6 py-7">
      <span className="text-2xl font-bold text-gray-100">
        Web3 Dapps samples
      </span>
      <div className="flex gap-4 px-6">
        <MetaMaskProvider debug={false} sdkOptions={sdkOptions}>
          <ConnectWalletButton />
        </MetaMaskProvider>
      </div>
    </nav>
  );
};

export default NavBar;
