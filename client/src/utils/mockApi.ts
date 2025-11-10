import { User, Poll, BookingPage, Booking } from '../types';

// Demo mode uses localStorage to simulate a backend
const STORAGE_KEYS = {
  USERS: 'demo_users',
  CURRENT_USER: 'demo_current_user',
  TOKEN: 'demo_token',
  POLLS: 'demo_polls',
  BOOKING_PAGES: 'demo_booking_pages',
  BOOKINGS: 'demo_bookings',
  POLL_RESPONSES: 'demo_poll_responses',
};

// Initialize demo data
function initializeDemoData() {
  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify([]));
  }
  if (!localStorage.getItem(STORAGE_KEYS.POLLS)) {
    // Add sample poll
    const samplePolls = [
      {
        id: 'demo-poll-1',
        owner_id: 'demo-user-1',
        public_id: 'DemoTeamMeeting',
        title: 'Team Meeting - When works best?',
        description: 'Let\'s find the best time for our weekly sync',
        created_at: new Date().toISOString(),
        slots: [
          {
            id: 'slot-1',
            poll_id: 'demo-poll-1',
            start_time: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
            end_time: new Date(Date.now() + 90000000).toISOString(),
            responses: [],
          },
          {
            id: 'slot-2',
            poll_id: 'demo-poll-1',
            start_time: new Date(Date.now() + 172800000).toISOString(), // Day after
            end_time: new Date(Date.now() + 176400000).toISOString(),
            responses: [],
          }
        ]
      }
    ];
    localStorage.setItem(STORAGE_KEYS.POLLS, JSON.stringify(samplePolls));
  }
  if (!localStorage.getItem(STORAGE_KEYS.BOOKING_PAGES)) {
    localStorage.setItem(STORAGE_KEYS.BOOKING_PAGES, JSON.stringify([]));
  }
  if (!localStorage.getItem(STORAGE_KEYS.BOOKINGS)) {
    localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify([]));
  }
  if (!localStorage.getItem(STORAGE_KEYS.POLL_RESPONSES)) {
    localStorage.setItem(STORAGE_KEYS.POLL_RESPONSES, JSON.stringify([]));
  }
}

function generateId() {
  return 'demo-' + Math.random().toString(36).substr(2, 9);
}

function generatePublicId() {
  return Math.random().toString(36).substr(2, 12);
}

export const mockApi = {
  // Auth
  signup: async (data: { name: string; email: string; password: string }) => {
    const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');

    if (users.find((u: any) => u.email === data.email)) {
      throw new Error('Email already registered');
    }

    const user: User = {
      id: generateId(),
      name: data.name,
      email: data.email,
    };

    users.push({ ...user, password: data.password });
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    localStorage.setItem(STORAGE_KEYS.TOKEN, generateId());

    return { token: localStorage.getItem(STORAGE_KEYS.TOKEN), user };
  },

  login: async (data: { email: string; password: string }) => {
    const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
    const user = users.find((u: any) => u.email === data.email && u.password === data.password);

    if (!user) {
      throw new Error('Invalid email or password');
    }

    const userWithoutPassword = { id: user.id, name: user.name, email: user.email };
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(userWithoutPassword));
    localStorage.setItem(STORAGE_KEYS.TOKEN, generateId());

    return { token: localStorage.getItem(STORAGE_KEYS.TOKEN), user: userWithoutPassword };
  },

  getCurrentUser: async () => {
    const user = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (!user) throw new Error('Not authenticated');
    return JSON.parse(user);
  },

  // Polls
  createPoll: async (data: any) => {
    const currentUser = JSON.parse(localStorage.getItem(STORAGE_KEYS.CURRENT_USER) || '{}');
    const polls = JSON.parse(localStorage.getItem(STORAGE_KEYS.POLLS) || '[]');

    const poll = {
      id: generateId(),
      owner_id: currentUser.id,
      public_id: generatePublicId(),
      title: data.title,
      description: data.description || '',
      created_at: new Date().toISOString(),
      slots: data.slots.map((s: any) => ({
        id: generateId(),
        poll_id: '',
        start_time: s.start_time,
        end_time: s.end_time,
        responses: [],
      }))
    };

    poll.slots.forEach((s: any) => s.poll_id = poll.id);
    polls.push(poll);
    localStorage.setItem(STORAGE_KEYS.POLLS, JSON.stringify(polls));

    return poll;
  },

  getPolls: async () => {
    const currentUser = JSON.parse(localStorage.getItem(STORAGE_KEYS.CURRENT_USER) || '{}');
    const polls = JSON.parse(localStorage.getItem(STORAGE_KEYS.POLLS) || '[]');
    return polls.filter((p: any) => p.owner_id === currentUser.id);
  },

  getPoll: async (id: string) => {
    const polls = JSON.parse(localStorage.getItem(STORAGE_KEYS.POLLS) || '[]');
    const responses = JSON.parse(localStorage.getItem(STORAGE_KEYS.POLL_RESPONSES) || '[]');

    const poll = polls.find((p: any) => p.id === id);
    if (!poll) throw new Error('Poll not found');

    // Add aggregated responses
    poll.slots = poll.slots.map((slot: any) => {
      const slotResponses = responses.filter((r: any) => r.slot_id === slot.id);
      return {
        ...slot,
        responses: slotResponses,
        yesCount: slotResponses.filter((r: any) => r.choice === 'yes').length,
        noCount: slotResponses.filter((r: any) => r.choice === 'no').length,
      };
    });

    return poll;
  },

  getPublicPoll: async (publicId: string) => {
    const polls = JSON.parse(localStorage.getItem(STORAGE_KEYS.POLLS) || '[]');
    const poll = polls.find((p: any) => p.public_id === publicId);
    if (!poll) throw new Error('Poll not found');
    return poll;
  },

  submitPollResponses: async (publicId: string, data: any) => {
    const polls = JSON.parse(localStorage.getItem(STORAGE_KEYS.POLLS) || '[]');
    const poll = polls.find((p: any) => p.public_id === publicId);
    if (!poll) throw new Error('Poll not found');

    const responses = JSON.parse(localStorage.getItem(STORAGE_KEYS.POLL_RESPONSES) || '[]');

    // Remove existing responses from this participant
    const filtered = responses.filter((r: any) =>
      !(r.poll_id === poll.id && r.participant_name === data.participant_name)
    );

    // Add new responses
    data.responses.forEach((r: any) => {
      filtered.push({
        id: generateId(),
        poll_id: poll.id,
        slot_id: r.slot_id,
        participant_name: data.participant_name,
        choice: r.choice,
      });
    });

    localStorage.setItem(STORAGE_KEYS.POLL_RESPONSES, JSON.stringify(filtered));
    return { success: true, count: data.responses.length };
  },

  // Booking Pages
  createBookingPage: async (data: any) => {
    const currentUser = JSON.parse(localStorage.getItem(STORAGE_KEYS.CURRENT_USER) || '{}');
    const bookingPages = JSON.parse(localStorage.getItem(STORAGE_KEYS.BOOKING_PAGES) || '[]');

    const bookingPage = {
      id: generateId(),
      owner_id: currentUser.id,
      public_id: generatePublicId(),
      name: data.name,
      description: data.description || '',
      duration_minutes: data.duration_minutes,
      timezone: data.timezone,
      created_at: new Date().toISOString(),
      availability: data.availability_rules.map((r: any) => ({
        id: generateId(),
        booking_page_id: '',
        ...r
      }))
    };

    bookingPage.availability.forEach((a: any) => a.booking_page_id = bookingPage.id);
    bookingPages.push(bookingPage);
    localStorage.setItem(STORAGE_KEYS.BOOKING_PAGES, JSON.stringify(bookingPages));

    return bookingPage;
  },

  getBookingPages: async () => {
    const currentUser = JSON.parse(localStorage.getItem(STORAGE_KEYS.CURRENT_USER) || '{}');
    const bookingPages = JSON.parse(localStorage.getItem(STORAGE_KEYS.BOOKING_PAGES) || '[]');
    return bookingPages.filter((bp: any) => bp.owner_id === currentUser.id);
  },

  getBookingPage: async (id: string) => {
    const bookingPages = JSON.parse(localStorage.getItem(STORAGE_KEYS.BOOKING_PAGES) || '[]');
    const bookings = JSON.parse(localStorage.getItem(STORAGE_KEYS.BOOKINGS) || '[]');

    const bookingPage = bookingPages.find((bp: any) => bp.id === id);
    if (!bookingPage) throw new Error('Booking page not found');

    bookingPage.bookings = bookings.filter((b: any) =>
      b.booking_page_id === id && new Date(b.start_time) >= new Date()
    );

    return bookingPage;
  },

  getPublicBookingPage: async (publicId: string) => {
    const bookingPages = JSON.parse(localStorage.getItem(STORAGE_KEYS.BOOKING_PAGES) || '[]');
    const bookingPage = bookingPages.find((bp: any) => bp.public_id === publicId);
    if (!bookingPage) throw new Error('Booking page not found');
    return bookingPage;
  },

  getAvailableSlots: async (publicId: string, data: { start_date: string; end_date: string }) => {
    const bookingPages = JSON.parse(localStorage.getItem(STORAGE_KEYS.BOOKING_PAGES) || '[]');
    const bookingPage = bookingPages.find((bp: any) => bp.public_id === publicId);
    if (!bookingPage) throw new Error('Booking page not found');

    const bookings = JSON.parse(localStorage.getItem(STORAGE_KEYS.BOOKINGS) || '[]');
    const pageBookings = bookings.filter((b: any) => b.booking_page_id === bookingPage.id);

    // Simple slot generation for demo
    const slots = [];
    const start = new Date(data.start_date);
    const end = new Date(data.end_date);
    const duration = bookingPage.duration_minutes;

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dayOfWeek = d.getDay();
      const rules = bookingPage.availability.filter((r: any) => r.day_of_week === dayOfWeek);

      for (const rule of rules) {
        const [startHour, startMin] = rule.start_time_local.split(':').map(Number);
        const [endHour, endMin] = rule.end_time_local.split(':').map(Number);

        for (let hour = startHour; hour < endHour; hour++) {
          const slotStart = new Date(d);
          slotStart.setHours(hour, 0, 0, 0);
          const slotEnd = new Date(slotStart);
          slotEnd.setMinutes(slotEnd.getMinutes() + duration);

          // Check if slot is in the future and not booked
          if (slotStart > new Date()) {
            const isBooked = pageBookings.some((b: any) => {
              const bookingStart = new Date(b.start_time);
              const bookingEnd = new Date(b.end_time);
              return (slotStart < bookingEnd && slotEnd > bookingStart);
            });

            if (!isBooked) {
              slots.push({
                start_time: slotStart.toISOString(),
                end_time: slotEnd.toISOString(),
              });
            }
          }
        }
      }
    }

    return { slots };
  },

  createBooking: async (publicId: string, data: any) => {
    const bookingPages = JSON.parse(localStorage.getItem(STORAGE_KEYS.BOOKING_PAGES) || '[]');
    const bookingPage = bookingPages.find((bp: any) => bp.public_id === publicId);
    if (!bookingPage) throw new Error('Booking page not found');

    const bookings = JSON.parse(localStorage.getItem(STORAGE_KEYS.BOOKINGS) || '[]');

    const startTime = new Date(data.start_time);
    const endTime = new Date(startTime);
    endTime.setMinutes(endTime.getMinutes() + bookingPage.duration_minutes);

    const booking = {
      id: generateId(),
      booking_page_id: bookingPage.id,
      start_time: startTime.toISOString(),
      end_time: endTime.toISOString(),
      invitee_name: data.invitee_name,
      invitee_email: data.invitee_email,
      created_at: new Date().toISOString(),
    };

    bookings.push(booking);
    localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings));

    return booking;
  },
};

// Initialize demo data on load
initializeDemoData();
