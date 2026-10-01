"use client";

import React, { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Zap, TrendingUp, BarChart3, Bot, Sparkles } from "lucide-react";
import type { SafeSiteProfile } from "@/lib/sanitize";
import type { GenerationLog } from "@/lib/types";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";

export function UsageGraphsTab({ profile, logs }: { profile: SafeSiteProfile, logs: GenerationLog[] }) {
  const quotaPercent = Math.min(100, Math.round(((profile.used_quota || 0) / (profile.monthly_quota || 1)) * 100));

  // Compute real metrics from logs separated by model provider
  const { usageData, avgLatency, groqTotal, geminiTotal } = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Create bucket for last 7 days
    const dailyMap = new Map<string, { name: string, groqRequests: number, geminiRequests: number }>();
    
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      dailyMap.set(key, {
        name: d.toLocaleDateString("en-US", { weekday: "short" }),
        groqRequests: 0,
        geminiRequests: 0
      });
    }

    let totalLatency = 0;
    let successfulRequests = 0;
    let groqTotal = 0;
    let geminiTotal = 0;

    // Process all logs
    logs.forEach(log => {
      if (!log.created_at || log.status !== "success") return;
      
      const logDate = new Date(log.created_at);
      const key = logDate.toISOString().split('T')[0];
      
      if (dailyMap.has(key)) {
        const entry = dailyMap.get(key)!;
        
        if (log.provider_used === "groq") {
          entry.groqRequests += 1;
          groqTotal += 1;
        } else if (log.provider_used === "gemini") {
          entry.geminiRequests += 1;
          geminiTotal += 1;
        }

        if (log.latency_ms) {
          totalLatency += log.latency_ms;
          successfulRequests += 1;
        }
      }
    });

    const averageLat = successfulRequests > 0 
      ? (totalLatency / successfulRequests / 1000).toFixed(2)
      : "0.00";

    return {
      usageData: Array.from(dailyMap.values()),
      avgLatency: averageLat,
      groqTotal,
      geminiTotal
    };
  }, [logs]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300 max-w-6xl mx-auto">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <Activity className="h-6 w-6 text-emerald-400" />
          Usage & Metrics
        </h1>
        <p className="text-sm text-muted-foreground">
          Monitor your API consumption, latency, and model-specific usage.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-card/40 border-border/60 backdrop-blur-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Monthly Quota Used
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div>
                <span className="text-3xl font-extrabold text-foreground">{profile.used_quota}</span>
                <span className="text-sm text-muted-foreground ml-1">/ {profile.monthly_quota} reqs</span>
              </div>
              <Zap className="h-5 w-5 text-amber-400 mb-1" />
            </div>
            <div className="mt-4 h-1.5 w-full bg-muted overflow-hidden rounded-full">
              <div 
                className="h-full bg-amber-400 rounded-full" 
                style={{ width: `${quotaPercent}%` }}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/40 border-border/60 backdrop-blur-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Avg API Latency
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div>
                <span className="text-3xl font-extrabold text-foreground">{avgLatency}</span>
                <span className="text-sm text-muted-foreground ml-1">seconds</span>
              </div>
              <TrendingUp className="h-5 w-5 text-indigo-400 mb-1" />
            </div>
            <p className="text-xs text-muted-foreground mt-4">Across all models (last 7 days)</p>
          </CardContent>
        </Card>

        <Card className="bg-card/40 border-border/60 backdrop-blur-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Current Rate Limit
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div>
                <span className="text-3xl font-extrabold text-foreground">5</span>
                <span className="text-sm text-muted-foreground ml-1">reqs / min</span>
              </div>
              <BarChart3 className="h-5 w-5 text-emerald-400 mb-1" />
            </div>
            <p className="text-xs text-muted-foreground mt-4">Global burst protection engaged</p>
          </CardContent>
        </Card>
      </div>

      {/* Model Specific Graphs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Groq Graph */}
        <Card className="border-border/60 bg-card/40 backdrop-blur-xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="h-5 w-5 text-orange-500" />
                  Groq Usage (Llama 3)
                </CardTitle>
                <CardDescription>Fast inference model</CardDescription>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold text-foreground">{groqTotal}</span>
                <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Total Requests</div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={usageData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorGroq" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f111a', borderColor: '#334155', color: '#f8fafc' }}
                    itemStyle={{ color: '#f97316' }}
                    labelStyle={{ color: '#94a3b8' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="groqRequests" 
                    name="Requests"
                    stroke="#f97316" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorGroq)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Gemini Graph */}
        <Card className="border-border/60 bg-card/40 backdrop-blur-xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-blue-400" />
                  Gemini Usage (Flash)
                </CardTitle>
                <CardDescription>Primary reasoning model</CardDescription>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold text-foreground">{geminiTotal}</span>
                <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Total Requests</div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={usageData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorGemini" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#60a5fa" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f111a', borderColor: '#334155', color: '#f8fafc' }}
                    itemStyle={{ color: '#60a5fa' }}
                    labelStyle={{ color: '#94a3b8' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="geminiRequests" 
                    name="Requests"
                    stroke="#60a5fa" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorGemini)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
