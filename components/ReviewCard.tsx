import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Star, User } from 'lucide-react';
import { NormalizedReview } from '@/types';
import { formatDate } from '@/lib/utils';

interface ReviewCardProps {
  review: NormalizedReview;
  onApproveChange: (reviewId: string, approved: boolean) => void;
}

export function ReviewCard({ review, onApproveChange }: ReviewCardProps) {
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarFallback className="bg-gray-100 text-gray-600">
              {review.authorName?.[0]?.toUpperCase() || 'G'}
            </AvatarFallback>
          </Avatar>
          <div>
            <h4 className="font-semibold text-gray-900">
              {review.authorName || 'Anonymous Guest'}
            </h4>
            <p className="text-sm text-gray-600">{formatDate(review.submittedAt)}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <span className="font-medium text-lg">
            {review.ratingOverall?.toFixed(1) || 'N/A'}
          </span>
          <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
        </div>
      </div>
      
      {review.text && (
        <p className="text-gray-700 mb-3 leading-relaxed">{review.text}</p>
      )}

      {review.categories && Object.keys(review.categories).length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {Object.entries(review.categories).map(([category, rating]) => (
            <Badge key={category} variant="secondary" className="text-xs">
              {category.replace('_', ' ')}: {rating}/10
            </Badge>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="text-xs text-gray-500 space-y-1">
          <div>Property: {review.listing.name}</div>
          <div>Channel: {review.channel || 'Unknown'}</div>
          <div>Type: {review.type.replace('-', ' ')}</div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Approve</span>
          <Switch
            checked={review.approved}
            onCheckedChange={(checked) => onApproveChange(review.id, checked)}
          />
        </div>
      </div>
    </Card>
  );
}
