import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { generatePublicId } from '../utils/publicId';

const router = Router();
const prisma = new PrismaClient();

// Helper to parse time string "HH:mm" to minutes since midnight
function parseTimeToMinutes(timeStr: string): number {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
}

// Helper to check if two time ranges overlap
function timesOverlap(start1: Date, end1: Date, start2: Date, end2: Date): boolean {
  return start1 < end2 && start2 < end1;
}

// Generate available slots for a booking page
async function generateAvailableSlots(
  bookingPageId: string,
  timezone: string,
  durationMinutes: number,
  startDate: Date,
  endDate: Date
): Promise<{ start_time: Date; end_time: Date }[]> {
  // Get availability rules
  const rules = await prisma.availabilityRule.findMany({
    where: { booking_page_id: bookingPageId }
  });

  if (rules.length === 0) {
    return [];
  }

  // Get existing bookings in the date range
  const bookings = await prisma.booking.findMany({
    where: {
      booking_page_id: bookingPageId,
      start_time: { gte: startDate },
      end_time: { lte: endDate }
    }
  });

  const slots: { start_time: Date; end_time: Date }[] = [];

  // Iterate through each day in the range
  const currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    const dayOfWeek = currentDate.getDay(); // 0 (Sunday) to 6 (Saturday)

    // Find rules for this day
    const dayRules = rules.filter(r => r.day_of_week === dayOfWeek);

    for (const rule of dayRules) {
      const startMinutes = parseTimeToMinutes(rule.start_time_local);
      const endMinutes = parseTimeToMinutes(rule.end_time_local);

      // Generate slots for this rule
      for (let minutes = startMinutes; minutes + durationMinutes <= endMinutes; minutes += durationMinutes) {
        const slotStart = new Date(currentDate);
        slotStart.setHours(Math.floor(minutes / 60), minutes % 60, 0, 0);

        const slotEnd = new Date(slotStart);
        slotEnd.setMinutes(slotEnd.getMinutes() + durationMinutes);

        // Check if slot conflicts with any existing booking
        const hasConflict = bookings.some(booking =>
          timesOverlap(slotStart, slotEnd, booking.start_time, booking.end_time)
        );

        if (!hasConflict) {
          slots.push({ start_time: slotStart, end_time: slotEnd });
        }
      }
    }

    // Move to next day
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return slots;
}

// Create booking page
router.post('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { name, description, duration_minutes, timezone, availability_rules } = req.body;

    if (!name || !duration_minutes || !timezone) {
      return res.status(400).json({ error: 'Name, duration_minutes and timezone are required' });
    }

    if (!availability_rules || !Array.isArray(availability_rules) || availability_rules.length === 0) {
      return res.status(400).json({ error: 'At least one availability rule is required' });
    }

    const bookingPage = await prisma.bookingPage.create({
      data: {
        name,
        description: description || '',
        duration_minutes,
        timezone,
        public_id: generatePublicId(),
        owner_id: req.userId!,
        availability: {
          create: availability_rules.map((rule: any) => ({
            day_of_week: rule.day_of_week,
            start_time_local: rule.start_time_local,
            end_time_local: rule.end_time_local
          }))
        }
      },
      include: {
        availability: true
      }
    });

    res.json(bookingPage);
  } catch (error) {
    console.error('Create booking page error:', error);
    res.status(500).json({ error: 'Failed to create booking page' });
  }
});

// List user's booking pages
router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const bookingPages = await prisma.bookingPage.findMany({
      where: { owner_id: req.userId! },
      include: {
        availability: true,
        _count: {
          select: { bookings: true }
        }
      },
      orderBy: { created_at: 'desc' }
    });

    res.json(bookingPages);
  } catch (error) {
    console.error('List booking pages error:', error);
    res.status(500).json({ error: 'Failed to list booking pages' });
  }
});

// Get booking page details (owner view)
router.get('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const bookingPage = await prisma.bookingPage.findFirst({
      where: {
        id: req.params.id,
        owner_id: req.userId!
      },
      include: {
        availability: true,
        bookings: {
          orderBy: { start_time: 'asc' },
          where: {
            start_time: { gte: new Date() }
          }
        }
      }
    });

    if (!bookingPage) {
      return res.status(404).json({ error: 'Booking page not found' });
    }

    res.json(bookingPage);
  } catch (error) {
    console.error('Get booking page error:', error);
    res.status(500).json({ error: 'Failed to get booking page' });
  }
});

// Get public booking page
router.get('/public/:publicId', async (req: Request, res: Response) => {
  try {
    const bookingPage = await prisma.bookingPage.findUnique({
      where: { public_id: req.params.publicId },
      include: {
        availability: true
      }
    });

    if (!bookingPage) {
      return res.status(404).json({ error: 'Booking page not found' });
    }

    res.json(bookingPage);
  } catch (error) {
    console.error('Get public booking page error:', error);
    res.status(500).json({ error: 'Failed to get booking page' });
  }
});

// Get available slots
router.post('/public/:publicId/available-slots', async (req: Request, res: Response) => {
  try {
    const { start_date, end_date } = req.body;

    if (!start_date || !end_date) {
      return res.status(400).json({ error: 'start_date and end_date are required' });
    }

    const bookingPage = await prisma.bookingPage.findUnique({
      where: { public_id: req.params.publicId }
    });

    if (!bookingPage) {
      return res.status(404).json({ error: 'Booking page not found' });
    }

    const slots = await generateAvailableSlots(
      bookingPage.id,
      bookingPage.timezone,
      bookingPage.duration_minutes,
      new Date(start_date),
      new Date(end_date)
    );

    res.json({ slots });
  } catch (error) {
    console.error('Get available slots error:', error);
    res.status(500).json({ error: 'Failed to get available slots' });
  }
});

// Create booking
router.post('/public/:publicId/bookings', async (req: Request, res: Response) => {
  try {
    const { start_time, invitee_name, invitee_email } = req.body;

    if (!start_time || !invitee_name || !invitee_email) {
      return res.status(400).json({ error: 'start_time, invitee_name and invitee_email are required' });
    }

    const bookingPage = await prisma.bookingPage.findUnique({
      where: { public_id: req.params.publicId }
    });

    if (!bookingPage) {
      return res.status(404).json({ error: 'Booking page not found' });
    }

    const startTime = new Date(start_time);
    const endTime = new Date(startTime);
    endTime.setMinutes(endTime.getMinutes() + bookingPage.duration_minutes);

    // Check for conflicts
    const conflicts = await prisma.booking.findMany({
      where: {
        booking_page_id: bookingPage.id,
        OR: [
          {
            AND: [
              { start_time: { lte: startTime } },
              { end_time: { gt: startTime } }
            ]
          },
          {
            AND: [
              { start_time: { lt: endTime } },
              { end_time: { gte: endTime } }
            ]
          },
          {
            AND: [
              { start_time: { gte: startTime } },
              { end_time: { lte: endTime } }
            ]
          }
        ]
      }
    });

    if (conflicts.length > 0) {
      return res.status(409).json({ error: 'This time slot is no longer available' });
    }

    const booking = await prisma.booking.create({
      data: {
        booking_page_id: bookingPage.id,
        start_time: startTime,
        end_time: endTime,
        invitee_name,
        invitee_email
      }
    });

    res.json(booking);
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({ error: 'Failed to create booking' });
  }
});

export default router;
