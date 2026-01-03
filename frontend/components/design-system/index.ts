/**
 * Atomic Design System v1.0 - Component Exports
 * Centralized export file for all design system components
 */

// ==================== ATOMS ====================
export { Button } from "./atoms/Button";
export type { ButtonProps } from "./atoms/Button";
export { Input } from "./atoms/Input";
export type { InputProps } from "./atoms/Input";
export {
    Title1,
    Title2,
    Title3,
    Body,
    Subhead,
    Footnote,
    Caption1,
    Caption2,
    Label as TypographyLabel,
    SmallText,
    MonoCode,
    Mono,
    Accounting,
} from "./atoms/Typography";
export { Card } from "./atoms/Card";
export type { CardProps } from "./atoms/Card";
export { Badge, badgeVariants } from "./atoms/Badge";
export type { BadgeProps } from "./atoms/Badge";
export { StatusBadge } from "./atoms/StatusBadge";
export { Label } from "./atoms/Label";
export { Textarea } from "./atoms/Textarea";
export { Checkbox } from "./atoms/Checkbox";
export { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectSeparator, SelectTrigger, SelectValue } from "./atoms/Select";
export * from "./atoms/DownloadButton";
export { Icon } from "./atoms/Icon";
export type { IconProps } from "./atoms/Icon";
export { Flex, Stack, Grid, Box } from "./atoms/Layout";
export { SpotlightCard } from "./atoms/SpotlightCard";
export { DatePicker } from "./atoms/DatePicker";
export type { DatePickerProps } from "./atoms/DatePicker";

// ==================== MOLECULES ====================
export { FormField } from "./molecules/FormField";
export type { FormFieldProps } from "./molecules/FormField";
export { SearchBar } from "./molecules/SearchBar";
export { Pagination } from "./molecules/Pagination";
export { EmptyState } from "./molecules/EmptyState";
export { ActionButtonGroup } from "./molecules/ActionButtonGroup";
export type {
    ActionButtonGroupProps,
    Action,
} from "./molecules/ActionButtonGroup";
export { ActionConfirmationModal } from "./molecules/ActionConfirmationModal";
export { DocumentJourney } from "./molecules/DocumentJourney";
export type { DocumentStage } from "./molecules/DocumentJourney";
export { Tabs, TabsList, TabsTrigger, TabsContent } from "./molecules/Tabs";
export { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./molecules/Dialog";
export { TableHeaderCell, TableRowCell } from "./molecules/TableCells";

// ==================== ORGANISMS ====================
export { SummaryCard, SummaryCards } from "./organisms/SummaryCards";
export type {
    SummaryCardProps,
    SummaryCardsProps,
} from "./organisms/SummaryCards";
export { DocumentTrace } from "./organisms/DocumentTrace";
export type {
    DocumentTraceProps,
    DocumentNode,
} from "./organisms/DocumentTrace";
export { DataTable } from "./organisms/DataTable";
export type { DataTableProps, Column } from "./organisms/DataTable";
export { SidebarNav } from "./organisms/SidebarNav";
export { GlobalCommandPalette } from "./organisms/GlobalCommandPalette";
export { SearchTrigger } from "./molecules/SearchTrigger";
export { InspectionManifest } from "./organisms/InspectionManifest";
export { default as GlobalSearch } from "./organisms/GlobalSearch";

// ==================== TEMPLATES ====================
export { ListPageTemplate } from "./templates/ListPageTemplate";
export type { ListPageTemplateProps } from "./templates/ListPageTemplate";
export { CreateEditFormTemplate } from "./templates/CreateEditFormTemplate";
export type {
    CreateEditFormTemplateProps,
    BreadcrumbItem as CreateEditBreadcrumbItem,
    FormSection,
} from "./templates/CreateEditFormTemplate";
export { DetailViewTemplate } from "./templates/DetailViewTemplate";
export type {
    DetailViewTemplateProps,
    BreadcrumbItem as DetailViewBreadcrumbItem,
    TabItem,
} from "./templates/DetailViewTemplate";
export { DocumentTemplate } from "./templates/DocumentTemplate";
export { ReportsPageTemplate } from "./templates/ReportsPageTemplate";
export type { ReportsPageTemplateProps } from "./templates/ReportsPageTemplate";

// ==================== DESIGN TOKENS ====================
export { default as designTokens } from "./spec.json";
