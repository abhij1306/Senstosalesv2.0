import {
    Label,
} from "@/components/design-system/atoms/Typography";
import { Button } from "@/components/design-system/atoms/Button";
import { Input } from "@/components/design-system/atoms/Input";
import { Stack } from "@/components/design-system/atoms/Layout";
import { Dialog } from "@/components/design-system/molecules/Dialog";

interface PONoteDialogProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    formData: { title: string; content: string };
    setFormData: (data: { title: string; content: string }) => void;
    onSubmit: (e: React.FormEvent) => void;
    isEditing: boolean;
}

export const PONoteDialog = ({
    isOpen,
    onClose,
    title,
    formData,
    setFormData,
    onSubmit,
    isEditing,
}: PONoteDialogProps) => {
    return (
        <Dialog
            isOpen={isOpen}
            onClose={onClose}
            title={title}
            maxWidth="max-w-xl"
            footer={
                <Button
                    type="button"
                    variant="default"
                    onClick={onSubmit}
                    className="w-full"
                >
                    {isEditing ? "Save Changes" : "Create Template"}
                </Button>
            }
        >
            <Stack gap={4} className="py-4">
                <p className="text-[var(--color-sys-text-secondary)] -mt-2">
                    Configure standard terms for purchase orders
                </p>
                <Stack gap={2}>
                    <Label className="text-[var(--color-sys-text-secondary)] uppercase">Template Title</Label>
                    <Input
                        value={formData.title}
                        onChange={(e) =>
                            setFormData({ ...formData, title: e.target.value })
                        }
                        placeholder="e.g., Standard Warranty Clause"
                        className="text-[var(--color-sys-text-primary)] bg-[var(--color-sys-bg-tertiary)]/10"
                        required
                        autoFocus
                    />
                </Stack>
                <Stack gap={2}>
                    <Label className="text-[var(--color-sys-text-secondary)] uppercase">Template Content</Label>
                    <textarea
                        value={formData.content}
                        onChange={(e) =>
                            setFormData({ ...formData, content: e.target.value })
                        }
                        rows={10}
                        className="w-full px-3 py-2 text-[14px] text-[var(--color-sys-text-primary)] bg-[var(--color-sys-bg-tertiary)]/10 border border-[var(--color-sys-text-tertiary)]/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-sys-brand-primary)]/10 focus:border-[var(--color-sys-brand-primary)]/30 resize-none transition-all"
                        placeholder="Enter documentation text..."
                        required
                    />
                </Stack>
            </Stack>
        </Dialog>
    );
};
