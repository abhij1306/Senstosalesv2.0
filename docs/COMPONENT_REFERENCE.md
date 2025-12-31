# Component Reference

**Generated:** 2025-12-31 16:53:24  
**Auto-synced from JSDoc comments**

## Design System Components


### Atoms

#### `Badge`

Badge Atom - Atomic Design System v5.0

**File:** `components/design-system/atoms/Badge.tsx`

---

#### `Button`

Button Atom - Atomic Design System v5.0

**File:** `components/design-system/atoms/Button.tsx`

---

#### `Card`

Card Atom - Atomic Design System v1.0

**File:** `components/design-system/atoms/Card.tsx`

---

#### `Checkbox`

Checkbox Atom - Atomic Design System v1.0

**File:** `components/design-system/atoms/Checkbox.tsx`

---

#### `Flex`

**File:** `components/design-system/atoms/Layout.tsx`

---

#### `H1`

Typography Atoms - Enterprise UI Standardization (Google M3)

**File:** `components/design-system/atoms/Typography.tsx`

---

#### `Icon`

Icon Atom - Atomic Design System v1.0

**File:** `components/design-system/atoms/Icon.tsx`

---

#### `Input`

Input Atom - Atomic Design System v1.0

**File:** `components/design-system/atoms/Input.tsx`

---

#### `Skeleton`

**File:** `components/design-system/atoms/Skeleton.tsx`

---

#### `SpotlightCard`

**File:** `components/design-system/atoms/SpotlightCard.tsx`

---


### Molecules

#### `ActionButtonGroup`

**Props:**

- `actions`: `Action[]`
- `align`: `"left" |"center" |"right"`
- `className`: `string`

**File:** `components/design-system/molecules/ActionButtonGroup.tsx`

---

#### `DetailField`

**Props:**

- `label`: `string`
- `value`: `string | number | null | undefined`
- `icon`: `React.ReactNode`
- `className`: `string`

**File:** `components/design-system/molecules/DetailField.tsx`

---

#### `Dialog`

**Props:**

- `isOpen`: `boolean`
- `onClose`: `() => void`
- `title`: `string`
- `children`: `React.ReactNode`
- `footer`: `React.ReactNode`
- `className`: `string`
- `maxWidth`: `string`

**File:** `components/design-system/molecules/Dialog.tsx`

---

#### `DocumentJourney`

**Props:**

- `currentStage`: `DocumentStage`
- `stages`: `DocumentStage[]`
- `className`: `string`

**File:** `components/design-system/molecules/DocumentJourney.tsx`

---

#### `EmptyState`

**Props:**

- `icon`: `LucideIcon`
- `title`: `string`
- `description`: `string`
- `action`: `ReactNode`
- `className`: `string`

**File:** `components/design-system/molecules/EmptyState.tsx`

---

#### `FormField`

FormField Molecule - Atomic Design System v1.0

**File:** `components/design-system/molecules/FormField.tsx`

---

#### `NavigationCard`

**Props:**

- `title`: `string`
- `description`: `string`
- `icon`: `React.ReactNode`
- `active`: `boolean`
- `onClick`: `() => void`
- `className`: `string`

**File:** `components/design-system/molecules/NavigationCard.tsx`

---

#### `Pagination`

**Props:**

- `currentPage`: `number`
- `totalItems`: `number`
- `pageSize`: `number`
- `onPageChange`: `(page: number) => void`
- `onPageSizeChange`: `(size: number) => void`
- `pageSizeOptions`: `number[]`

**File:** `components/design-system/molecules/Pagination.tsx`

---

#### `PaginationControls`

**Props:**

- `currentPage`: `number`
- `totalPages`: `number`
- `onPageChange`: `(page: number) => void`
- `itemName`: `string`

**File:** `components/design-system/molecules/PaginationControls.tsx`

---

#### `SearchBar`

SearchBar Molecule - Atomic Design System v1.0

**Props:**

- `id`: `string`
- `name`: `string`
- `value`: `string`
- `onChange`: `(value: string) => void`
- `onSearch`: `() => void`
- `placeholder`: `string`
- `shortcut`: `string`
- `className`: `string`

**File:** `components/design-system/molecules/SearchBar.tsx`

---

#### `SearchTrigger`

**Props:**

- `className`: `string`

**File:** `components/design-system/molecules/SearchTrigger.tsx`

---

#### `StatBlock`

**Props:**

- `label`: `string`
- `value`: `string | number`
- `delta`: `{ value: string`
- `trend`: `"up" |"down" |"neutral"`

**File:** `components/design-system/molecules/StatBlock.tsx`

---

#### `StatusTag`

**Props:**

- `status`: `"active" |"pending" |"completed" |"error" |"inactive"`
- `label`: `string`
- `icon`: `keyof typeof LucideIcons`
- `className`: `string`

**File:** `components/design-system/molecules/StatusTag.tsx`

---

#### `TableHeaderCell`

**File:** `components/design-system/molecules/TableCells.tsx`

---

#### `TableHeaderCell`

**File:** `components/design-system/molecules/TableHeaderCell.tsx`

---

#### `Tabs`

**File:** `components/design-system/molecules/Tabs.tsx`

---

#### `TextField`

**Props:**

- `label`: `string`
- `value`: `string`
- `onChange`: `(value: string) => void`
- `placeholder`: `string`
- `required`: `boolean`
- `disabled`: `boolean`
- `type`: `"text" |"email" |"tel" |"date"`

**File:** `components/design-system/molecules/FormFields.tsx`

---

#### `WarningModal`

WarningModal Molecule - Atomic Design System v1.0

**Props:**

- `open`: `boolean`
- `title`: `string`
- `message`: `string`
- `onConfirm`: `() => void`
- `onCancel`: `() => void`
- `confirmLabel`: `string`
- `cancelLabel`: `string`
- `confirmVariant`: `"default" | "destructive"`

**File:** `components/design-system/molecules/WarningModal.tsx`

---

#### `useToast`

**File:** `components/design-system/molecules/Toast.tsx`

---


### Organisms

#### `AlertsPanel`

**File:** `components/design-system/organisms/AlertsPanel.tsx`

---

#### `CommandBar`

**File:** `components/design-system/organisms/CommandBar.tsx`

---

#### `DataTable`

**File:** `components/design-system/organisms/DataTable.tsx`

---

#### `DocumentActions`

**Props:**

- `mode`: `"view" | "edit"`
- `onEdit`: `() => void`
- `onSave`: `() => void`
- `onCancel`: `() => void`
- `onDelete`: `() => void`
- `onDownload`: `() => void`
- `onCreate`: `() => void`
- `isSaving`: `boolean`
- `isDeleting`: `boolean`
- `canDelete`: `boolean`
- `customActions`: `React.ReactNode`

**File:** `components/design-system/organisms/DocumentActions.tsx`

---

#### `DocumentTrace`

DocumentTrace Organism - Atomic Design System v1.0

**Props:**

- `documents`: `DocumentNode[]`
- `className`: `string`

**File:** `components/design-system/organisms/DocumentTrace.tsx`

---

#### `GlobalCommandPalette`

**File:** `components/design-system/organisms/GlobalCommandPalette.tsx`

---

#### `GlobalSearch`

**File:** `components/design-system/organisms/GlobalSearch.tsx`

---

#### `InspectionManifest`

**Props:**

- `items`: `any[]`
- `columns`: `Column<any>[]`

**File:** `components/design-system/organisms/InspectionManifest.tsx`

---

#### `PODetailCard`

**Props:**

- `header`: `any`
- `items`: `any[]`
- `srvs`: `any[]`
- `editMode`: `boolean`
- `expandedItems`: `Set<number>`
- `activeTab`: `string`
- `setActiveTab`: `(tab: string) => void`
- `toggleItem`: `(itemNo: number) => void`
- `addItem`: `() => void`
- `removeItem`: `(index: number) => void`
- `updateItem`: `(index: number, field: string, value: any) => void`
- `updateHeader`: `(field: string, value: any) => void`
- `addDelivery`: `(itemIdx: number) => void`
- `removeDelivery`: `(itemIdx: number, deliveryIdx: number) => void`
- `onUpdateItems`: `(newItems: any[]) => void`
- `onSRVClick`: `(srvNumber: string) => void`

**File:** `components/design-system/organisms/PODetailCard.tsx`

---

#### `PODetailInfo`

**Props:**

- `label`: `string`
- `value`: `any`
- `field`: `string`
- `readonly`: `boolean`
- `editMode`: `boolean`
- `updateHeader`: `(field: string, value: any) => void`

**File:** `components/design-system/organisms/PODetailInfo.tsx`

---

#### `PODetailItems`

**Props:**

- `items`: `any[]`
- `editMode`: `boolean`
- `expandedItems`: `Set<number>`
- `toggleItem`: `(itemNo: number) => void`
- `addItem`: `() => void`
- `removeItem`: `(index: number) => void`
- `updateItem`: `(index: number, field: string, value: any) => void`
- `addDelivery`: `(itemIdx: number) => void`
- `removeDelivery`: `(itemIdx: number, deliveryIdx: number) => void`
- `onUpdateItems`: `(newItems: any[]) => void`

**File:** `components/design-system/organisms/PODetailItems.tsx`

---

#### `PONoteCard`

**Props:**

- `template`: `PONote`
- `onEdit`: `(template: PONote) => void`
- `onDelete`: `(id: number) => void`

**File:** `components/design-system/organisms/PONoteCard.tsx`

---

#### `PONoteDeleteDialog`

**Props:**

- `isOpen`: `boolean`
- `onClose`: `() => void`
- `onConfirm`: `() => void`

**File:** `components/design-system/organisms/PONoteDeleteDialog.tsx`

---

#### `PONoteDialog`

**Props:**

- `isOpen`: `boolean`
- `onClose`: `() => void`
- `title`: `string`
- `formData`: `{ title: string`

**File:** `components/design-system/organisms/PONoteDialog.tsx`

---

#### `PONotePageActions`

**Props:**

- `onCreate`: `() => void`
- `disabled`: `boolean`

**File:** `components/design-system/organisms/PONotePageActions.tsx`

---

#### `PONotesSkeleton`

**File:** `components/design-system/organisms/PONotesSkeleton.tsx`

---

#### `ReportNavGrid`

**File:** `components/design-system/organisms/ReportNavGrid.tsx`

---

#### `ReportsCharts`

**Props:**

- `activeTab`: `string`
- `chartData`: `any[]`

**File:** `components/design-system/organisms/ReportsCharts.tsx`

---

#### `ReportsDataCard`

**Props:**

- `title`: `string`
- `subtitle`: `string`
- `children`: `React.ReactNode`
- `actions`: `React.ReactNode`
- `className`: `string`

**File:** `components/design-system/organisms/ReportsDataCard.tsx`

---

#### `ReportsToolbar`

ReportsToolbar Organism - Atomic Design System v1.0

**Props:**

- `startDate`: `string`
- `endDate`: `string`
- `onDateChange`: `(start: string, end: string) => void`
- `onExport`: `() => void`
- `loading`: `boolean`
- `className`: `string`

**File:** `components/design-system/organisms/ReportsToolbar.tsx`

---

#### `RevenueMomentum`

**Props:**

- `data`: `any[]`
- `loading`: `boolean`

**File:** `components/design-system/organisms/RevenueMomentum.tsx`

---

#### `SRVDetailCard`

**Props:**

- `header`: `any`
- `summary`: `any`

**File:** `components/design-system/organisms/SRVDetailCard.tsx`

---

#### `SidebarNav`

**File:** `components/design-system/organisms/SidebarNav.tsx`

---

#### `SimpleDataTable`

**Props:**

- `data`: `any[]`
- `columns`: `{ header: string`
- `accessor`: `string`
- `width`: `number`
- `align`: `"left" |"center" |"right"`
- `render`: `(row: any) => React.ReactNode`

**File:** `components/design-system/organisms/SimpleDataTable.tsx`

---

#### `StatusBadge`

**Props:**

- `status`: `string`
- `variant`: `"success" | "warning" | "error" | "neutral" | "info"`
- `className`: `string`

**File:** `components/design-system/organisms/StatusBadge.tsx`

---

#### `StatusCard`

**Props:**

- `title`: `string`
- `status`: `string`
- `variant`: `"default" | "success" | "warning" | "error"`
- `children`: `React.ReactNode`
- `className`: `string`
- `showBadge`: `boolean`

**File:** `components/design-system/organisms/StatusCard.tsx`

---

#### `SummaryCard`

SummaryCard Organism - Atomic Design System v1.0

**Props:**

- `title`: `string`
- `value`: `React.ReactNode`
- `icon`: `React.ReactNode`
- `trend`: `{
        value: string`
- `direction`: `"up" | "down" | "neutral"`

**File:** `components/design-system/organisms/SummaryCards.tsx`

---


### Templates

#### `CreateEditFormTemplate`

CreateEditFormTemplate - Atomic Design System v1.0

**Props:**

- `breadcrumbs`: `BreadcrumbItem[]`
- `title`: `string`
- `subtitle`: `string`
- `sections`: `FormSection[]`
- `primaryAction`: `Action`
- `secondaryActions`: `Action[]`
- `loading`: `boolean`
- `className`: `string`

**File:** `components/design-system/templates/CreateEditFormTemplate.tsx`

---

#### `DetailViewTemplate`

DetailViewTemplate - Atomic Design System v1.0

**Props:**

- `breadcrumbs`: `BreadcrumbItem[]`
- `title`: `string`
- `subtitle`: `string`
- `badge`: `React.ReactNode`
- `actions`: `Action[]`
- `summaryCards`: `SummaryCardProps[]`
- `documentTrace`: `DocumentNode[]`
- `tabs`: `TabItem[]`
- `defaultTab`: `string`
- `children`: `React.ReactNode`
- `className`: `string`

**File:** `components/design-system/templates/DetailViewTemplate.tsx`

---

#### `DocumentTemplate`

**Props:**

- `title`: `string`
- `description`: `React.ReactNode`
- `actions`: `React.ReactNode`
- `children`: `React.ReactNode`
- `className`: `string`
- `onBack`: `() => void`
- `layoutId`: `string`
- `icon`: `React.ReactNode`
- `iconLayoutId`: `string`

**File:** `components/design-system/templates/DocumentTemplate.tsx`

---

#### `ListPageTemplate`

ListPageTemplate - Atomic Design System v1.0

**File:** `components/design-system/templates/ListPageTemplate.tsx`

---

#### `ReportsPageTemplate`

ReportsPageTemplate - Atomic Design System v1.0

**File:** `components/design-system/templates/ReportsPageTemplate.tsx`

---

