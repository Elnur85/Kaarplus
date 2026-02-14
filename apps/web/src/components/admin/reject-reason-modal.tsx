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

export function RejectReasonModal({ isOpen, onClose, onConfirm, listingTitle }: RejectReasonModalProps) {
    const [reason, setReason] = useState("");

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Lükka kuulutus tagasi</DialogTitle>
                    <DialogDescription>
                        Palun lisage põhjus, miks kuulutus "{listingTitle}" tagasi lükatakse. See saadetakse ka kasutajale.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <Textarea
                        placeholder="Nt: Pildid ei vasta nõuetele, puudulik kirjeldus..."
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        className="min-h-[100px]"
                    />
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        Tühista
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={() => onConfirm(reason)}
                        disabled={!reason.trim()}
                    >
                        Lükka tagasi
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
