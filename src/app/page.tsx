import { IDEProvider } from "@/components/IDEProvider";
import MainLayout from "@/layouts/MainLayout";
import { Toaster } from "@/components/ui/sonner";

export default function Home() {
    return (
        <IDEProvider>
            <MainLayout />
            <Toaster />
        </IDEProvider>
    );
}
