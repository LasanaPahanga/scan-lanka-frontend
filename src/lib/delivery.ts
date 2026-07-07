import { api } from './api';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:8080';

export interface PostalCode {
  postalCode: string;
  zoneName: string;
}

export interface DistrictSummary {
  district: string;
  count: number;
}

export interface DeliveryZone {
  zone: string;
  totalCodes: number;
  districts: DistrictSummary[];
}

export const fetchPostalCodes = (q?: string) =>
  api<PostalCode[]>(`/api/delivery/postal-codes${q ? `?q=${encodeURIComponent(q)}` : ''}`);

export async function fetchDeliveryLocations(): Promise<DeliveryZone[]> {
  try {
    const res = await fetch(`${API_BASE}/api/delivery/locations`, { next: { revalidate: 300 } });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}
