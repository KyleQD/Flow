export interface Event {
  id: string;
  name: string;
  description?: string;
  start_date: string; // ISO string for dates from Supabase
  end_date?: string;  // ISO string
  total_tickets: number;
  tickets_sold: number;
  venue_id?: string; // Example of another potential field
  // Add other relevant event fields here
} 