import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

/**
 * Các mốc điểm TOEIC khuyến nghị, cách nhau 50 điểm:
 *   450 → 950 (cách 50), thêm 990 vì là điểm tối đa thực tế.
 * Tránh user nhập số lẻ không thực tế (vd 152, 672).
 */
export const TARGET_SCORE_OPTIONS = [
  450, 500, 550, 600, 650, 700, 750, 800, 850, 900, 950, 990,
];

/**
 * Dropdown chọn mục tiêu điểm TOEIC — dùng chung trong Profile, Register,
 * admin UserDialogs.
 *
 * @param {number} value           Mục tiêu hiện tại
 * @param {(n:number)=>void} onChange  Callback đổi giá trị (đã parse Number)
 * @param {string} [id]            HTML id cho SelectTrigger (label htmlFor)
 * @param {string} [placeholder]   Placeholder khi value rỗng
 * @param {string} [className]     Class thêm cho SelectTrigger
 */
export default function TargetScoreSelect({
  value,
  onChange,
  id = 'targetScore',
  placeholder = 'Chọn mục tiêu',
  className,
}) {
  return (
    <Select
      value={value != null ? String(value) : undefined}
      onValueChange={(v) => onChange(Number(v))}
    >
      <SelectTrigger id={id} className={className}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {TARGET_SCORE_OPTIONS.map((s) => (
          <SelectItem key={s} value={String(s)}>
            {s} điểm
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
