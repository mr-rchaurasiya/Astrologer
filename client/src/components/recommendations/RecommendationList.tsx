import { FC } from 'react';
import { RecommendationItem } from '../../types/recommendation';
import { RecommendationCard } from './RecommendationCard';
import { Sparkles } from 'lucide-react';

interface RecommendationListProps {
  recommendations: RecommendationItem[];
  onDismiss?: (id: string) => void;
  title?: string;
}

export const RecommendationList: FC<RecommendationListProps> = ({
  recommendations,
  onDismiss,
  title = 'Suggested Jyotish Insights',
}) => {
  if (recommendations.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center space-x-2">
        <Sparkles className="w-4 h-4 text-amber-400" />
        <h3 className="text-sm font-medium text-neutral-300 tracking-wide uppercase">
          {title}
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {recommendations.map((rec) => (
          <RecommendationCard
            key={rec.id}
            recommendation={rec}
            onDismiss={onDismiss}
          />
        ))}
      </div>
    </div>
  );
};
