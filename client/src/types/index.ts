export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Poll {
  id: string;
  owner_id: string;
  public_id: string;
  title: string;
  description?: string;
  created_at: string;
  slots: PollSlot[];
}

export interface PollSlot {
  id: string;
  poll_id: string;
  start_time: string;
  end_time: string;
  responses?: PollResponse[];
  yesCount?: number;
  noCount?: number;
}

export interface PollResponse {
  id: string;
  poll_id: string;
  slot_id: string;
  participant_name: string;
  choice: string;
}

export interface BookingPage {
  id: string;
  owner_id: string;
  public_id: string;
  name: string;
  description?: string;
  duration_minutes: number;
  timezone: string;
  created_at: string;
  availability: AvailabilityRule[];
  bookings?: Booking[];
}

export interface AvailabilityRule {
  id: string;
  booking_page_id: string;
  day_of_week: number;
  start_time_local: string;
  end_time_local: string;
}

export interface Booking {
  id: string;
  booking_page_id: string;
  start_time: string;
  end_time: string;
  invitee_name: string;
  invitee_email: string;
  created_at: string;
}

export interface TimeSlot {
  start_time: string;
  end_time: string;
}
