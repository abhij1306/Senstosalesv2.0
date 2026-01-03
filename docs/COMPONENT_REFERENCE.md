# Component Reference

**Generated:** 2026-01-03 03:36:43  
**Auto-synced from JSDoc comments**

## Design System Components


### Atoms

#### `Badge`

Badge Atom - MacOS Tahoe Edition

**File:** `components/design-system/atoms/Badge.tsx`

---

#### `Button`

Button Atom - MacOS Tahoe Edition

**File:** `components/design-system/atoms/Button.tsx`

---

#### `Card`

Card Atom - MacOS Tahoe Edition

**File:** `components/design-system/atoms/Card.tsx`

---

#### `Checkbox`

Checkbox Atom - macOS Tahoe 4.0

**File:** `components/design-system/atoms/Checkbox.tsx`

---

#### `DownloadButton`

**Props:**

- `url`: `string`
- `filename`: `string`
- `label`: `string`
- `variant`: `"primary" | "secondary" | "outline" | "ghost" | "link"`
- `size`: `"default" | "sm" | "lg" | "icon"`
- `className`: `string`

**File:** `components/design-system/atoms/DownloadButton.tsx`

---

#### `Flex`

**File:** `components/design-system/atoms/Layout.tsx`

---

#### `Icon`

Icon Atom - macOS Tahoe 4.0

**File:** `components/design-system/atoms/Icon.tsx`

---

#### `Input`

Input Atom - macOS Tahoe 4.0

**File:** `components/design-system/atoms/Input.tsx`

---

#### `LargeTitle`

LargeTitle - Hero sections, main navigation (34px, Bold)

**File:** `components/design-system/atoms/Typography.tsx`

---

#### `SpotlightCard`

**File:** `components/design-system/atoms/SpotlightCard.tsx`

---

#### `StatusBadge`

StatusBadge Atom - macOS Tahoe 4.0

**File:** `components/design-system/atoms/StatusBadge.tsx`

---


### Molecules

#### `ActionButtonGroup`

**Props:**

- `actions`: `Action[]`
- `align`: `"left" | "center" | "right"`
- `className`: `string`

**File:** `components/design-system/molecules/ActionButtonGroup.tsx`

---

#### `ActionConfirmationModal`

**Props:**

- `isOpen`: `boolean`
- `onClose`: `() => void`
- `onConfirm`: `() => void`
- `title`: `string`
- `subtitle`: `string`
- `warningText`: `string`
- `confirmLabel`: `string`
- `cancelLabel`: `string`
- `variant`: `"warning" | "error"`

**File:** `components/design-system/molecules/ActionConfirmationModal.tsx`

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

FormField Molecule - macOS Tahoe 4.0

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

SearchBar Molecule - macOS Tahoe 4.0

**Props:**

- `id`: `string`
- `name`: `string`
- `value`: `string`
- `onChange`: `(value: string) => void`
- `onSearch`: `() => void`
- `placeholder`: `string`
- `shortcut`: `string`
- `className`: `string`
- `variant`: `"default" | "neumorphic"`

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
- `delta`: `{
        value: string`
- `trend`: `"up" | "down" | "neutral"`

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

TableHeaderCell Molecule - macOS Tahoe 4.0

**File:** `components/design-system/molecules/TableHeaderCell.tsx`

---

#### `Tabs`

**File:** `components/design-system/molecules/Tabs.tsx`

---

#### `TextField`

Shared Form Components

**Props:**

- `label`: `string`
- `value`: `string`
- `onChange`: `(value: string) => void`
- `placeholder`: `string`
- `required`: `boolean`
- `disabled`: `boolean`
- `type`: `"text" | "email" | "tel" | "date"`

**File:** `components/design-system/molecules/FormFields.tsx`

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

DocumentTrace Organism - macOS Tahoe 4.0

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

#### `SidebarNav`

**File:** `components/design-system/organisms/SidebarNav.tsx`

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

SummaryCard Organism - macOS Tahoe 4.0

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

CreateEditFormTemplate - macOS Tahoe 4.0

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

DetailViewTemplate - macOS Tahoe 4.0

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

ListPageTemplate - macOS Tahoe 4.0

**File:** `components/design-system/templates/ListPageTemplate.tsx`

---

#### `ReportsPageTemplate`

ReportsPageTemplate - macOS Tahoe 4.0

**File:** `components/design-system/templates/ReportsPageTemplate.tsx`

---

