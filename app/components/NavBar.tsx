"use client";

import React, { useState } from "react";
import Link from "next/link";
import { FaWallet } from "react-icons/fa";
import { MetaMaskProvider, useSDK } from "@metamask/sdk-react";
import { formatAddress } from "@/lib/utils";

interface ButtonProps {
    children: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    className?: string;
}

const Button: React.FC<ButtonProps> = ({ children, onClick, disabled, className = "" }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className={`px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 ${className}`}
    >
        {children}
    </button>
);

interface PopoverProps {
    children: React.ReactNode;
    trigger: React.ReactNode;
    className?: string;
}

const Popover: React.FC<PopoverProps> = ({ children, trigger, className = "" }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="relative">
            <div onClick={() => setIsOpen(!isOpen)}>
                {trigger}
            </div>
            {isOpen && (
                <div className={`absolute ${className}`}>
                    {children}
                </div>
            )}
        </div>
    );
};

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
            const result = await sdk.connectAndSign({ msg: 'Login with MetaMask' });
            console.log(result);

        }
    };

    return (
        <div className="relative">
            {connected ? (
                <Popover
                    trigger={
                        <Button>{formatAddress(account)}</Button>
                    }
                    className="mt-2 w-44 bg-gray-100 border rounded-md shadow-lg right-0 z-10 top-10"
                >

                    <button
                        onClick={signMessage}
                        className="block w-full pl-2 pr-4 py-2 text-left text-[#F05252] hover:bg-gray-200"
                    >
                        SignIn
                    </button>

                    <button
                        onClick={disconnect}
                        className="block w-full pl-2 pr-4 py-2 text-left text-[#F05252] hover:bg-gray-200"
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
        <nav className="flex justify-between items-center w-full px-6 py-7 rounded-xl">
            <span className="text-gray-100 text-2xl font-bold">Web3 Dapps samples</span>
            <div className="flex gap-4 px-6">
                <MetaMaskProvider debug={false} sdkOptions={sdkOptions}>
                    <ConnectWalletButton />
                </MetaMaskProvider>
            </div>
        </nav>

    );
};

export default NavBar;