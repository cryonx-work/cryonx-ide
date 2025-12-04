import React from "react";
import Image from "next/image";

export const HeaderLogo: React.FC = () => {
    return (
        <div className="ml-5">
            <Image src="/logo.png" alt="CryonX Logo" width={196} height={196} />
        </div>
    );
};
