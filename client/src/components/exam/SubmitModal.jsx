import { AlertTriangle, X } from 'lucide-react';

/**
 * Confirmation modal before submitting.
 */
export default function SubmitModal({
  open,
  onCancel,
  onConfirm,
  answeredCount,
  totalCount,
  isSubmitting = false,
}) {
  if (!open) return null;
  const unanswered = totalCount - answeredCount;
  const hasUnanswered = unanswered > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm px-4">
      <div className="bg-white rounded-card shadow-elevated max-w-md w-full p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center ${
                hasUnanswered ? 'bg-tertiary-100 text-tertiary-600' : 'bg-secondary-100 text-secondary-600'
              }`}
            >
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-heading font-bold">Bạn có chắc muốn nộp bài?</h2>
          </div>
          <button
            onClick={onCancel}
            disabled={isSubmitting}
            className="text-slate-400 hover:text-slate-600 disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-6 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-600">Đã làm:</span>
            <strong className="text-secondary-600">{answeredCount} / {totalCount}</strong>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-600">Chưa làm:</span>
            <strong className={hasUnanswered ? 'text-tertiary-600' : 'text-slate-400'}>
              {unanswered}
            </strong>
          </div>

          {hasUnanswered && (
            <p className="mt-3 p-3 rounded-lg bg-tertiary-50 text-tertiary-700 text-sm">
              Bạn còn <strong>{unanswered}</strong> câu chưa trả lời. Các câu này sẽ được tính là sai.
            </p>
          )}
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="flex-1 px-4 py-2.5 rounded-lg border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 disabled:opacity-50"
          >
            Quay lại làm tiếp
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isSubmitting}
            className="flex-1 px-4 py-2.5 rounded-lg bg-tertiary-500 text-white font-medium hover:bg-tertiary-600 disabled:opacity-50"
          >
            {isSubmitting ? 'Đang nộp...' : 'Nộp bài ngay'}
          </button>
        </div>
      </div>
    </div>
  );
}
