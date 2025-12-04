"use client";

import React, { useState } from "react";
import { Key, Eye, EyeOff, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";

const formSchema = z.object({
    apiKey: z.string().min(1, "API Key is required"),
    pin: z
        .string()
        .length(6, "PIN must be 6 digits")
        .regex(/^\d+$/, "PIN must be numbers"),
});

interface SetupViewProps {
    onSetup: (apiKey: string, pin: string) => void;
    isProcessing: boolean;
    defaultPin?: string;
}

export const SetupView: React.FC<SetupViewProps> = ({
    onSetup,
    isProcessing,
    defaultPin = "",
}) => {
    const [showPin, setShowPin] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            apiKey: "",
            pin: defaultPin,
        },
    });

    function onSubmit(values: z.infer<typeof formSchema>) {
        onSetup(values.apiKey, values.pin);
    }

    return (
        <div className="w-full h-full flex flex-col items-center justify-center p-6">
            <div className="w-full max-w-xs space-y-6">
                <div className="text-center space-y-2">
                    <div className="w-12 h-12 bg-cryonx-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Key className="text-cryonx-accent" size={24} />
                    </div>
                    <h2 className="text-lg font-bold text-white">
                        Setup AI Assistant
                    </h2>
                    <p className="text-xs text-gray-400">
                        Enter your Gemini API Key to start using CryonxAI. Your
                        key will be encrypted locally.
                    </p>
                </div>

                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="space-y-3"
                    >
                        <FormField
                            control={form.control}
                            name="apiKey"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs text-gray-500">
                                        API Key
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            type="password"
                                            placeholder="AIza..."
                                            className="bg-[#1a1d26] border-white/10 text-white focus-visible:ring-cryonx-accent"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="pin"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs text-gray-500">
                                        Create 6-digit PIN
                                    </FormLabel>
                                    <div className="relative">
                                        <FormControl>
                                            <Input
                                                type={
                                                    showPin
                                                        ? "text"
                                                        : "password"
                                                }
                                                maxLength={6}
                                                placeholder="000000"
                                                className="bg-[#1a1d26] border-white/10 text-white focus-visible:ring-cryonx-accent tracking-widest pr-10"
                                                {...field}
                                                onChange={(e) => {
                                                    const val =
                                                        e.target.value.replace(
                                                            /\D/g,
                                                            ""
                                                        );
                                                    field.onChange(val);
                                                }}
                                            />
                                        </FormControl>
                                        <button
                                            type="button"
                                            onClick={() => setShowPin(!showPin)}
                                            className="absolute right-2 top-2.5 text-gray-500 hover:text-white"
                                        >
                                            {showPin ? (
                                                <EyeOff size={14} />
                                            ) : (
                                                <Eye size={14} />
                                            )}
                                        </button>
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button
                            type="submit"
                            disabled={isProcessing}
                            className="w-full bg-cryonx-accent hover:bg-cryonx-accent/80 text-white"
                        >
                            {isProcessing ? (
                                <Loader2
                                    className="animate-spin mr-2"
                                    size={16}
                                />
                            ) : null}
                            Save & Continue
                        </Button>
                    </form>
                </Form>
            </div>
        </div>
    );
};
