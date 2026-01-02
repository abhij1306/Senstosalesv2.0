import { Plus } from "lucide-react";
import { Button } from "@/components/design-system/atoms/Button";

interface PONotePageActionsProps {
    onCreate: () => void;
    disabled?: boolean;
}

export const PONotePageActions = ({ onCreate, disabled }: PONotePageActionsProps) => {
    return (
        <Button
            variant="primary"
            onClick={onCreate}
            disabled={disabled}
        >
            <Plus size={16} /> New Template
        </Button>
    );
};
