import { FC } from 'react';
import { Card } from '../common/Card';
import { Bot, FileText, UserCheck, Zap } from 'lucide-react';

interface UsageSummaryCardProps {
  chatUsage: { used: number; total: number };
  reportUsage: { used: number; total: number };
  profileUsage: { used: number; total: number };
  tier: string;
}

export const UsageSummaryCard: FC<UsageSummaryCardProps> = ({
  chatUsage,
  reportUsage,
  profileUsage,
  tier,
}) => {
  const getPercent = (used: number, total: number) => {
    if (total === Infinity || total <= 0) return 0;
    return Math.min(100, Math.round((used / total) * 100));
  };

  return (
    <Card className="p-5 border-neutral-800 bg-neutral-900/60">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-neutral-100 flex items-center space-x-2">
          <Zap className="w-4 h-4 text-amber-400" />
          <span>Subscription Resource Quotas</span>
        </h3>
        <span className="text-xs uppercase font-semibold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20">
          {tier} Plan
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Chat Consultations */}
        <div className="p-3.5 rounded-lg bg-neutral-950/60 border border-neutral-800/80">
          <div className="flex items-center justify-between text-xs text-neutral-400 mb-2">
            <span className="flex items-center space-x-1.5">
              <Bot className="w-3.5 h-3.5 text-cyan-400" />
              <span>AI Consultations</span>
            </span>
            <span className="font-mono text-neutral-300">
              {chatUsage.used} / {chatUsage.total === Infinity ? '∞' : chatUsage.total}
            </span>
          </div>
          <div className="w-full bg-neutral-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-cyan-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${getPercent(chatUsage.used, chatUsage.total)}%` }}
            />
          </div>
        </div>

        {/* PDF Reports */}
        <div className="p-3.5 rounded-lg bg-neutral-950/60 border border-neutral-800/80">
          <div className="flex items-center justify-between text-xs text-neutral-400 mb-2">
            <span className="flex items-center space-x-1.5">
              <FileText className="w-3.5 h-3.5 text-purple-400" />
              <span>PDF Reports</span>
            </span>
            <span className="font-mono text-neutral-300">
              {reportUsage.used} / {reportUsage.total === Infinity ? '∞' : reportUsage.total}
            </span>
          </div>
          <div className="w-full bg-neutral-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-purple-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${getPercent(reportUsage.used, reportUsage.total)}%` }}
            />
          </div>
        </div>

        {/* Birth Profiles */}
        <div className="p-3.5 rounded-lg bg-neutral-950/60 border border-neutral-800/80">
          <div className="flex items-center justify-between text-xs text-neutral-400 mb-2">
            <span className="flex items-center space-x-1.5">
              <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Birth Profiles</span>
            </span>
            <span className="font-mono text-neutral-300">
              {profileUsage.used} / {profileUsage.total === Infinity ? '∞' : profileUsage.total}
            </span>
          </div>
          <div className="w-full bg-neutral-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${getPercent(profileUsage.used, profileUsage.total)}%` }}
            />
          </div>
        </div>
      </div>
    </Card>
  );
};
