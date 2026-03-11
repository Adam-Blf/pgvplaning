'use client';

import { Calendar, Info, Timer, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface LeaveBalanceCardProps {
  title: string;
  total: number;
  used: number;
  remaining: number;
  icon: React.ElementType;
  color: string;
  description?: string;
}

export function LeaveBalanceCard({
  title,
  total,
  used,
  remaining,
  icon: Icon,
  color,
  description,
}: LeaveBalanceCardProps) {
  const percentage = total > 0 ? (used / total) * 100 : 0;

  return (
    <Card className="glass-elevated border-white/10 rounded-3xl overflow-hidden group hover:border-white/20 hover:scale-[1.02] hover:shadow-lg transition-all duration-200 animate-fade-up">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className={cn(
            "w-12 h-12 rounded-2xl flex items-center justify-center border transition-transform duration-500 group-hover:scale-110",
            color === "blue" ? "bg-blue-500/10 border-blue-500/20 text-blue-400" :
              color === "cyan" ? "bg-cyan-500/10 border-cyan-500/20 text-cyan-400" :
                "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
          )}>
            <Icon className="w-6 h-6" />
          </div>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="p-2 rounded-full hover:bg-white/5 text-[var(--text-muted)] transition-colors">
                  <Info className="w-4 h-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent className="bg-[var(--bg-surface)] border-white/10 text-xs">
                <p>{description || `Calculé selon votre contrat ${new Date().getFullYear()}`}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <div className="mt-4">
          <CardTitle className="text-lg font-bold text-white tracking-tight">{title}</CardTitle>
          <CardDescription className="text-[var(--text-tertiary)] flex items-center gap-1.5 mt-1">
            <Timer className="w-3.5 h-3.5" />
            Exercice {new Date().getFullYear()}
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="pt-4 space-y-6">
        <div className="flex items-baseline justify-between">
          <div className="flex flex-col">
            <span className="text-3xl font-black text-white tracking-tighter">
              {remaining}
              <span className="text-sm font-medium text-[var(--text-muted)] ml-1">jours</span>
            </span>
            <span className="text-[10px] uppercase font-bold tracking-widest text-[var(--text-muted)] mt-1">
              Restants
            </span>
          </div>

          <div className="text-right">
            <div className="flex items-center gap-1 text-xs font-bold text-[var(--text-secondary)]">
              <span>{used}</span>
              <span className="text-[var(--text-muted)]">/</span>
              <span>{total}</span>
            </div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-[var(--text-muted)] mt-1 block">
              Utilisés
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <Progress
            value={percentage}
            className={cn(
              "h-2 bg-white/5 [&>div]:transition-all [&>div]:duration-700 [&>div]:ease-out",
              color === "blue" ? "[&>div]:bg-blue-500" :
                color === "cyan" ? "[&>div]:bg-cyan-500" :
                  "[&>div]:bg-emerald-500"
            )}
          />
          <div className="flex justify-between text-[10px] font-bold uppercase tracking-tighter text-[var(--text-muted)]">
            <span>{Math.round(percentage)}% consommés</span>
            <span className={cn(
              "flex items-center gap-1",
              percentage > 80 ? "text-rose-400" : "text-emerald-400"
            )}>
              <TrendingUp className="w-3 h-3" />
              Tendance {percentage > 50 ? 'haute' : 'normale'}
            </span>
          </div>
        </div>
      </CardContent>

      {/* Decorative background element */}
      <div className={cn(
        "absolute -bottom-6 -right-6 w-24 h-24 blur-3xl opacity-10 rounded-full",
        color === "blue" ? "bg-blue-500" :
          color === "cyan" ? "bg-cyan-500" :
            "bg-emerald-500"
      )} />
    </Card>
  );
}
