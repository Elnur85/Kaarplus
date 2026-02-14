"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, X, Camera, AlertCircle, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Image from "next/image";

interface Step3PhotoUploadProps {
    files: File[];
    onFilesChange: (files: File[]) => void;
}

export function Step3PhotoUpload({ files, onFilesChange }: Step3PhotoUploadProps) {
    const onDrop = useCallback((acceptedFiles: File[]) => {
        onFilesChange([...files, ...acceptedFiles]);
    }, [files, onFilesChange]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            "image/jpeg": [".jpg", ".jpeg"],
            "image/png": [".png"],
            "image/webp": [".webp"],
        },
        maxSize: 10485760, // 10MB
    });

    const removeFile = (index: number) => {
        const newFiles = [...files];
        newFiles.splice(index, 1);
        onFilesChange(newFiles);
    };

    return (
        <div className="space-y-8">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold tracking-tight">Lisage fotod</h2>
                <p className="text-muted-foreground mt-2">
                    Heade piltidega kuulutus müüb kiiremini. Lisage vähemalt 3 fotot.
                </p>
            </div>

            <div
                {...getRootProps()}
                className={cn(
                    "border-2 border-dashed rounded-xl p-12 text-center transition-all cursor-pointer",
                    isDragActive
                        ? "border-primary bg-primary/5 scale-[0.99]"
                        : "border-muted-foreground/20 hover:border-primary/50 hover:bg-slate-50"
                )}
            >
                <input {...getInputProps()} />
                <div className="flex flex-col items-center">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-4">
                        <Upload size={32} />
                    </div>
                    <p className="text-lg font-bold">Lohistage fotod siia või klõpsake</p>
                    <p className="text-sm text-muted-foreground mt-1">
                        PNG, JPG või WEBP kuni 10MB (max 30 fotot)
                    </p>
                    <Button variant="secondary" className="mt-6 font-bold">
                        Vali failid arvutist
                    </Button>
                </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="text-amber-500 shrink-0 mt-0.5" size={18} />
                <div className="text-sm text-amber-800">
                    <p className="font-bold">Nõuanne: </p>
                    <p>Tehke pilte valges ja vältige varjusid. Näidake autot erinevate nurkade alt (esi, taga, küljed, sisu).</p>
                </div>
            </div>

            {files.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-8">
                    {files.map((file, index) => (
                        <div
                            key={index}
                            className="group relative aspect-video bg-muted rounded-lg overflow-hidden border border-border"
                        >
                            <Image
                                src={URL.createObjectURL(file)}
                                alt={`Pilt ${index + 1}`}
                                fill
                                className="object-cover"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                <button
                                    onClick={() => removeFile(index)}
                                    className="p-2 bg-white rounded-full text-destructive hover:bg-destructive hover:text-white transition-all shadow-lg"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                            {index === 0 && (
                                <div className="absolute bottom-0 left-0 right-0 bg-primary text-white text-[10px] font-extrabold uppercase py-1 text-center tracking-wider">
                                    Peapilt
                                </div>
                            )}
                            <div className="absolute top-2 left-2 bg-black/60 text-white text-[10px] font-bold px-2 py-0.5 rounded backdrop-blur-sm">
                                {index + 1}
                            </div>
                        </div>
                    ))}
                    {files.length < 30 && (
                        <div
                            {...getRootProps()}
                            className="aspect-video bg-muted/50 rounded-lg flex flex-col items-center justify-center border-2 border-dashed border-muted hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer text-muted-foreground hover:text-primary"
                        >
                            <Camera size={24} className="mb-2" />
                            <span className="text-[10px] font-bold uppercase tracking-wider text-center px-2">Lisage veel (kuni {30 - files.length})</span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
