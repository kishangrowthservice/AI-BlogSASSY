"use client";

import React, { useState } from "react";
import Link from "next/link";
import { PublicNavbar } from "@/components/navigation/PublicNavbar";
import { PublicFooter } from "@/components/navigation/PublicFooter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Mail,
  MessageSquare,
  Clock,
  ShieldCheck,
  Building2,
  CheckCircle2,
  Send,
  Loader2,
  Sparkles,
} from "lucide-react";

export function ContactClient() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [domain, setDomain] = useState("");
  const [volume, setVolume] = useState("50-100");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulated contact submission
    await new Promise((r) => setTimeout(r, 900));
    setIsLoading(false);
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary/20">
      <PublicNavbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-16 sm:py-24 space-y-16">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <Badge variant="outline" className="font-mono text-xs px-3 py-1">
            WE ARE HERE TO HELP
          </Badge>
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-foreground">
            Get in Touch with Our{" "}
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Growth Specialists
            </span>
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg leading-relaxed">
            Have questions about custom volume allocations, enterprise SLA guarantees, or integrating our dual-LLM engine into your unique tech stack? Let&apos;s talk.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 max-w-6xl mx-auto">
          {/* Left Column: Contact Channels & SLAs */}
          <div className="lg:col-span-5 space-y-6">
            <Card className="border-border/70 bg-card/50 backdrop-blur-xl p-6 space-y-6">
              <div className="space-y-1.5">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  DIRECT CHANNELS
                </span>
                <h3 className="text-xl font-bold text-foreground">Executive Support</h3>
              </div>

              <div className="space-y-4 text-xs">
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
                    <Mail className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="font-semibold text-foreground">Email Support</div>
                    <div className="text-muted-foreground font-mono mt-0.5">support@growthservice.in</div>
                    <div className="text-[11px] text-muted-foreground mt-0.5">Direct ticket response within 2 hours.</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                    <Clock className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="font-semibold text-foreground">Operational Hours</div>
                    <div className="text-muted-foreground mt-0.5">Monday – Friday: 9am – 8pm UTC</div>
                    <div className="text-[11px] text-emerald-400 mt-0.5">24/7 Automated Infrastructure Monitoring</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
                    <Building2 className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="font-semibold text-foreground">Enterprise Inquiries</div>
                    <div className="text-muted-foreground mt-0.5">Dedicated Slack channels and custom volume SLAs.</div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-border/40">
                <Badge variant="outline" className="text-[11px] text-emerald-400 border-emerald-500/30 gap-1.5 py-1">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  Average Response Time: 48 Minutes
                </Badge>
              </div>
            </Card>

            <Card className="border-border/60 bg-muted/20 p-5 space-y-2 text-xs">
              <span className="font-bold text-foreground flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-indigo-400" />
                Data Privacy Guarantee
              </span>
              <p className="text-muted-foreground leading-relaxed text-[11px]">
                We strictly adhere to SOC-2 and GDPR standards. Your business knowledge and customer information are never shared or used to train third-party AI models.
              </p>
            </Card>
          </div>

          {/* Right Column: Inquiry Form */}
          <div className="lg:col-span-7">
            <Card className="border-border/80 bg-card/60 backdrop-blur-2xl shadow-xl p-6 sm:p-8">
              {submitted ? (
                <div className="py-12 text-center space-y-4">
                  <div className="h-12 w-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground">Message Received</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
                    Thank you for reaching out. A growth specialist will review your domain and publishing requirements and respond to <strong className="text-foreground">{email}</strong> within 2 hours.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSubmitted(false);
                      setMessage("");
                    }}
                    className="text-xs"
                  >
                    Send Another Message
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <h3 className="text-lg font-bold text-foreground">Send a Message</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Tell us about your publishing requirements and goals.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground">Full Name</label>
                      <Input
                        required
                        placeholder="Sarah Jenkins"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="bg-background/50 text-xs"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground">Work Email</label>
                      <Input
                        required
                        type="email"
                        placeholder="sarah@company.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="bg-background/50 text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground">Website Domain</label>
                      <Input
                        required
                        placeholder="yourcompany.com"
                        value={domain}
                        onChange={(e) => setDomain(e.target.value)}
                        className="bg-background/50 text-xs"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground">Monthly Article Volume</label>
                      <select
                        value={volume}
                        onChange={(e) => setVolume(e.target.value)}
                        className="flex h-9 w-full rounded-md border border-input bg-background/50 px-3 py-1 text-xs text-foreground shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      >
                        <option value="25-50">25 – 50 posts / month</option>
                        <option value="50-100">50 – 100 posts / month</option>
                        <option value="100-300">100 – 300 posts / month</option>
                        <option value="300+">300+ posts (Enterprise Portfolio)</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">How can our team help?</label>
                    <Textarea
                      required
                      rows={4}
                      placeholder="Share your current CMS, target keywords, or questions about custom volume and enterprise SLA guarantees..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="bg-background/50 text-xs resize-none"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full text-xs font-semibold gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white shadow-md"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        Transmitting Inquiry...
                      </>
                    ) : (
                      <>
                        <Send className="h-3.5 w-3.5" />
                        Send Inquiry
                      </>
                    )}
                  </Button>
                </form>
              )}
            </Card>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
