export interface RawData {
  date: string;
  unit_id: string;
  request: number;
  impression: number;
  revenue: number;
}

export interface Data {
  [key: string]: number | string;
}

export interface Pagination {
  pageIndex: number;
  pageSize: number;
}

export interface Sorting {
  id: string;
  desc: boolean;
}

export interface Option {
  value: string;
  label: string;
}