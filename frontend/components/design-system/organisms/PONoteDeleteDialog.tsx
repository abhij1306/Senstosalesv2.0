import { Button } from "../atoms/Button";
import { Body } from "../atoms/Typography";
import { Dialog } from "../molecules/Dialog";

interface PONoteDeleteDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

export const PONoteDeleteDialog = ({
    isOpen,
    onClose,
    onConfirm,
}: PONoteDeleteDialogProps) => {
    return (
        <Dialog
            isOpen={isOpen}
            onClose={onClose}
            title="Delete Template?"
            maxWidth="max-w-md"
            footer={
                <div className="flex gap-3 w-full">
                    <Button
                        variant="ghost"
                        onClick={onClose}
                        className="flex-1"
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={onConfirm}
                        className="flex-1"
                    >
                        Delete Forever
                    </Button>
                </div>
            }
        >
            <p className="mb-4 text-sys-secondary">This action cannot be undone.</p>
            <Body className="text-sys-secondary">
                Are you sure you want to permanently delete this template? Any new
                documents will no longer be able to use this preset.
            </Body>
        </Dialog>
    );
};
