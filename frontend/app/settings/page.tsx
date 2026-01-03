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
import { api, API_BASE_URL, type Buyer } from "@/lib/api";
import { cn } from "@/lib/utils";
import { DocumentTemplate } from "@/components/design-system/templates/DocumentTemplate";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/design-system/molecules/Tabs";
import {
  Title2,
  Title3,
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
        await api.createBuyer({ ...buyerForm });
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
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/system/reset-db`, {
        method: "POST",
      });
      const data = await response.json();

      if (response.ok) {
        const clearedCount = data.tables_cleared?.length || 0;
        const preservedList = data.preserved?.join(", ") || "None";
        alert(
          `✅ ${data.message || "Database reset successfully."}\n\n` +
          `Business Entities Purged: ${clearedCount}\n` +
          `Configuration Preserved: ${preservedList}\n\n` +
          `Returning to dashboard.`
        );
        window.location.href = "/";
      } else {
        setError(data.detail || "System reset failed. Database might be locked by another process.");
      }
    } catch (err: any) {
      setError(`Network error: ${err.message || "Could not reach server"}`);
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
      <Button variant="secondary" onClick={loadData}>
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
                    <div className="bg-app-surface rounded-2xl border-none p-6 elevation-2 relative overflow-hidden group">
                      {/* Ambient Blobs */}
                      <Box className="absolute top-0 right-0 w-64 h-64 bg-app-accent/5 rounded-full -mr-20 -mt-20 blur-3xl group-hover:bg-app-accent/10 transition-all duration-700" />

                      <div className="relative z-10">
                        <Stack gap={10}>
                          <section>
                            <Flex align="center" justify="between" className="mb-8">
                              <Title3>Business Profile</Title3>
                              <Button
                                variant="primary"
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
                                className="font-medium px-4"
                              >
                                {saving ? (
                                  <Loader2 className="animate-spin" size={14} />
                                ) : (
                                  <Save size={14} />
                                )}
                                Confirm Profile
                              </Button>
                            </Flex>

                            <Grid cols={3} gap={4} className="items-end">
                              <FormGroup label="Business Name" className="col-span-2">
                                <Input
                                  value={settings.supplier_name || ""}
                                  onChange={(e) =>
                                    setSettings({
                                      ...settings,
                                      supplier_name: e.target.value,
                                    })
                                  }
                                  className="bg-app-surface-hover/30 h-9"
                                />
                              </FormGroup>
                              <FormGroup label="GSTIN">
                                <Input
                                  className="bg-app-surface-hover/30 h-9 font-mono uppercase"
                                  value={settings.supplier_gstin || ""}
                                  onChange={(e) =>
                                    setSettings({
                                      ...settings,
                                      supplier_gstin: e.target.value.toUpperCase(),
                                    })
                                  }
                                />
                              </FormGroup>
                              <Box className="col-span-3">
                                <FormGroup label="Registered Office Address">
                                  <Input
                                    value={settings.supplier_address || ""}
                                    onChange={(e) =>
                                      setSettings({
                                        ...settings,
                                        supplier_address: e.target.value,
                                      })
                                    }
                                    className="bg-app-surface-hover/30 h-9"
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
                                  className="bg-app-surface-hover/30 h-9"
                                />
                              </FormGroup>
                              <FormGroup label="Email ID" className="col-span-2">
                                <Input
                                  value={settings.supplier_email || ""}
                                  onChange={(e) =>
                                    setSettings({
                                      ...settings,
                                      supplier_email: e.target.value,
                                    })
                                  }
                                  className="bg-app-surface-hover/30 h-9"
                                />
                              </FormGroup>
                            </Grid>
                          </section>
                        </Stack>
                      </div>
                    </div>
                  </div>

                  <div className="lg:col-span-4 space-y-6">
                    <div className="rounded-3xl p-6 bg-surface-primary/60 dark:bg-surface-primary/20 backdrop-blur-xl border border-white/20 elevation-3 relative overflow-hidden group">
                      <motion.div
                        className="absolute top-0 right-0 p-4 opacity-5 group-hover:rotate-12 transition-transform duration-500"
                        whileHover={{ scale: 1.2 }}
                      >
                        <Building2 size={120} className="text-text-primary" />
                      </motion.div>
                      <Label className="text-text-tertiary mb-6 tracking-[0.2em]">
                        IDENTITY PREVIEW
                      </Label>
                      <Title2 className="mb-2 text-text-primary line-clamp-2">
                        {settings.supplier_name || "Enterprise Identity"}
                      </Title2>
                      <Accounting className="text-text-secondary text-sm mb-8 block">
                        {settings.supplier_gstin || "GSTIN NOT SET"}
                      </Accounting>

                      <Stack gap={4} className="pt-6 shadow-none">
                        <Flex align="start" gap={3}>
                          <MapPin size={14} className="mt-0.5 text-text-tertiary" />
                          <Body className="text-xs text-text-secondary leading-relaxed font-normal">
                            {settings.supplier_address || "Awaiting address..."}
                          </Body>
                        </Flex>
                        <Flex align="center" gap={3}>
                          <Phone size={14} className="text-text-tertiary" />
                          <Body className="text-xs text-text-secondary font-normal">
                            {settings.supplier_contact || "Awaiting contact..."}
                          </Body>
                        </Flex>
                        <Flex align="center" gap={3}>
                          <Mail size={14} className="text-text-tertiary" />
                          <Body className="text-xs text-text-secondary font-normal">
                            {settings.supplier_email || "Awaiting communication..."}
                          </Body>
                        </Flex>
                      </Stack>
                    </div>

                    <Card className="p-4 bg-surface-secondary border border-border-secondary">
                      <Flex align="center" gap={3}>
                        <ShieldAlert size={16} className="text-text-secondary" />
                        <SmallText className="font-medium text-text-primary">
                          Profile changes affect all future documentation.
                        </SmallText>
                      </Flex>
                    </Card>
                  </div>
                </Grid>
              </TabsContent>

              {/* --- Tab: Buyer --- */}
              <TabsContent value="buyer" className="mt-0">
                <Grid cols="1" className="lg:grid-cols-12" gap={6}>
                  <div className="lg:col-span-8">
                    <div className="bg-app-surface rounded-2xl border-none p-6 elevation-2 relative overflow-hidden group">
                      {/* Ambient Blobs */}
                      <Box className="absolute top-0 right-0 w-64 h-64 bg-app-accent/5 rounded-full -mr-20 -mt-20 blur-3xl group-hover:bg-app-accent/10 transition-all duration-700" />

                      <div className="relative z-10 w-full">
                        <Stack gap={8}>
                          <Flex align="center" justify="between" className="mb-4 w-full">
                            <Stack gap={1}>
                              <Title3>Buyer Identity</Title3>
                            </Stack>
                            <Button
                              variant="primary"
                              className="px-4 shadow-1"
                              onClick={() => {
                                handleCancelBuyerForm();
                                setIsAddingBuyer(true);
                              }}
                              disabled={isAddingBuyer || !!editingBuyerId}
                            >
                              <Plus size={16} /> Registered Entity
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
                                <Card className="p-8 border-none bg-app-group elevation-3">
                                  <Flex
                                    align="center"
                                    justify="between"
                                    className="mb-8 pb-4 shadow-none"
                                  >
                                    <Flex align="center" gap={2}>
                                      <div className="p-2 rounded-lg bg-app-accent/10 text-app-accent">
                                        {editingBuyerId ? <Edit2 size={16} /> : <Plus size={16} />}
                                      </div>
                                      <Title3 className="text-sm">
                                        {editingBuyerId ? "Modify Market Entity" : "New Market Entity"}
                                      </Title3>
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

                                  <Grid cols={1} className="md:grid-cols-2" gap={8}>
                                    <FormGroup label="Legal Entity Name">
                                      <Input
                                        placeholder="e.g. Bharat Electronics Ltd"
                                        value={buyerForm.name}
                                        onChange={(e) => setBuyerForm({ ...buyerForm, name: e.target.value })}
                                        className="bg-app-overlay/30"
                                      />
                                    </FormGroup>
                                    <FormGroup label="GSTIN">
                                      <Input
                                        placeholder="Valid 15-char GSTIN"
                                        className="font-mono uppercase bg-app-overlay/30"
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
                                        className="bg-app-overlay/30"
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
                                          className="bg-app-overlay/30"
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
                                          className="flex-1 bg-app-overlay/5 border-none"
                                        />
                                        <Input
                                          placeholder="29"
                                          className="w-16 font-mono text-center bg-app-overlay/5 border-none"
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
                                    <Button variant="secondary" onClick={handleCancelBuyerForm}>
                                      Cancel
                                    </Button>
                                    <Button
                                      variant="primary"
                                      onClick={handleSaveBuyer}
                                      disabled={saving}
                                      className="px-10 font-medium"
                                    >
                                      {saving ? (
                                        <Loader2 className="animate-spin" size={14} />
                                      ) : (
                                        <Check size={14} />
                                      )}
                                      Commit Record
                                    </Button>
                                  </Flex>
                                </Card>
                              </motion.div>
                            )}
                          </AnimatePresence>

                          <Grid cols={1} className="md:grid-cols-2 lg:grid-cols-2" gap={6}>
                            {buyers.map((buyer) => (
                              <SpotlightCard
                                key={buyer.id}
                                className="p-6 h-full flex flex-col group border-none elevation-1 hover:elevation-2 bg-app-surface relative overflow-hidden"
                              >
                                <Flex justify="between" align="start" className="mb-6 z-10">
                                  <Stack gap={1} className="flex-1 min-w-0">
                                    <Flex align="center" gap={2}>
                                      <Body className="font-normal text-lg text-text-primary truncate group-hover:text-blue-600 transition-colors">
                                        {buyer.name}
                                      </Body>
                                      {buyer.is_default && (
                                        <Badge variant="secondary" className="text-[10px] h-5 bg-text-tertiary/10 text-text-secondary font-medium px-2 rounded-full">
                                          Default
                                        </Badge>
                                      )}
                                    </Flex>
                                    <div className="font-mono text-xs text-text-tertiary uppercase tracking-wide">
                                      {buyer.gstin || "NO GSTIN"}
                                    </div>
                                  </Stack>
                                  <Flex gap={1} className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 rounded-full hover:bg-blue-50 text-text-tertiary hover:text-blue-600"
                                      onClick={() => handleStartEditBuyer(buyer)}
                                    >
                                      <Edit2 size={14} />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 rounded-full hover:bg-red-50 text-text-tertiary hover:text-red-500"
                                      onClick={() => handleDeleteBuyer(buyer.id)}
                                    >
                                      <Trash2 size={14} />
                                    </Button>
                                  </Flex>
                                </Flex>

                                <Stack gap={6} className="flex-1 z-10">
                                  <Flex
                                    align="start"
                                    gap={3}
                                    className="text-text-secondary min-h-[2.5rem]"
                                  >
                                    <MapPin
                                      size={16}
                                      className="mt-0.5 text-text-tertiary shrink-0"
                                    />
                                    <span className="text-sm leading-relaxed line-clamp-2">
                                      {buyer.billing_address || "No registered address"}
                                    </span>
                                  </Flex>

                                  <div className="grid grid-cols-2 gap-4 pt-4 mt-auto shadow-none">
                                    <Stack gap={1}>
                                      <div className="text-[10px] font-medium text-text-tertiary uppercase tracking-widest">
                                        REGIONAL ZONE
                                      </div>
                                      <div className="text-sm font-medium text-text-secondary">
                                        {buyer.state || "N/A"}
                                      </div>
                                    </Stack>
                                    <Stack gap={1}>
                                      <div className="text-[10px] font-medium text-text-tertiary uppercase tracking-widest">
                                        SUPPLY CODE
                                      </div>
                                      <div className="text-sm font-normal text-text-primary font-mono">
                                        {buyer.state_code || "00"}
                                      </div>
                                    </Stack>
                                  </div>
                                </Stack>
                              </SpotlightCard>
                            ))}
                          </Grid>
                        </Stack>
                      </div>
                    </div>
                  </div>

                  {/* Sidebar Preview Column */}
                  <div className="lg:col-span-4 space-y-6">
                    <div className="rounded-3xl p-6 bg-surface-primary/60 dark:bg-surface-primary/20 backdrop-blur-xl border border-white/20 elevation-3 relative overflow-hidden group">
                      <motion.div
                        className="absolute top-0 right-0 p-4 opacity-5 group-hover:rotate-12 transition-transform duration-500"
                        whileHover={{ scale: 1.2 }}
                      >
                        <Users size={120} className="text-text-primary" />
                      </motion.div>
                      <Label className="text-text-tertiary mb-6 tracking-[0.2em]">
                        REGISTRY PREVIEW
                      </Label>
                      <Title2 className="mb-2 text-text-primary line-clamp-2">
                        {buyers.length} Market Entities
                      </Title2>
                      <Accounting className="text-text-secondary text-sm mb-8 block">
                        {buyers.filter(b => b.is_default).length > 0 ? "Default entity assigned" : "No default entity"}
                      </Accounting>

                      <Stack gap={4} className="pt-6 shadow-none">
                        <Flex align="center" gap={3}>
                          <ShieldAlert size={14} className="text-text-tertiary" />
                          <Body className="text-xs text-text-secondary leading-relaxed font-normal">
                            Verify all GSTINs before mapping.
                          </Body>
                        </Flex>
                      </Stack>
                    </div>
                  </div>
                </Grid>
              </TabsContent>

              {/* --- Tab: System & Governance --- */}
              <TabsContent value="system" className="mt-0">
                <Grid cols="1" className="lg:grid-cols-12" gap={6}>
                  <div className="lg:col-span-8">
                    <div className="bg-app-surface rounded-3xl border-none p-8 elevation-2 relative overflow-hidden">
                      <Box className="absolute bottom-0 left-0 w-40 h-40 bg-app-status-error/5 rounded-full -ml-10 -mb-10 blur-2xl transition-all duration-700" />
                      <div className="relative z-10">
                        <Box className="mt-4">
                          <Label className="mb-4">Operational Invariants</Label>
                          <Flex
                            align="center"
                            gap={4}
                            className="p-5 bg-app-accent/5 rounded-2xl border-none elevation-1"
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

                      <Card className="p-8 border border-status-error/10 bg-surface-primary/10 elevation-1 backdrop-blur-sm">
                        <Stack gap={6}>
                          <Stack gap={2}>
                            <Title3 className="text-app-status-error">
                              Nuclear System Reset
                            </Title3>
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
                                  variant="primary"
                                  onClick={() => setShowResetConfirm(true)}
                                  className="w-full font-medium rounded-full uppercase"
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
                                  variant="primary"
                                  onClick={handleSystemReset}
                                  disabled={isResetting}
                                  className="flex-1 bg-status-error hover:bg-status-error/90 text-white"
                                >
                                  {isResetting && (
                                    <Loader2 className="animate-spin" size={12} />
                                  )}
                                  EXECUTE
                                </Button>
                                <Button
                                  variant="secondary"
                                  onClick={() => setShowResetConfirm(false)}
                                  className="flex-1"
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
  className,
  children,
}: {
  label: string;
  help?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("flex flex-col justify-center", className)}>
      <div className="flex items-center justify-between mb-1">
        <Label className="leading-none mb-1">
          {label}
        </Label>
        {help && (
          <SmallText className="text-app-fg-muted/40 italic text-[9px]">
            {help}
          </SmallText>
        )}
      </div>
      {children}
    </div>
  );
}


