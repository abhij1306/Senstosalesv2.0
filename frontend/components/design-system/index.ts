/**
 * Atomic Design System v1.0 - Component Exports
 * Centralized export file for all design system components
 */

// ==================== ATOMS ====================
export { Button, buttonVariants } from "./atoms/Button";
export type { ButtonProps } from "./atoms/Button";
export { Input } from "./atoms/Input";
export type { InputProps } from "./atoms/Input";
export {
    H1,
    H2,
    H3,
    H4,
    LargeTitle,
    Title1,
    Title2,
    Title3,
    Headline,
    Body,
    Callout,
    Subhead,
    Footnote,
    Caption1,
    Caption2,
    Monospaced,
    Label,
    SmallText,
    MonoCode,
    Mono,
    Accounting,
    TableText,
} from "./atoms/Typography";
export { Card } from "./atoms/Card";
export type { CardProps } from "./atoms/Card";
export { Badge, badgeVariants } from "./atoms/Badge";
export type { BadgeProps } from "./atoms/Badge";
export { StatusBadge, statusBadgeVariants } from "./atoms/StatusBadge";
export type { StatusBadgeProps } from "./atoms/StatusBadge";
export * from "./atoms/DownloadButton";
export { Checkbox } from "./atoms/Checkbox";
export type { CheckboxProps } from "./atoms/Checkbox";
export { Icon } from "./atoms/Icon";
export type { IconProps } from "./atoms/Icon";
export { Flex, Stack, Grid, Box } from "./atoms/Layout";
export { SpotlightCard } from "./atoms/SpotlightCard";

// ==================== MOLECULES ====================
export { FormField } from "./molecules/FormField";
export type { FormFieldProps } from "./molecules/FormField";
export { SearchBar } from "./molecules/SearchBar";
export type { SearchBarProps } from "./molecules/SearchBar";
export { ActionButtonGroup } from "./molecules/ActionButtonGroup";
export type {
    ActionButtonGroupProps,
    Action,
} from "./molecules/ActionButtonGroup";
export { WarningModal } from "./molecules/WarningModal";
export type { WarningModalProps } from "./molecules/WarningModal";
export { DocumentJourney } from "./molecules/DocumentJourney";
export type { DocumentStage } from "./molecules/DocumentJourney";

export { Tabs, TabsList, TabsTrigger, TabsContent } from "./molecules/Tabs";
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
export { EmptyState } from "./molecules/EmptyState";
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
