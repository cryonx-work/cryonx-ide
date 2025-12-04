"use client";

import React from "react";
import { Lock, Loader2 } from "lucide-react";
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
    FormMessage,
} from "@/components/ui/form";

const formSchema = z.object({
    pin: z
        .string()
        .length(6, "PIN must be 6 digits")
        .regex(/^\d+$/, "PIN must be numbers"),
});

interface UnlockViewProps {
    onUnlock: (pin: string) => void;
    isProcessing: boolean;
    handleRemoveKey: () => void;
}

export const UnlockView: React.FC<UnlockViewProps> = ({
    onUnlock,
    isProcessing,
    handleRemoveKey,
}) => {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            pin: "",
        },
    });

    function onSubmit(values: z.infer<typeof formSchema>) {
        onUnlock(values.pin);
    }

    return (
        <div className="w-full h-full flex flex-col items-center justify-center p-6">
            <div className="w-full max-w-xs space-y-6">
                <div className="text-center space-y-2">
                    <div className="w-12 h-12 bg-cryonx-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Lock className="text-cryonx-accent" size={24} />
                    </div>
                    <h2 className="text-lg font-bold text-white">
                        Unlock AI Assistant
                    </h2>
                    <p className="text-xs text-gray-400">
                        Enter your 6-digit PIN to decrypt your API Key.
                    </p>
                </div>

                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="space-y-3"
                    >
                        <FormField
                            control={form.control}
                            name="pin"
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <Input
                                            type="password"
                                            maxLength={6}
                                            placeholder="••••••"
                                            className="bg-[#1a1d26] border-white/10 text-white focus-visible:ring-cryonx-accent tracking-widest text-center"
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
                            Unlock
                        </Button>
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={handleRemoveKey}
                            className="w-full text-xs text-red-400 hover:text-red-300 hover:bg-transparent mt-4 h-auto p-0"
                        >
                            Reset / Forgot PIN?
                        </Button>
                    </form>
                </Form>
            </div>
        </div>
    );
};
