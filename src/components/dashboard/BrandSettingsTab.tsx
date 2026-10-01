"use client";

import React, { useState } from "react";
import {
  Sparkles,
  Save,
  Globe,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Layers,
  Link as LinkIcon,
  MessageSquare,
  Users,
  Building,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import type { SafeSiteProfile } from "@/lib/sanitize";
import { updateTenantBrandAction } from "@/lib/serverActions";

interface BrandSettingsTabProps {
  profile: SafeSiteProfile;
  onProfileUpdated?: (updated: Partial<SafeSiteProfile>) => void;
}

const TONE_PRESETS = [
  "Authoritative, actionable, high-conviction",
  "Conversational, relatable, practitioner-first",
  "Technical, deep-dive, engineering-focused",
  "Executive, strategic, data-informed",
  "Educational, step-by-step, beginner-friendly",
];

export function BrandSettingsTab({ profile, onProfileUpdated }: BrandSettingsTabProps) {
  const [brandKnowledge, setBrandKnowledge] = useState(profile.brand_knowledge || "");
  const [tone, setTone] = useState(profile.tone || "Authoritative, actionable, high-conviction");
  const [targetAudience, setTargetAudience] = useState(
    profile.target_audience || "business decision makers and professionals"
  );
  const [internalLinks, setInternalLinks] = useState<Array<{ url: string; label: string; category?: string }>>(
    profile.internal_links || []
  );

  // New link form state
  const [newUrl, setNewUrl] = useState("");
  const [newLabel, setNewLabel] = useState("");
  const [newCategory, setNewCategory] = useState("Core");

  // Save states
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleAddLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUrl.trim() || !newLabel.trim()) return;

    let formattedUrl = newUrl.trim();
    if (!formattedUrl.startsWith("http://") && !formattedUrl.startsWith("https://") && !formattedUrl.startsWith("/")) {
      formattedUrl = `/${formattedUrl}`;
    }

    const updated = [
      ...internalLinks,
      {
        url: formattedUrl,
        label: newLabel.trim(),
        category: newCategory.trim() || "General",
      },
    ];

    setInternalLinks(updated);
    setNewUrl("");
    setNewLabel("");
  };

  const handleRemoveLink = (index: number) => {
    setInternalLinks(internalLinks.filter((_, idx) => idx !== index));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus("idle");
    setErrorMessage(null);

    try {
      if (!brandKnowledge.trim()) {
        setSaveStatus("error");
        setErrorMessage("Brand knowledge cannot be empty. Give the AI context on your business.");
        setIsSaving(false);
        return;
      }

      const res = await updateTenantBrandAction(profile.id, {
        brand_knowledge: brandKnowledge.trim(),
        tone: tone.trim(),
        target_audience: targetAudience.trim(),
        internal_links: internalLinks,
      });

      if (res.success) {
        setSaveStatus("success");
        if (onProfileUpdated) {
          onProfileUpdated({
            brand_knowledge: brandKnowledge.trim(),
            tone: tone.trim(),
            target_audience: targetAudience.trim(),
            internal_links: internalLinks,
          });
        }
        setTimeout(() => setSaveStatus("idle"), 4000);
      } else {
        setSaveStatus("error");
        setErrorMessage(res.error || "Failed to update brand profile.");
      }
    } catch (err: any) {
      setSaveStatus("error");
      setErrorMessage(err?.message || "An unexpected error occurred.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-6">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-indigo-400" />
            Brand Voice &amp; SEO DNA
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Configure your brand knowledge, target audience, tone guidelines, and internal linking structure.
          </p>
        </div>

        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-5 h-9 gap-1.5 shadow-sm"
        >
          {isSaving ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Saving DNA...
            </>
          ) : (
            <>
              <Save className="h-3.5 w-3.5" />
              Save Changes
            </>
          )}
        </Button>
      </div>

      {/* Status Notifications */}
      {saveStatus === "success" && (
        <div className="flex items-center gap-2.5 text-xs text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 p-3.5 rounded-xl animate-in fade-in duration-200">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>Brand voice and SEO guidelines updated successfully! Future generated posts will reflect these settings.</span>
        </div>
      )}

      {saveStatus === "error" && (
        <div className="flex items-center gap-2.5 text-xs text-red-300 bg-red-500/10 border border-red-500/20 p-3.5 rounded-xl animate-in fade-in duration-200">
          <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />
          <span>{errorMessage || "Failed to update brand profile. Please try again."}</span>
        </div>
      )}

      {/* Website Overview Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-border/60 bg-card/50 backdrop-blur-xl p-4">
          <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <Building className="h-3.5 w-3.5 text-indigo-400" />
            Website Profile
          </div>
          <div className="text-base font-bold text-foreground mt-1 truncate">{profile.site_name}</div>
          <div className="text-xs font-mono text-muted-foreground mt-0.5 truncate">{profile.domain}</div>
        </Card>

        <Card className="border-border/60 bg-card/50 backdrop-blur-xl p-4">
          <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <LinkIcon className="h-3.5 w-3.5 text-emerald-400" />
            Internal Anchor Points
          </div>
          <div className="text-base font-bold text-foreground mt-1 font-mono">{internalLinks.length} Links Active</div>
          <div className="text-xs text-muted-foreground mt-0.5">Woven contextually into content</div>
        </Card>

        <Card className="border-border/60 bg-card/50 backdrop-blur-xl p-4">
          <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <Layers className="h-3.5 w-3.5 text-purple-400" />
            Tone &amp; Style Profile
          </div>
          <div className="text-base font-bold text-foreground mt-1 truncate">{tone.split(",")[0]}</div>
          <div className="text-xs text-muted-foreground mt-0.5 truncate">Audience: {targetAudience.slice(0, 30)}...</div>
        </Card>
      </div>

      {/* Card 1: Brand Knowledge Base */}
      <Card className="border-border/70 bg-card/60 backdrop-blur-xl shadow-lg">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-indigo-400" />
              </div>
              <div>
                <CardTitle className="text-base font-bold">Brand Knowledge Base &amp; Business Context</CardTitle>
                <CardDescription className="text-xs">
                  The AI references this knowledge base in every single prompt to ensure deep industry domain authority.
                </CardDescription>
              </div>
            </div>
            <Badge variant="outline" className="text-[10px] font-mono text-indigo-300 border-indigo-500/30">
              {brandKnowledge.length} chars
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea
            value={brandKnowledge}
            onChange={(e) => setBrandKnowledge(e.target.value)}
            rows={7}
            placeholder="Explain what your company does, your unique methodology, your core products or services, your founders' background, and key value propositions..."
            className="bg-background/70 border-border/70 text-xs sm:text-sm font-sans leading-relaxed resize-y"
          />
          <div className="text-[11px] text-muted-foreground flex items-center gap-1.5">
            <HelpCircle className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
            <span>
              Tip: Include specific terminology, proprietary frameworks, and core competitive advantages for best SEO results.
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Card 2: Tone & Audience */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Tone */}
        <Card className="border-border/70 bg-card/60 backdrop-blur-xl shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                <MessageSquare className="h-4 w-4 text-purple-400" />
              </div>
              <div>
                <CardTitle className="text-base font-bold">Editorial Tone &amp; Voice</CardTitle>
                <CardDescription className="text-xs">Select a preset or customize the exact writing style.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Tone Description</label>
              <Input
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                placeholder="e.g. Authoritative, actionable, direct..."
                className="bg-background/70 border-border/70 text-xs sm:text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Quick Tone Presets
              </label>
              <div className="flex flex-wrap gap-1.5">
                {TONE_PRESETS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setTone(preset)}
                    className={`text-[11px] px-2.5 py-1 rounded-md border transition-all text-left ${
                      tone === preset
                        ? "bg-purple-500/20 border-purple-500/50 text-purple-200 font-semibold"
                        : "bg-muted/30 border-border/60 text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                    }`}
                  >
                    {preset.split(",")[0]}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Audience */}
        <Card className="border-border/70 bg-card/60 backdrop-blur-xl shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <Users className="h-4 w-4 text-emerald-400" />
              </div>
              <div>
                <CardTitle className="text-base font-bold">Target Audience Profile</CardTitle>
                <CardDescription className="text-xs">Who is this content primarily speaking to?</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Target Reader Description</label>
              <Textarea
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                rows={4}
                placeholder="e.g. CMOs and VP of Growth looking for programmatic SEO strategies, tech founders, small business owners..."
                className="bg-background/70 border-border/70 text-xs sm:text-sm leading-relaxed"
              />
            </div>
            <p className="text-[11px] text-muted-foreground">
              The AI tailors examples, vocabulary, and pain-point framing according to this audience definition.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Card 3: Internal Links Architecture */}
      <Card className="border-border/70 bg-card/60 backdrop-blur-xl shadow-lg">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                <LinkIcon className="h-4 w-4 text-amber-400" />
              </div>
              <div>
                <CardTitle className="text-base font-bold">Internal Linking Architecture</CardTitle>
                <CardDescription className="text-xs">
                  The AI naturally inserts these internal links with organic anchor text to improve SEO rankings.
                </CardDescription>
              </div>
            </div>
            <Badge variant="outline" className="font-mono text-xs w-fit">
              {internalLinks.length} Registered
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Add Link Form */}
          <form onSubmit={handleAddLink} className="p-3.5 rounded-xl border border-border/60 bg-background/50 space-y-3">
            <div className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Plus className="h-3.5 w-3.5 text-indigo-400" />
              Add Internal Link Target
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
              <div className="sm:col-span-4">
                <Input
                  placeholder="URL (e.g. /pricing or https://...)"
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  className="bg-background/80 text-xs h-9 font-mono"
                />
              </div>
              <div className="sm:col-span-5">
                <Input
                  placeholder="Anchor text / topic (e.g. view our plans)"
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  className="bg-background/80 text-xs h-9"
                />
              </div>
              <div className="sm:col-span-2">
                <Input
                  placeholder="Category"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="bg-background/80 text-xs h-9"
                />
              </div>
              <div className="sm:col-span-1">
                <Button
                  type="submit"
                  size="sm"
                  disabled={!newUrl.trim() || !newLabel.trim()}
                  className="w-full h-9 bg-primary text-primary-foreground font-semibold text-xs"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </form>

          {/* Links List */}
          <div className="border border-border/60 rounded-xl overflow-hidden bg-background/30">
            {internalLinks.length === 0 ? (
              <div className="p-8 text-center text-xs text-muted-foreground space-y-1">
                <LinkIcon className="h-6 w-6 text-muted-foreground/40 mx-auto" />
                <p className="font-semibold text-foreground">No internal links configured yet</p>
                <p>Add links above (e.g. /services, /pricing, /contact) so the AI can connect articles to your conversion pages.</p>
              </div>
            ) : (
              <div className="divide-y divide-border/40 text-xs">
                <div className="grid grid-cols-12 gap-2 p-3 bg-muted/40 font-semibold text-muted-foreground uppercase tracking-wider text-[10px]">
                  <div className="col-span-4 sm:col-span-5">Target URL</div>
                  <div className="col-span-5 sm:col-span-4">Anchor Text / Meaning</div>
                  <div className="col-span-2 sm:col-span-2">Category</div>
                  <div className="col-span-1 text-right">Action</div>
                </div>

                {internalLinks.map((link, idx) => (
                  <div key={idx} className="grid grid-cols-12 gap-2 p-3 items-center hover:bg-muted/20 transition-colors">
                    <div className="col-span-4 sm:col-span-5 font-mono text-indigo-300 truncate" title={link.url}>
                      {link.url}
                    </div>
                    <div className="col-span-5 sm:col-span-4 text-foreground truncate font-medium" title={link.label}>
                      {link.label}
                    </div>
                    <div className="col-span-2 sm:col-span-2 truncate">
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                        {link.category || "General"}
                      </Badge>
                    </div>
                    <div className="col-span-1 text-right">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveLink(idx)}
                        className="h-7 w-7 p-0 text-muted-foreground hover:text-red-400 hover:bg-red-500/10"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>

        <CardFooter className="border-t border-border/40 pt-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
          <span className="text-[11px] text-muted-foreground">
            Changes to your brand DNA apply immediately to all subsequent API and dashboard blog generations.
          </span>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-5 h-9 gap-1.5 w-full sm:w-auto"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-3.5 w-3.5" />
                Save Changes
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
