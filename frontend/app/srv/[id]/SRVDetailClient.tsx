"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { ClipboardCheck } from "lucide-react";

import {
    Button,
    Body,
    SmallText,
    Accounting,
    DocumentTemplate,
    type Column,
    Flex,
    Stack,
    SRVDetailCard,
    InspectionManifest,
} from "@/components/design-system";

interface SRVDetailClientProps {
    initialSRV: any;
}

export default function SRVDetailClient({ initialSRV }: SRVDetailClientProps) {
    const router = useRouter();

    const header = initialSRV?.header || {};
    const items = initialSRV?.items || [];

    const statsData = useMemo(() => [
        {
            title: "Total Items",
            value: items.length.toString(),
            variant: "default" as const
        },
        {
            title: "Receipt Status",
            value: "FULLY RECEIVED",
            variant: "success" as const
        },
        {
            title: "Document Type",
            value: "SRV MATERIAL",
            variant: "secondary" as const
        }
    ], [items.length]);

    const columns: Column<any>[] = [
        {
            label: "Item Description",
            key: "material_description",
            render: (_val: string, row: any) => (
                <Stack gap={1}>
                    <Body className="font-medium">{row.material_description}</Body>
                    <SmallText className="text-app-fg-muted uppercase tracking-wider">{row.material_code}</SmallText>
                </Stack>
            )
        },
        {
            label: "Ordered",
            key: "ordered_quantity",
            render: (_val: any, row: any) => <Body className="font-mono">{row.ordered_quantity} {row.unit}</Body>
        },
        {
            label: "Received",
            key: "received_quantity",
            align: "right",
            render: (val: number) => <Accounting className="text-app-status-success font-semibold">{val}</Accounting>
        },
        {
            label: "Rejected",
            key: "rejected_quantity",
            align: "right",
            render: (val: number) => (
                <Accounting
                    className={val > 0 ? "text-app-status-error font-semibold" : "text-app-fg-muted"}
                >
                    {val}
                </Accounting>
            )
        }
    ];

    const actions = (
        <Flex gap={2}>
            <Button variant="outline" onClick={() => router.back()}>
                Return to Registry
            </Button>
            <Button variant="outline" onClick={() => window.print()}>
                Export PDF
            </Button>
        </Flex>
    );

    return (
        <DocumentTemplate
            title={`Store Receipt Voucher - ${header.srv_number}`}
            description="Official material receipt and inspection document"
            actions={actions}
            icon={<ClipboardCheck size={20} className="text-app-status-success" />}
            iconLayoutId="srv-detail-icon"
        >
            <Stack gap={8}>
                <SRVDetailCard header={header} summary={statsData} />
                <InspectionManifest items={items} columns={columns} />
            </Stack>
        </DocumentTemplate>
    );
}
