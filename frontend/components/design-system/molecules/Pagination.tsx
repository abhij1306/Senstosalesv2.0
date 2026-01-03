"use client";

import { Button } from '@/components/design-system/atoms/Button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/design-system/atoms/Select';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    pageSize: number;
    totalItems: number;
    onPageChange: (page: number) => void;
    onPageSizeChange: (size: number) => void;
    className?: string;
}

export function Pagination({
    currentPage,
    totalPages,
    pageSize,
    totalItems,
    onPageChange,
    onPageSizeChange,
    className,
}: PaginationProps) {
    const startItem = (currentPage - 1) * pageSize + 1;
    const endItem = Math.min(currentPage * pageSize, totalItems);

    return (
        <div className={cn('flex items-center justify-between px-4 py-3 bg-surface-variant/20 backdrop-blur-md transition-all duration-300', className)}>
            {/* Items count */}
            <div className="m3-label-medium text-secondary">
                Showing <span className="text-primary font-medium">{startItem}-{endItem}</span> of <span className="text-primary font-medium">{totalItems}</span>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-6">
                {/* Page size selector */}
                <div className="flex items-center gap-2">
                    <span className="m3-label-medium text-secondary">Rows per page</span>
                    <Select
                        value={String(pageSize)}
                        onValueChange={(value) => onPageSizeChange(Number(value))}
                    >
                        <SelectTrigger className="w-[70px] h-8 bg-surface/50">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="10">10</SelectItem>
                            <SelectItem value="25">25</SelectItem>
                            <SelectItem value="50">50</SelectItem>
                            <SelectItem value="100">100</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Page navigation */}
                <div className="flex items-center gap-2">
                    <Button
                        variant="elevated"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => onPageChange(1)}
                        disabled={currentPage === 1}
                    >
                        <ChevronsLeft size={14} />
                    </Button>

                    <Button
                        variant="elevated"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => onPageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                    >
                        <ChevronLeft size={14} />
                    </Button>

                    <div className="m3-label-medium text-secondary px-2 min-w-[80px] text-center">
                        Page <span className="text-primary font-medium">{currentPage}</span> / {totalPages}
                    </div>

                    <Button
                        variant="elevated"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => onPageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                    >
                        <ChevronRight size={14} />
                    </Button>

                    <Button
                        variant="elevated"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => onPageChange(totalPages)}
                        disabled={currentPage === totalPages}
                    >
                        <ChevronsRight size={14} />
                    </Button>
                </div>
            </div>
        </div>
    );
}
