"use client";

import React, { useState } from "react";
import {
  Sliders,
  Sparkles,
  Globe,
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Award,
  Users,
  Target,
  FileCode,
  Check,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import type { SafeSiteProfile } from "@/lib/sanitize";
import type { InternalLinkItem } from "@/lib/types";
import { updateTenantBrandAction } from "@/lib/serverActions";

interface BrandDnaTabProps {
  profile: SafeSiteProfile;
  onProfileUpdated: (updated: Partial<SafeSiteProfile>) => void;
}

const TONE_PRESETS = [
  {
    id: "authoritative",
    label: "Executive & Authoritative",
    desc: "Confident industry expert tone with strong assertions and research-backed perspective.",
  },
  {
    id: "conversational",
    label: "Conversational & Engaging",
    desc: "Approachable, empathetic, relatable, using direct second-person 'you' phrasing.",
  },
  {
    id: "technical",
    label: "Deep Technical & Analytical",
    desc: "Rigorous, structured, code and telemetry-aware with precision vocabulary.",
  },
  {
    id: "punchy",
    label: "Direct & Growth-Focused",
    desc: "High-energy, action-oriented, focused on ROI, metrics, and conversion outcomes.",
  },
];

export function BrandDnaTab({ profile, onProfileUpdated }: BrandDnaTabProps) {
  const [brandKnowledge, setBrandKnowledge] = useState(profile.brand_knowledge || "");
  const [tone, setTone] = useState(profile.tone || "Authoritative, engaging, industry expert");
  const [targetAudience, setTargetAudience] = useState(profile.target_audience || "Entrepreneurs, CTOs, growth marketers");
  const [internalLinks, setInternalLinks] = useState<InternalLinkItem[]>(profile.internal_links || []);

  const [newLinkUrl, setNewLinkUrl] = useState("");
  const [newLinkLabel, setNewLinkLabel] = useState("");
  const [newLinkCategory, setNewLinkCategory] = useState("General");

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Add Link
  const handleAddLink = () => {
    if (!newLinkUrl.trim() || !newLinkLabel.trim()) return;
    const cleanUrl = newLinkUrl.trim();
    const cleanLabel = newLinkLabel.trim();
    const cleanCategory = newLinkCategory.trim() || "General";

    setInternalLinks((prev) => [...prev, { url: cleanUrl, label: cleanLabel, category: cleanCategory }]);
    setNewLinkUrl("");
    setNewLinkLabel("");
  };

  const handleDeleteLink = (index: number) => {
    setInternalLinks((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSaveBrand = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    setSaveError(null);

    try {
      const res = await updateTenantBrandAction(profile.id, {
        brand_knowledge: brandKnowledge,
        tone: tone,
        target_audience: targetAudience,
        internal_links: internalLinks,
      });

      if (res.success) {
        onProfileUpdated({
          brand_knowledge: brandKnowledge,
          tone: tone,
          target_audience: targetAudience,
          internal_links: internalLinks,
        });
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3500);
      } else {
        setSaveError(res.error || "Failed to update brand DNA.");
      }
    } catch (err: any) {
      setSaveError(err?.message || "An unexpected error occurred while saving.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
            <Sliders className="h-6 w-6 text-purple-400" />
            Brand DNA &amp; Authority Engine
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Teach the AI engine your unique brand story, tone of voice, and canonical internal links to inject into every article.
          </p>
        </div>

        <Button
          onClick={handleSaveBrand}
          disabled={isSaving}
          className="text-xs font-semibold px-5 h-9 bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm shrink-0"
        >
          {isSaving ? "Saving Settings..." : "Save Brand Settings"}
        </Button>
      </div>

      {saveSuccess && (
        <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-4 text-emerald-300 flex items-center gap-2 text-xs shadow-sm">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>Brand DNA and canonical internal links updated successfully. Future posts will reflect these changes.</span>
        </div>
      )}

      {saveError && (
        <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-red-300 flex items-center gap-2 text-xs shadow-sm">
          <AlertTriangle className="h-4 w-4 text-red-400 shrink-0" />
          <span>{saveError}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Brand Knowledge & Persona (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="border-border/70 bg-card/60 backdrop-blur-xl shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Award className="h-4 w-4 text-indigo-400" />
                Company Overview &amp; Solutions
              </CardTitle>
              <CardDescription className="text-xs">
                Summarize what your business does, your product lines, and value propositions. The engine grounds its articles in this knowledge.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-1">
              <Textarea
                rows={5}
                value={brandKnowledge}
                onChange={(e) => setBrandKnowledge(e.target.value)}
                placeholder="Example: We provide AI-driven marketing automation for mid-market B2B software companies, helping them increase qualified pipeline by 35% through autonomous inbound content..."
                className="bg-background/60 text-xs leading-relaxed border-border/80 resize-y"
              />
              <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                <span>The more specific you are, the higher the authenticity of each post.</span>
                <span className="font-mono">{brandKnowledge.length} chars</span>
              </div>
            </CardContent>
          </Card>

          {/* Tone Presets Card */}
          <Card className="border-border/70 bg-card/60 backdrop-blur-xl shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Target className="h-4 w-4 text-purple-400" />
                Tone of Voice
              </CardTitle>
              <CardDescription className="text-xs">
                Select an editorial tone preset or customize how your brand speaks to readers.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {TONE_PRESETS.map((preset) => {
                  const isSelected = tone.toLowerCase().includes(preset.label.toLowerCase());
                  return (
                    <div
                      key={preset.id}
                      onClick={() => setTone(preset.label)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? "border-primary bg-primary/10 shadow-xs"
                          : "border-border/60 bg-background/50 hover:bg-muted/40 hover:border-border"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-xs text-foreground">{preset.label}</span>
                        {isSelected && <Check className="h-3.5 w-3.5 text-primary" />}
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-relaxed">
                        {preset.desc}
                      </p>
                    </div>
                  );
                })}
              </div>

              <div className="space-y-1.5 pt-2">
                <label className="text-xs font-semibold text-foreground">Custom Tone Specification</label>
                <Input
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  placeholder="e.g. Authoritative, direct, data-backed, no corporate jargon"
                  className="bg-background/80 text-xs"
                />
              </div>

              <div className="space-y-1.5 pt-2">
                <label className="text-xs font-semibold text-foreground">Target Audience &amp; Buyer Persona</label>
                <Input
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  placeholder="e.g. Founders, VP Marketing, Agency Directors"
                  className="bg-background/80 text-xs"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Canonical Internal Link Repository (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="border-border/70 bg-card/60 backdrop-blur-xl shadow-sm h-full flex flex-col justify-between">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Globe className="h-4 w-4 text-indigo-400" />
                  Canonical Internal Backlinks
                </CardTitle>
                <Badge variant="outline" className="font-mono text-[10px]">
                  {internalLinks.length} Links
                </Badge>
              </div>
              <CardDescription className="text-xs">
                Key product, service, and conversion URLs to weave organically into published articles for maximum Google page rank flow.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4 pt-1">
              {/* Existing Links List */}
              {internalLinks.length > 0 ? (
                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {internalLinks.map((link, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2.5 rounded-lg border border-border/60 bg-background/60 text-xs group"
                    >
                      <div className="truncate pr-2">
                        <div className="font-semibold text-foreground truncate">{link.label}</div>
                        <div className="font-mono text-[10px] text-muted-foreground truncate">{link.url}</div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {link.category && (
                          <Badge variant="secondary" className="text-[9px] py-0">
                            {link.category}
                          </Badge>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteLink(idx)}
                          className="h-6 w-6 text-muted-foreground hover:text-red-400"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center border border-dashed border-border/80 rounded-xl p-4 space-y-2 bg-muted/10">
                  <Globe className="h-8 w-8 text-muted-foreground/40 mx-auto" />
                  <div className="text-xs font-semibold text-foreground">No Internal Backlinks Added</div>
                  <p className="text-[11px] text-muted-foreground max-w-xs mx-auto">
                    Add links to your high-converting product pages, pricing, or case studies below.
                  </p>
                </div>
              )}

              {/* Add New Link Section */}
              <div className="p-3 rounded-xl border border-border/70 bg-background/50 space-y-2.5 pt-3">
                <span className="text-xs font-semibold text-foreground">Add New Internal Destination</span>
                <div className="space-y-2">
                  <Input
                    placeholder="Anchor Text (e.g. Enterprise SEO Services)"
                    value={newLinkLabel}
                    onChange={(e) => setNewLinkLabel(e.target.value)}
                    className="bg-background/80 text-xs h-8"
                  />
                  <Input
                    placeholder="URL (e.g. /services/enterprise-seo)"
                    value={newLinkUrl}
                    onChange={(e) => setNewLinkUrl(e.target.value)}
                    className="bg-background/80 text-xs h-8"
                  />
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Category (e.g. Services, Pricing)"
                      value={newLinkCategory}
                      onChange={(e) => setNewLinkCategory(e.target.value)}
                      className="bg-background/80 text-xs h-8"
                    />
                    <Button
                      size="sm"
                      onClick={handleAddLink}
                      className="h-8 text-xs font-semibold px-3 shrink-0"
                    >
                      <Plus className="h-3.5 w-3.5 mr-1" />
                      Add Link
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>

            <CardFooter className="border-t border-border/40 pt-4 text-[11px] text-muted-foreground leading-relaxed">
              <span>💡 When writing an article, our engine analyzes paragraph context and inserts 2–3 of these links naturally without awkward keyword stuffing.</span>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
