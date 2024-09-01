import dayjs from 'dayjs';
import { Option } from '../interface';

export const currencyMap = new Map<string, { ratio: number; fixed: number }>()
  .set('EUR', { ratio: 1, fixed: 4 })
  .set('TWD', { ratio: 35.4, fixed: 2 });

export const metricsOptionList: Option[] = [
  {
    value: 'request',
    label: 'Request',
  },
  {
    value: 'impression',
    label: 'Impression',
  },
  {
    value: 'revenue',
    label: 'Revenue',
  },
  {
    value: 'ecpm',
    label: 'eCPM',
  },
  {
    value: 'rpm',
    label: 'RPM',
  }
]

export function getDateXAxis(date: string[], compare: string[] = []): string[] {
  const [start, end] = date;
  const xAxis = [];
  const length = dayjs(end).diff(dayjs(start), 'day');
  const compareLength = compare.length === 0 ? 0 : dayjs(compare[1]).diff(dayjs(compare[0]), 'day');
  const extend = compareLength > length ? compareLength - length : 0;

  for (let i = 0; i <= (length + extend); i++) {
    xAxis.push(dayjs(start).add(i, 'day').format('YYYY-MM-DD'));
  }
  return xAxis;
}

export function getDiff(target: number, compare: number = 0): number {
  if (compare === 0) return 0;
  return +(((target - compare) / compare * 100).toFixed(1));
}