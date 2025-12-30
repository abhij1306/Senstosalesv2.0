"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2,
  Users,
  Settings as SettingsIcon,
  Save,
  Loader2,
  Check,
  Plus,
  Trash2,
  ShieldAlert,
  MapPin,
  Phone,
  Mail,
  Edit2,
  X,
} from "lucide-react";
import { api, type Buyer } from "@/lib/api";
import { DocumentTemplate } from "@/components/design-system/templates/DocumentTemplate";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/design-system/molecules/Tabs";
import {
  H2,
  H3,
  Label,
  Body,
  SmallText,
  Accounting,
  Button,
  Input,
  Card,
  Badge,
  Stack,
  Grid,
  Flex,
  Box,
  SpotlightCard,
} from "@/components/design-system";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("supplier");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- States ---
  const [settings, setSettings] = useState<any>({});
  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [isAddingBuyer, setIsAddingBuyer] = useState(false);
  const [editingBuyerId, setEditingBuyerId] = useState<number | null>(null);

  // Buyer Form State
  const [buyerForm, setBuyerForm] = useState<Partial<Buyer>>({
    name: "",
    gstin: "",
    billing_address: "",
    place_of_supply: "",
    state: "",
    state_code: "",
  });

  // System Reset States
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  // --- Init ---
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [settingsData, buyersData] = await Promise.all([api.getSettings(), api.getBuyers()]);
      setSettings(settingsData);
      setBuyers(buyersData);
    } catch {
      setError("Failed to load settings data.");
    } finally {
      setLoading(false);
    }
  };

  // --- Handlers ---
  const handleSaveSettings = useCallback(async (keys: string[]) => {
    setSaving(true);
    setError(null);
    try {
      const batch = keys.map((key) => ({
        key,
        value: settings[key]?.toString() || "",
      }));
      await api.updateSettingsBatch(batch);
    } catch {
      setError("Failed to save settings.");
    } finally {
      setSaving(false);
    }
  }, [settings]);

  const handleStartEditBuyer = useCallback((buyer: Buyer) => {
    setEditingBuyerId(buyer.id);
    setBuyerForm(buyer);
    setIsAddingBuyer(false);
  }, []);

  const handleCancelBuyerForm = useCallback(() => {
    setEditingBuyerId(null);
    setIsAddingBuyer(false);
    setBuyerForm({
      name: "",
      gstin: "",
      billing_address: "",
      place_of_supply: "",
      state: "",
      state_code: "",
    });
  }, []);

  const handleSaveBuyer = async () => {
    if (!buyerForm.name || !buyerForm.gstin) return;
    setSaving(true);
    try {
      if (editingBuyerId) {
        await api.updateBuyer(editingBuyerId, { ...buyerForm });
      } else {
        await api.createBuyer({ ...buyerForm, is_active: true });
      }
      await loadData();
      handleCancelBuyerForm();
    } catch {
      setError("Failed to save buyer.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteBuyer = async (id: number) => {
    if (!confirm("Are you sure you want to delete this buyer?")) return;
    try {
      await api.deleteBuyer(id);
      await loadData();
    } catch {
      setError("Failed to delete buyer.");
    }
  };

  const handleSystemReset = async () => {
    setIsResetting(true);
    try {
      const response = await fetch(`${api.baseUrl}/api/system/reset-db`, {
        method: "POST",
      });
      if (response.ok) {
        window.location.href = "/";
      } else {
        setError("System reset failed.");
      }
    } catch {
      setError("Network error during reset.");
    } finally {
      setIsResetting(false);
      setShowResetConfirm(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 text-app-fg-muted">
        <Loader2 className="animate-spin mb-4" size={32} />
        <Body>Loading System Configuration...</Body>
      </div>
    );
  }

  const topActions = (
    <div className="flex gap-3">
      <Button variant="outline" size="sm" onClick={loadData}>
        {/* RefreshCw was removed, so use a text label or re-import if needed. Assuming text for now or verify if RefreshCw is imported. 
            Looking at line 12, it is NOT imported in the updated file view. 
            Wait, in the original file view (lines 1-60), RefreshCw WAS imported. but I removed it in previous step?
            In step 7237, I removed imports from lucide-react.
            So RefreshCw is missing.
            I should replace usages of RefreshCw with just text or re-import it. 
            Let's re-add the import for RefreshCw since it's used.
        */}
        Sync
      </Button>
    </div>
  );

  return (
    <DocumentTemplate
      title="SETTINGS"
      description="Enterprise orchestration and entity lifecycle management"
      actions={topActions}
      layoutId="settings-title"
      icon={<SettingsIcon size={20} className="text-app-accent" />}
      iconLayoutId="settings-icon"
    >
      <div className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-4 bg-transparent p-0 border-none w-full justify-start rounded-none gap-6">
            <TabsTrigger value="supplier">
              <Building2 size={14} className="mr-2" />
              Supplier Identity
            </TabsTrigger>
            <TabsTrigger value="buyer">
              <Users size={14} className="mr-2" />
              Market Entities
            </TabsTrigger>
            <TabsTrigger value="system">
              <SettingsIcon size={14} className="mr-2" />
              System Governance
            </TabsTrigger>
          </TabsList>

          {error && (
            <Card className="p-4 bg-app-status-error/10 text-app-status-error flex items-center gap-2 mb-4 shadow-sm border-none">
              <ShieldAlert size={16} />
              <SmallText className="font-semibold">{error}</SmallText>
            </Card>
          )}

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              {/* --- Tab: Supplier --- */}
              <TabsContent value="supplier" className="mt-0">
                <Grid cols="1" className="lg:grid-cols-12" gap={6}>
                  <div className="lg:col-span-8">
                    <div className="bg-app-surface rounded-3xl border border-app-border p-8 shadow-sm relative overflow-hidden group">
                      {/* Ambient Blobs */}
                      <Box className="absolute top-0 right-0 w-64 h-64 bg-app-accent/5 rounded-full -mr-20 -mt-20 blur-3xl group-hover:bg-app-accent/10 transition-all duration-700" />

                      <div className="relative z-10">
                        <Stack gap={10}>
                          <section>
                            <Flex align="center" justify="between" className="mb-8">
                              <H3>Business Profile</H3>
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() =>
                                  handleSaveSettings([
                                    "supplier_name",
                                    "supplier_address",
                                    "supplier_gstin",
                                    "supplier_contact",
                                    "supplier_email",
                                    "supplier_state",
                                    "supplier_state_code",
                                  ])
                                }
                                disabled={saving}
                              >
                                {saving ? (
                                  <Loader2 className="animate-spin mr-2" size={14} />
                                ) : (
                                  <Save className="mr-2" size={14} />
                                )}
                                Confirm Profile
                              </Button>
                            </Flex>

                            <Grid cols={2} gap={6}>
                              <FormGroup label="Business Name">
                                <Input
                                  value={settings.supplier_name || ""}
                                  onChange={(e) =>
                                    setSettings({
                                      ...settings,
                                      supplier_name: e.target.value,
                                    })
                                  }
                                  className="bg-app-surface-hover/30"
                                />
                              </FormGroup>
                              <FormGroup label="GSTIN">
                                <Input
                                  className="bg-app-surface-hover/30"
                                  value={settings.supplier_gstin || ""}
                                  onChange={(e) =>
                                    setSettings({
                                      ...settings,
                                      supplier_gstin: e.target.value.toUpperCase(),
                                    })
                                  }
                                />
                              </FormGroup>
                              <Box className="col-span-2">
                                <FormGroup label="Registered Office Address">
                                  <Input
                                    value={settings.supplier_address || ""}
                                    onChange={(e) =>
                                      setSettings({
                                        ...settings,
                                        supplier_address: e.target.value,
                                      })
                                    }
                                    className="bg-app-surface-hover/30"
                                  />
                                </FormGroup>
                              </Box>
                              <FormGroup label="Contact Phone">
                                <Input
                                  value={settings.supplier_contact || ""}
                                  onChange={(e) =>
                                    setSettings({
                                      ...settings,
                                      supplier_contact: e.target.value,
                                    })
                                  }
                                  className="bg-app-surface-hover/30"
                                />
                              </FormGroup>
                              <FormGroup label="Email ID">
                                <Input
                                  value={settings.supplier_email || ""}
                                  onChange={(e) =>
                                    setSettings({
                                      ...settings,
                                      supplier_email: e.target.value,
                                    })
                                  }
                                  className="bg-app-surface-hover/30"
                                />
                              </FormGroup>
                            </Grid>
                          </section>
                        </Stack>
                      </div>
                    </div>
                  </div>

                  <div className="lg:col-span-4 space-y-6">
                    <div className="rounded-3xl p-6 bg-app-accent text-white border-none shadow-premium relative overflow-hidden group">
                      <motion.div
                        className="absolute top-0 right-0 p-4 opacity-10 group-hover:rotate-12 transition-transform duration-500"
                        whileHover={{ scale: 1.2 }}
                      >
                        <Building2 size={120} />
                      </motion.div>
                      <Label className="text-white/60 mb-6 tracking-[0.2em]">
                        IDENTITY PREVIEW
                      </Label>
                      <H2 className="mb-2 text-white line-clamp-2">
                        {settings.supplier_name || "Enterprise Identity"}
                      </H2>
                      <Accounting className="text-white/80 text-sm mb-8 block">
                        {settings.supplier_gstin || "GSTIN NOT SET"}
                      </Accounting>

                      <Stack gap={4} className="pt-6 shadow-none">
                        <Flex align="start" gap={3}>
                          <MapPin size={14} className="mt-0.5 text-white/60" />
                          <Body className="text-xs text-white/80 leading-relaxed font-normal">
                            {settings.supplier_address || "Awaiting address..."}
                          </Body>
                        </Flex>
                        <Flex align="center" gap={3}>
                          <Phone size={14} className="text-white/60" />
                          <Body className="text-xs text-white/80 font-normal">
                            {settings.supplier_contact || "Awaiting contact..."}
                          </Body>
                        </Flex>
                        <Flex align="center" gap={3}>
                          <Mail size={14} className="text-white/60" />
                          <Body className="text-xs text-white/80 font-normal">
                            {settings.supplier_email || "Awaiting communication..."}
                          </Body>
                        </Flex>
                      </Stack>
                    </div>

                    <Card className="p-4 bg-app-surface-hover/30 border-none">
                      <Flex align="center" gap={3}>
                        <ShieldAlert size={16} className="text-app-accent" />
                        <SmallText className="font-medium text-app-fg-muted">
                          Profile changes affect all future documentation.
                        </SmallText>
                      </Flex>
                    </Card>
                  </div>
                </Grid>
              </TabsContent>

              {/* --- Tab: Buyer --- */}
              <TabsContent value="buyer" className="space-y-6 mt-0">
                <Flex align="center" justify="between" className="mb-4">
                  <Stack gap={1}>
                    <H3>Counterparty Registry</H3>
                    <SmallText>Management of external entities for transaction mapping.</SmallText>
                  </Stack>
                  <Button
                    onClick={() => {
                      handleCancelBuyerForm();
                      setIsAddingBuyer(true);
                    }}
                    disabled={isAddingBuyer || !!editingBuyerId}
                  >
                    <Plus size={16} className="mr-2" /> Registered Entity
                  </Button>
                </Flex>

                <AnimatePresence mode="wait">
                  {(isAddingBuyer || editingBuyerId) && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="mb-8"
                    >
                      <Card className="p-8 border-none bg-[var(--color-sys-bg-surface)] shadow-lg ring-1 ring-[var(--color-sys-brand-primary)]/10">
                        <Flex
                          align="center"
                          justify="between"
                          className="mb-8 pb-4 shadow-none"
                        >
                          <Flex align="center" gap={2}>
                            <div className="p-2 rounded-lg bg-app-accent/10 text-app-accent">
                              {editingBuyerId ? <Edit2 size={16} /> : <Plus size={16} />}
                            </div>
                            <H3 className="text-sm">
                              {editingBuyerId ? "Modify Market Entity" : "New Market Entity"}
                            </H3>
                          </Flex>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleCancelBuyerForm}
                            className="rounded-full"
                          >
                            <X size={16} />
                          </Button>
                        </Flex>

                        <Grid cols={1} className="md:grid-cols-2 lg:grid-cols-3" gap={8}>
                          <FormGroup label="Legal Entity Name">
                            <Input
                              placeholder="e.g. Bharat Electronics Ltd"
                              value={buyerForm.name}
                              onChange={(e) => setBuyerForm({ ...buyerForm, name: e.target.value })}
                              className="bg-[var(--color-sys-bg-tertiary)]/30"
                            />
                          </FormGroup>
                          <FormGroup label="GSTIN">
                            <Input
                              placeholder="Valid 15-char GSTIN"
                              className="font-mono uppercase bg-[var(--color-sys-bg-tertiary)]/30"
                              value={buyerForm.gstin}
                              onChange={(e) =>
                                setBuyerForm({
                                  ...buyerForm,
                                  gstin: e.target.value.toUpperCase(),
                                })
                              }
                            />
                          </FormGroup>
                          <FormGroup label="Operating Region">
                            <Input
                              placeholder="e.g. Bengaluru"
                              value={buyerForm.place_of_supply}
                              onChange={(e) =>
                                setBuyerForm({
                                  ...buyerForm,
                                  place_of_supply: e.target.value,
                                })
                              }
                              className="bg-[var(--color-sys-bg-tertiary)]/30"
                            />
                          </FormGroup>
                          <Box className="md:col-span-2">
                            <FormGroup label="Consignee Address">
                              <Input
                                placeholder="Complete registered billing address"
                                value={buyerForm.billing_address}
                                onChange={(e) =>
                                  setBuyerForm({
                                    ...buyerForm,
                                    billing_address: e.target.value,
                                  })
                                }
                                className="bg-[var(--color-sys-bg-tertiary)]/30"
                              />
                            </FormGroup>
                          </Box>
                          <FormGroup label="State / Jurisdiction">
                            <Flex gap={2}>
                              <Input
                                placeholder="Karnataka"
                                value={buyerForm.state}
                                onChange={(e) =>
                                  setBuyerForm({
                                    ...buyerForm,
                                    state: e.target.value,
                                  })
                                }
                                className="flex-1 bg-app-surface-hover/30"
                              />
                              <Input
                                placeholder="29"
                                className="w-16 font-mono text-center bg-app-surface-hover/30"
                                value={buyerForm.state_code}
                                onChange={(e) =>
                                  setBuyerForm({
                                    ...buyerForm,
                                    state_code: e.target.value,
                                  })
                                }
                              />
                            </Flex>
                          </FormGroup>
                        </Grid>

                        <Flex
                          justify="end"
                          gap={3}
                          className="mt-10 pt-6 shadow-none"
                        >
                          <Button variant="ghost" onClick={handleCancelBuyerForm}>
                            Cancel
                          </Button>
                          <Button onClick={handleSaveBuyer} disabled={saving} className="px-10">
                            {saving ? (
                              <Loader2 className="animate-spin mr-2" size={14} />
                            ) : (
                              <Check className="mr-2" size={14} />
                            )}
                            Commit Record
                          </Button>
                        </Flex>
                      </Card>
                    </motion.div>
                  )}
                </AnimatePresence>

                <Grid cols={1} className="md:grid-cols-2 lg:grid-cols-3" gap={6}>
                  {buyers.map((buyer) => (
                    <SpotlightCard
                      key={buyer.id}
                      className="p-6 h-full flex flex-col group border-none shadow-sm hover:shadow-md"
                    >
                      <Flex justify="between" align="start" className="mb-6">
                        <Stack gap={1} className="flex-1 min-w-0">
                          <Flex align="center" gap={2}>
                            <Body className="font-bold truncate group-hover:text-app-accent transition-colors">
                              {buyer.name}
                            </Body>
                            {buyer.is_default && (
                              <Badge variant="success" className="text-xs h-4">
                                Default
                              </Badge>
                            )}
                          </Flex>
                          <Accounting className="text-app-fg-muted uppercase">
                            {buyer.gstin}
                          </Accounting>
                        </Stack>
                        <Flex gap={1} className="shrink-0">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-full hover:bg-app-accent/10 text-app-fg-muted hover:text-app-accent"
                            onClick={() => handleStartEditBuyer(buyer)}
                          >
                            <Edit2 size={12} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-full hover:bg-app-status-error/10 text-app-fg-muted hover:text-app-status-error"
                            onClick={() => handleDeleteBuyer(buyer.id)}
                          >
                            <Trash2 size={12} />
                          </Button>
                        </Flex>
                      </Flex>

                      <Stack gap={4} className="flex-1">
                        <Flex
                          align="start"
                          gap={3}
                          className="text-app-fg-muted h-10"
                        >
                          <MapPin
                            size={14}
                            className="mt-0.5 text-app-fg-muted shrink-0"
                          />
                          <span className="line-clamp-2 leading-relaxed">
                            {buyer.billing_address}
                          </span>
                        </Flex>

                        <div className="grid grid-cols-2 gap-2 pt-4 shadow-none opacity-80">
                          <Stack gap={0.5}>
                            <Label className="mb-0 opacity-60">REGIONAL ZONE</Label>
                            <Body className="font-semibold">{buyer.state || "N/A"}</Body>
                          </Stack>
                          <Stack gap={0.5}>
                            <Label className="mb-0 opacity-60">SUPPLY CODE</Label>
                            <Accounting className="font-bold text-left">
                              {buyer.state_code || "00"}
                            </Accounting>
                          </Stack>
                        </div>
                      </Stack>

                      {!buyer.is_default && (
                        <button
                          onClick={() => api.setBuyerDefault(buyer.id).then(loadData)}
                          className="mt-6 uppercase text-app-fg-muted hover:text-app-accent transition-colors opacity-0 group-hover:opacity-100 self-end"
                        >
                          Set as Primary
                        </button>
                      )}
                    </SpotlightCard>
                  ))}
                </Grid>
              </TabsContent>

              {/* --- Tab: System & Governance --- */}
              <TabsContent value="system" className="mt-0">
                <Grid cols="1" className="lg:grid-cols-12" gap={6}>
                  <div className="lg:col-span-8">
                    <div className="bg-app-surface rounded-3xl border border-app-border p-8 shadow-sm relative overflow-hidden">
                      <Box className="absolute bottom-0 left-0 w-40 h-40 bg-[var(--color-sys-status-error)]/5 rounded-full -ml-10 -mb-10 blur-2xl transition-all duration-700" />
                      <div className="relative z-10">
                        <Box className="mt-4">
                          <Label className="mb-4">Operational Invariants</Label>
                          <Flex
                            align="center"
                            gap={4}
                            className="p-5 bg-app-accent/5 rounded-2xl border border-app-accent/10"
                          >
                            <div className="h-10 w-10 rounded-full bg-app-accent/10 flex items-center justify-center text-app-accent">
                              <ShieldAlert size={20} />
                            </div>
                            <Stack gap={0.5}>
                              <Body className="text-sm text-app-accent">
                                Mandatory SRV Ingestion
                              </Body>
                              <SmallText className="text-app-accent/70">
                                PO balances are strictly coupled with Stores Receipt Vouchers.
                              </SmallText>
                            </Stack>
                          </Flex>
                        </Box>
                      </div>
                    </div>
                  </div>

                  <div className="lg:col-span-4">
                    <Stack gap={4}>
                      <Flex
                        align="center"
                        gap={2}
                        className="px-1 text-app-status-error"
                      >
                        <ShieldAlert size={14} />
                        <Label className="text-app-status-error mb-0">
                          CRITICAL DESTRUCTION
                        </Label>
                      </Flex>

                      <Card className="p-8 border-none bg-app-status-error/5 ring-1 ring-app-status-error/10 backdrop-blur-sm">
                        <Stack gap={6}>
                          <Stack gap={2}>
                            <H3 className="text-app-status-error">
                              Nuclear System Reset
                            </H3>
                            <Body className="text-app-status-error/80 text-xs leading-relaxed">
                              Permanently purge all POs, Invoices, and DC history. Identity records
                              are preserved.
                            </Body>
                          </Stack>

                          <AnimatePresence mode="wait">
                            {!showResetConfirm ? (
                              <motion.div
                                key="reset-init"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                              >
                                <Button
                                  variant="default"
                                  onClick={() => setShowResetConfirm(true)}
                                  className="w-full bg-app-status-error hover:bg-app-status-error/90 text-white rounded-full uppercase"
                                >
                                  Initiate Purge
                                </Button>
                              </motion.div>
                            ) : (
                              <motion.div
                                key="reset-confirm"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="flex gap-2"
                              >
                                <Button
                                  onClick={handleSystemReset}
                                  disabled={isResetting}
                                  className="flex-1 bg-app-status-error hover:bg-app-status-error/90 text-white rounded-full"
                                >
                                  {isResetting && (
                                    <Loader2 className="animate-spin mr-2" size={12} />
                                  )}
                                  EXECUTE
                                </Button>
                                <Button
                                  variant="outline"
                                  onClick={() => setShowResetConfirm(false)}
                                  className="flex-1 rounded-full"
                                >
                                  ABORT
                                </Button>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </Stack>
                      </Card>
                    </Stack>
                  </div>
                </Grid>
              </TabsContent>
            </motion.div>
          </AnimatePresence>
        </Tabs>
      </div>
    </DocumentTemplate>
  );
}

// --- Subcomponents ---

// TabTrigger removed as we use TabsTrigger from DS directly

function FormGroup({
  label,
  help,
  children,
}: {
  label: string;
  help?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col justify-center min-h-[44px]">
      <div className="flex items-center justify-between mb-1.5">
        <Label className="font-bold text-app-fg-muted leading-none">
          {label}
        </Label>
        {help && (
          <SmallText className="text-app-fg-muted/50 opacity-50 italic">
            {help}
          </SmallText>
        )}
      </div>
      {children}
    </div>
  );
}


