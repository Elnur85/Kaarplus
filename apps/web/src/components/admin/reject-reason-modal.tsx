"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface RejectReasonModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (reason: string) => void;
    listingTitle: string;
}

import { useTranslation } from "react-i18next";

export function RejectReasonModal({ isOpen, onClose, onConfirm, listingTitle }: RejectReasonModalProps) {
    const { t } = useTranslation('admin');
    const [reason, setReason] = useState("");

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{t('rejectModal.title')}</DialogTitle>
                    <DialogDescription>
                        {t('rejectModal.description', { title: listingTitle })}
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <Textarea
                        placeholder={t('rejectModal.placeholder')}
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        className="min-h-[100px]"
                    />
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        {t('rejectModal.cancel')}
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={() => onConfirm(reason)}
                        disabled={!reason.trim()}
                    >
                        {t('rejectModal.confirm')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

