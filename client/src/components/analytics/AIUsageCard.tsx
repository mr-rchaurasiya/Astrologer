import { FC } from 'react';
import { Card } from '../common/Card';
import { Bot, Cpu, DollarSign, Activity } from 'lucide-react';

interface AIUsageCardProps {
  stats: {
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    totalTokens: number;
    totalCostUsd: number;
    avgLatencyMs: number;
  };
}

export const AIUsageCard: FC<AIUsageCardProps> = ({ stats }) => {
  return (
    <Card className="p-5 border-neutral-800 bg-neutral-900/60">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-neutral-100 flex items-center space-x-2">
          <Bot className="w-4 h-4 text-cyan-400" />
          <span>AI Intelligence & Token Telemetry</span>
        </h3>
        <span className="text-xs font-mono text-neutral-400">
          Avg Latency: {stats.avgLatencyMs}ms
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 rounded-lg bg-neutral-950/60 border border-neutral-800/80">
          <div className="flex items-center space-x-2 text-xs text-neutral-400 mb-1">
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            <span>Total Queries</span>
          </div>
          <p className="text-xl font-bold font-mono text-neutral-100">
            {stats.totalRequests.toLocaleString()}
          </p>
        </div>

        <div className="p-3 rounded-lg bg-neutral-950/60 border border-neutral-800/80">
          <div className="flex items-center space-x-2 text-xs text-neutral-400 mb-1">
            <Cpu className="w-3.5 h-3.5 text-purple-400" />
            <span>Tokens Processed</span>
          </div>
          <p className="text-xl font-bold font-mono text-neutral-100">
            {stats.totalTokens.toLocaleString()}
          </p>
        </div>

        <div className="p-3 rounded-lg bg-neutral-950/60 border border-neutral-800/80">
          <div className="flex items-center space-x-2 text-xs text-neutral-400 mb-1">
            <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
            <span>Est. Cost (USD)</span>
          </div>
          <p className="text-xl font-bold font-mono text-emerald-400">
            ${stats.totalCostUsd.toFixed(4)}
          </p>
        </div>

        <div className="p-3 rounded-lg bg-neutral-950/60 border border-neutral-800/80">
          <div className="flex items-center space-x-2 text-xs text-neutral-400 mb-1">
            <Bot className="w-3.5 h-3.5 text-amber-400" />
            <span>Success Rate</span>
          </div>
          <p className="text-xl font-bold font-mono text-amber-300">
            {stats.totalRequests > 0
              ? `${Math.round((stats.successfulRequests / stats.totalRequests) * 100)}%`
              : '100%'}
          </p>
        </div>
      </div>
    </Card>
  );
};
