import { FC } from 'react';
import { Card } from '../common/Card';
import { History, Sparkles, User, MessageSquare, FileText } from 'lucide-react';

interface ActivityItem {
  id?: string;
  event: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

interface ActivityTimelineProps {
  activities: ActivityItem[];
}

export const ActivityTimeline: FC<ActivityTimelineProps> = ({ activities }) => {
  const getEventIcon = (event: string) => {
    if (event.includes('chat') || event.includes('ai')) {
      return <MessageSquare className="w-4 h-4 text-cyan-400" />;
    }
    if (event.includes('profile')) {
      return <User className="w-4 h-4 text-amber-400" />;
    }
    if (event.includes('report')) {
      return <FileText className="w-4 h-4 text-purple-400" />;
    }
    return <Sparkles className="w-4 h-4 text-emerald-400" />;
  };

  const formatEventName = (event: string) => {
    return event
      .split('_')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  };

  return (
    <Card className="p-5 border-neutral-800 bg-neutral-900/60">
      <div className="flex items-center space-x-2 mb-4">
        <History className="w-4 h-4 text-amber-400" />
        <h3 className="text-base font-semibold text-neutral-100">Recent Platform Activity</h3>
      </div>

      {activities.length === 0 ? (
        <div className="text-center py-6 text-neutral-500 text-xs">
          No recent activity logged yet.
        </div>
      ) : (
        <div className="space-y-3">
          {activities.map((act, idx) => (
            <div
              key={act.id || idx}
              className="flex items-start space-x-3 p-2.5 rounded-lg bg-neutral-950/40 border border-neutral-800/60 text-xs"
            >
              <div className="p-1.5 rounded-md bg-neutral-900 border border-neutral-800 flex-shrink-0 mt-0.5">
                {getEventIcon(act.event)}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-neutral-200">
                    {formatEventName(act.event)}
                  </span>
                  <span className="text-[11px] text-neutral-500">
                    {new Date(act.timestamp).toLocaleDateString()} {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                {act.metadata && (
                  <p className="text-[11px] text-neutral-400 mt-0.5">
                    {JSON.stringify(act.metadata).slice(0, 80)}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};
