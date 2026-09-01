import { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { RecommendationItem } from '../../types/recommendation';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Sparkles, ArrowRight, X, Compass, Clock, BookOpen, FileText } from 'lucide-react';

interface RecommendationCardProps {
  recommendation: RecommendationItem;
  onDismiss?: (id: string) => void;
}

export const RecommendationCard: FC<RecommendationCardProps> = ({
  recommendation,
  onDismiss,
}) => {
  const navigate = useNavigate();

  const getIcon = () => {
    switch (recommendation.type) {
      case 'dasha_transition':
        return <Clock className="w-5 h-5 text-amber-400" />;
      case 'transit_alert':
        return <Compass className="w-5 h-5 text-cyan-400" />;
      case 'nakshatra_deepdive':
        return <BookOpen className="w-5 h-5 text-purple-400" />;
      case 'report_generation':
        return <FileText className="w-5 h-5 text-emerald-400" />;
      default:
        return <Sparkles className="w-5 h-5 text-amber-400" />;
    }
  };

  const handleAction = () => {
    navigate(recommendation.action.route, {
      state: recommendation.action.params,
    });
  };

  return (
    <Card className="relative group border border-amber-500/20 bg-gradient-to-br from-neutral-900/90 to-neutral-950/90 p-4 transition-all duration-300 hover:border-amber-500/40 hover:shadow-lg hover:shadow-amber-500/5">
      {onDismiss && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDismiss(recommendation.id);
          }}
          className="absolute top-3 right-3 text-neutral-500 hover:text-neutral-300 transition-colors"
          title="Dismiss recommendation"
          aria-label="Dismiss recommendation"
        >
          <X className="w-4 h-4" />
        </button>
      )}

      <div className="flex items-start space-x-3">
        <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 flex-shrink-0 mt-0.5">
          {getIcon()}
        </div>

        <div className="flex-1 pr-6">
          <div className="flex items-center space-x-2">
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                recommendation.priority === 'high'
                  ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                  : recommendation.priority === 'medium'
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  : 'bg-neutral-800 text-neutral-400 border border-neutral-700'
              }`}
            >
              {recommendation.priority.toUpperCase()}
            </span>
            <h4 className="text-sm font-semibold text-neutral-200">
              {recommendation.title}
            </h4>
          </div>

          <p className="text-xs text-neutral-400 mt-1.5 line-clamp-2 leading-relaxed">
            {recommendation.description}
          </p>

          <div className="mt-3 flex items-center justify-between">
            <span className="text-[11px] text-neutral-500 italic">
              {recommendation.reason}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleAction}
              className="text-xs px-2.5 py-1 border-amber-500/30 text-amber-300 hover:bg-amber-500/10 flex items-center space-x-1"
            >
              <span>{recommendation.action.label}</span>
              <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};
