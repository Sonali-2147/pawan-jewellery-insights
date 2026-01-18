export interface Customer {
  id: number;
  name: string;
  mob_no: string;
  address: string;
  purpose: number;
  purpose_name?: string;
  whatsapp: string;
  notification: string;
  joining_date: string;
  staff_id: number;
  staff_name?: string;
  latitude: number | null;
  longitude: number | null;
}

export interface Purpose {
  id: number;
  purpose: string;
  descr: string;
}

export interface Staff {
  id: number;
  name: string;
  mob_no: string;
  address: string;
  joining_date: string;
  leaving_date: string | null;
}

export interface AnalyticsLastNDays {
  date: string;
  count: number;
}

export interface StaffCount {
  staff_id: number;
  staff_name: string;
  customer_count: number;
}

export interface CustomerFormData {
  name: string;
  address: string;
  mob_no: string;
  purpose: number;
  whatsapp: string;
  notification: string;
  joining_date: string;
  staff_id: number;
  latitude: number | null;
  longitude: number | null;
}

export interface PurposeFormData {
  purpose: string;
  descr: string;
}

export interface PaginatedResponse<T> {
  status: string;
  page: number;
  limit: number;
  total_records: number;
  total_pages: number;
  data: T[];
}

export interface ApiResponse<T = unknown> {
  status: string;
  message?: string;
  data?: T;
  count?: number;
}
