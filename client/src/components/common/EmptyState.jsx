import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

/**
 * Centered empty state card for "no data" screens.
 *
 * @param {Object} props
 * @param {React.ComponentType} [props.icon]
 * @param {string} props.title
 * @param {string} [props.description]
 * @param {React.ReactNode} [props.action]  CTA button or link
 */
export function EmptyState({ icon: Icon, title, description, action, className }) {
  return (
    <Card className={cn('text-center py-12 px-6 border-dashed', className)}>
      {Icon && (
        <div className="flex justify-center mb-3">
          <Icon className="w-12 h-12 text-slate-300" />
        </div>
      )}
      <h2 className="font-heading font-semibold text-lg mb-2">{title}</h2>
      {description && <p className="text-slate-500 mb-4">{description}</p>}
      {action && <div className="flex justify-center">{action}</div>}
    </Card>
  );
}
