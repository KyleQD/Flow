export interface Event {
  id: string;
  name: string;
  description?: string;
  start_date: string; // ISO string for dates from Supabase
  end_date?: string;  // ISO string
  total_tickets: number;
  tickets_sold: number;
  venue_id?: string; // Example of another potential field
  // Optional fields used by UI components
  capacity?: number;
  notes?: string;
  ticketPrice?: number;
  location?: string;
  date?: string | Date;
  startTime?: string;
  endTime?: string;
  type?: string;
  status?: string;
  // Add other relevant event fields here
} 