"use client";

import React from "react";
import { RefreshCw, Trash2 } from "lucide-react";
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
    currentPin: z
        .string()
        .length(6, "PIN must be 6 digits")
        .regex(/^\d+$/, "PIN must be numbers"),
    newPin: z
        .string()
        .length(6, "PIN must be 6 digits")
        .regex(/^\d+$/, "PIN must be numbers"),
});

interface SettingsOverlayProps {
    viewMode: "chat" | "setup" | "unlock" | "change-pin";
    setViewMode: (mode: "chat" | "setup" | "unlock" | "change-pin") => void;
    onChangePin: (currentPin: string, newPin: string) => void;
    handleRemoveKey: () => void;
}

export const SettingsOverlay: React.FC<SettingsOverlayProps> = ({
    viewMode,
    setViewMode,
    onChangePin,
    handleRemoveKey,
}) => {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            currentPin: "",
            newPin: "",
        },
    });

    function onSubmit(values: z.infer<typeof formSchema>) {
        onChangePin(values.currentPin, values.newPin);
    }

    return (
        <div className="absolute top-10 right-0 left-0 bg-[#1a1d26] border-b border-white/10 p-4 z-10 shadow-xl animate-in slide-in-from-top-2">
            <h3 className="text-sm font-bold text-white mb-3">Settings</h3>

            {viewMode === "change-pin" ? (
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="space-y-3"
                    >
                        <FormField
                            control={form.control}
                            name="currentPin"
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <Input
                                            type="password"
                                            maxLength={6}
                                            placeholder="Current PIN"
                                            className="bg-black/20 border-white/10 text-white text-xs"
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
                        <FormField
                            control={form.control}
                            name="newPin"
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <Input
                                            type="password"
                                            maxLength={6}
                                            placeholder="New PIN"
                                            className="bg-black/20 border-white/10 text-white text-xs"
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
                        <div className="flex gap-2">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => setViewMode("chat")}
                                className="flex-1 bg-white/5 hover:bg-white/10 text-gray-300 h-8 text-xs"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                className="flex-1 bg-cryonx-accent hover:bg-cryonx-accent/80 text-white h-8 text-xs"
                            >
                                Save
                            </Button>
                        </div>
                    </form>
                </Form>
            ) : (
                <div className="space-y-2">
                    <Button
                        variant="ghost"
                        onClick={() => setViewMode("change-pin")}
                        className="w-full justify-start gap-2 hover:bg-white/5 text-xs text-gray-300 h-auto p-2"
                    >
                        <RefreshCw size={14} /> Change PIN
                    </Button>
                    <Button
                        variant="ghost"
                        onClick={handleRemoveKey}
                        className="w-full justify-start gap-2 hover:bg-red-500/10 text-xs text-red-400 hover:text-red-300 h-auto p-2"
                    >
                        <Trash2 size={14} /> Remove API Key
                    </Button>
                </div>
            )}
        </div>
    );
};
