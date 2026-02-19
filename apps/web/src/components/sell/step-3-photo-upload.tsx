"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, X, Camera, AlertCircle, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { LISTING_PHOTO_MAX } from "@/lib/constants";

interface Step3PhotoUploadProps {
    files: File[];
    onFilesChange: (files: File[]) => void;
}

import { useTranslation } from "react-i18next";

export function Step3PhotoUpload({ files, onFilesChange }: Step3PhotoUploadProps) {
    const { t } = useTranslation('sell');
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
                <h2 className="text-2xl font-bold tracking-tight">{t('step3.title')}</h2>
                <p className="text-muted-foreground mt-2">
                    {t('step3.description')}
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
                    <p className="text-lg font-bold">{t('step3.dropzone.title')}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                        {t('step3.dropzone.subtitle')}
                    </p>
                    <Button variant="secondary" className="mt-6 font-bold">
                        {t('step3.dropzone.button')}
                    </Button>
                </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 flex items-start gap-4">
                <AlertCircle className="text-blue-500 shrink-0 mt-1" size={24} />
                <div className="space-y-2">
                    <p className="font-bold text-blue-900">{t('step3.tips.title')}</p>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1 text-sm text-blue-800 list-disc pl-4">
                        {(t('step3.tips.list', { returnObjects: true }) as string[]).map((tip, i) => (
                            <li key={i}>{tip}</li>
                        ))}
                    </ul>
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
                                alt={t('step3.photoNumber', { index: index + 1 })}
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
                                    {t('step3.mainPhoto')}
                                </div>
                            )}
                            <div className="absolute top-2 left-2 bg-black/60 text-white text-[10px] font-bold px-2 py-0.5 rounded backdrop-blur-sm">
                                {index + 1}
                            </div>
                        </div>
                    ))}
                    {files.length < LISTING_PHOTO_MAX && (
                        <div
                            {...getRootProps()}
                            className="aspect-video bg-muted/50 rounded-lg flex flex-col items-center justify-center border-2 border-dashed border-muted hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer text-muted-foreground hover:text-primary"
                        >
                            <Camera size={24} className="mb-2" />
                            <span className="text-[10px] font-bold uppercase tracking-wider text-center px-2">
                                {t('step3.addMore', { count: LISTING_PHOTO_MAX - files.length })}
                            </span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

