import { Plus } from "lucide-react";
import { Button } from "@/components/design-system/atoms/Button";

interface PONotePageActionsProps {
    onCreate: () => void;
    disabled?: boolean;
}

export const PONotePageActions = ({ onCreate, disabled }: PONotePageActionsProps) => {
    return (
        <Button
            variant="default"
            onClick={onCreate}
            disabled={disabled}
        >
            <Plus size={16} /> New Template
        </Button>
    );
};
