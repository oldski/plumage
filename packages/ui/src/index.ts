// @plumage/ui public API. Styles: import "@plumage/ui/styles.css" after the token CSS.
export { cn } from "./lib/cn";
export { formatNumber, MINUS, type FormatOptions, type NumberFormat } from "./lib/format";
export {
  foldToOther,
  MAX_CATEGORICAL_SERIES,
  seriesColor,
  wholePercents,
  type FoldOptions,
} from "./lib/chart";
export {
  convertMass,
  formatMeasure,
  UNIT_SPACE,
  type FormattedMeasure,
  type MassUnit,
  type MeasureOptions,
  type MeasureUnit,
} from "./lib/measure";
export {
  PlumageProvider,
  useOptionalPlumage,
  usePlumage,
  usePortalContainer,
  type ModePreference,
  type PlumageContextValue,
  type PlumageProviderProps,
} from "./provider/plumage-provider";

export {
  Alert,
  AlertDescription,
  AlertTitle,
  alertVariants,
  type AlertProps,
} from "./components/alert/alert";
export { Badge, badgeVariants, type BadgeProps } from "./components/badge/badge";
export { Button, buttonVariants, type ButtonProps } from "./components/button/button";
export {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./components/card/card";
export { Checkbox, type CheckboxProps } from "./components/checkbox/checkbox";
export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
} from "./components/dialog/dialog";
export {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "./components/dropdown-menu/dropdown-menu";
export { Input, type InputProps } from "./components/input/input";
export { Label, type LabelProps } from "./components/label/label";
export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "./components/select/select";
export {
  Progress,
  progressIndicatorVariants,
  type ProgressProps,
} from "./components/progress/progress";
export {
  ProgressRing,
  progressRingVariants,
  type ProgressRingProps,
} from "./components/progress-ring/progress-ring";
export { Slider, type SliderProps } from "./components/slider/slider";
export { Separator, type SeparatorProps } from "./components/separator/separator";
export {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./components/sheet/sheet";
export { Skeleton } from "./components/skeleton/skeleton";
export { Switch, type SwitchProps } from "./components/switch/switch";
export {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "./components/table/table";
export { Tabs, TabsContent, TabsList, TabsTrigger, tabsListVariants } from "./components/tabs/tabs";
export { Textarea, type TextareaProps } from "./components/textarea/textarea";
export { Toaster, toast, type ToasterProps } from "./components/toast/toast";
export {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./components/tooltip/tooltip";

// Patterns: composed, product-agnostic building blocks.
export {
  AppShell,
  AppShellNav,
  AppShellNavItem,
  type AppShellNavItemProps,
  type AppShellProps,
} from "./patterns/app-shell/app-shell";
export {
  ChartContainer,
  ChartTooltipContent,
  useChartTokens,
  type ChartColor,
  type ChartConfig,
  type ChartContainerProps,
  type ChartSeries,
  type ChartTooltipContentProps,
} from "./patterns/chart/chart";
export {
  createDataTableColumnHelper,
  DataTable,
  dataTableFeatures,
  type DataTableColumn,
  type DataTableFeatures,
  type DataTableProps,
  type SortingState,
} from "./patterns/data-table/data-table";
export {
  Delta,
  deltaDirection,
  type DeltaDirection,
  type DeltaProps,
} from "./patterns/delta/delta";
export { EmptyState, type EmptyStateProps } from "./patterns/empty-state/empty-state";
export { FileDropzone, type FileDropzoneProps } from "./patterns/file-dropzone/file-dropzone";
export { Markdown, type MarkdownProps } from "./patterns/markdown/markdown";
export { Money, type MoneyProps } from "./patterns/money/money";
export { Measure, type MeasureProps } from "./patterns/measure/measure";
export { MacroBar, type MacroBarProps, type MacroBarSegment } from "./patterns/macro-bar/macro-bar";
export {
  CalendarHeatmap,
  type CalendarHeatmapProps,
} from "./patterns/calendar-heatmap/calendar-heatmap";
export { PageHeader, type PageHeaderProps } from "./patterns/page-header/page-header";
export {
  QuickAddBar,
  type QuickAddBarProps,
  type QuickAddSuggestion,
} from "./patterns/quick-add-bar/quick-add-bar";
export { StatCard, type StatCardProps } from "./patterns/stat-card/stat-card";
export { Timeline, TimelineItem, type TimelineItemProps } from "./patterns/timeline/timeline";
export {
  Popover,
  PopoverAnchor,
  PopoverContent,
  PopoverTrigger,
} from "./components/popover/popover";
export {
  NumberInput,
  stepNumberText,
  type NumberInputProps,
} from "./components/number-input/number-input";
export { Combobox, type ComboboxOption, type ComboboxProps } from "./components/combobox/combobox";
export {
  Calendar,
  DatePicker,
  fromIsoDate,
  toIsoDate,
  type CalendarProps,
  type DatePickerProps,
} from "./components/date-picker/date-picker";
