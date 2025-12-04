"use client";
import { useState } from "react";
import { IDEProvider } from "@/components";
import MainLayout from "@/layouts/MainLayout";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";

export default function Home() {
    const [queryClient] = useState(() => new QueryClient());
    return (
        <QueryClientProvider client={queryClient}>
            <IDEProvider>
                <MainLayout />
                <Toaster />
            </IDEProvider>
        </QueryClientProvider>
    );
}
