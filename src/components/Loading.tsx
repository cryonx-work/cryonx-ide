import { Loader2 } from "lucide-react";
import Image from "next/image";

export function Loading({ size = 24 }: { size?: number }) {
    return (
        <div className="flex-1 flex items-center justify-center">
            <Loader2 className="animate-spin text-cryonx-accent" size={size} />
        </div>
    );
}

export function LoadingScreen() {
    return (
        <div className=" flex items-center flex-col justify-center  w-screen h-screen bg-cryonx-bg gap-0">
            <Image
                src={"/logo.png"}
                width={256}
                height={256}
                alt="Logo"
                priority
            />
            <div className="loading flex items-center justify-center bg-cryonx-bg gap-1.5">
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <span></span>
            </div>
        </div>
    );
}
