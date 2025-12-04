import {
  AdapterNotDetectedWallet,
  AdapterWallet,
  WalletReadyState,
  isRedirectable,
} from "@cedra-labs/wallet-adapter-core";
import { Slot } from "@radix-ui/react-slot";
import { createContext, forwardRef, useCallback, useContext } from "react";

import { HeadlessComponentProps, createHeadlessComponent } from "./utils";
import { useWalletStore } from "@/store/useWalletStore";

export interface WalletItemProps extends HeadlessComponentProps {
  /** The wallet option to be displayed. */
  wallet: AdapterWallet | AdapterNotDetectedWallet;
  /** A callback to be invoked when the wallet is connected. */
  onConnect?: () => void;
}

function useWalletItemContext(displayName: string) {
  const context = useContext(WalletItemContext);

  if (!context) {
    throw new Error(`\`${displayName}\` must be used within \`WalletItem\``);
  }

  return context;
}

const WalletItemContext = createContext<{
  wallet: AdapterWallet | AdapterNotDetectedWallet;
  connectWallet: () => void;
} | null>(null);

const Root = forwardRef<HTMLDivElement, WalletItemProps>(
  ({ wallet, onConnect, className, asChild, children }, ref) => {
    const connect = useWalletStore((state) => state.connect);

    const connectWallet = useCallback(() => {
      connect(wallet.name);
      onConnect?.();
    }, [connect, wallet.name, onConnect]);

    const isWalletReady = wallet.readyState === WalletReadyState.Installed;

    const mobileSupport =
      "deeplinkProvider" in wallet && wallet.deeplinkProvider;

    if (!isWalletReady && isRedirectable() && !mobileSupport) return null;

    const Component = asChild ? Slot : "div";

    return (
      <WalletItemContext.Provider value={{ wallet, connectWallet }}>
        <Component ref={ref} className={className}>
          {children}
        </Component>
      </WalletItemContext.Provider>
    );
  },
);
Root.displayName = "WalletItem";

const Icon = createHeadlessComponent(
  "WalletItem.Icon",
  "img",
  (displayName: string) => {
    const context = useWalletItemContext(displayName);

    return {
      src: context.wallet.icon,
      alt: `${context.wallet.name} icon`,
    };
  },
);

const Name = createHeadlessComponent(
  "WalletItem.Name",
  "div",
  (displayName: string) => {
    const context = useWalletItemContext(displayName);

    return {
      children: context.wallet.name,
    };
  },
);

const ConnectButton = createHeadlessComponent(
  "WalletItem.ConnectButton",
  "button",
  (displayName: string) => {
    const context = useWalletItemContext(displayName);

    return {
      onClick: context.connectWallet,
      children: "Connect",
    };
  },
);

const InstallLink = createHeadlessComponent(
  "WalletItem.InstallLink",
  "a",
  (displayName: string) => {
    const context = useWalletItemContext(displayName);

    return {
      href: context.wallet.url,
      target: "_blank",
      rel: "noopener noreferrer",
      children: "Install",
    };
  },
);

/** A headless component for rendering a wallet option's name, icon, and either connect button or install link. */
export const WalletItem = Object.assign(Root, {
  Icon,
  Name,
  ConnectButton,
  InstallLink,
});
