import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { generatePublicId } from '../utils/publicId';

const router = Router();
const prisma = new PrismaClient();

// Create poll
router.post('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, slots } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    if (!slots || !Array.isArray(slots) || slots.length === 0) {
      return res.status(400).json({ error: 'At least one time slot is required' });
    }

    const poll = await prisma.poll.create({
      data: {
        title,
        description: description || '',
        public_id: generatePublicId(),
        owner_id: req.userId!,
        slots: {
          create: slots.map((slot: { start_time: string; end_time: string }) => ({
            start_time: new Date(slot.start_time),
            end_time: new Date(slot.end_time)
          }))
        }
      },
      include: {
        slots: true
      }
    });

    res.json(poll);
  } catch (error) {
    console.error('Create poll error:', error);
    res.status(500).json({ error: 'Failed to create poll' });
  }
});

// List user's polls
router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const polls = await prisma.poll.findMany({
      where: { owner_id: req.userId! },
      include: {
        slots: true,
        _count: {
          select: { responses: true }
        }
      },
      orderBy: { created_at: 'desc' }
    });

    res.json(polls);
  } catch (error) {
    console.error('List polls error:', error);
    res.status(500).json({ error: 'Failed to list polls' });
  }
});

// Get poll details (owner view)
router.get('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const poll = await prisma.poll.findFirst({
      where: {
        id: req.params.id,
        owner_id: req.userId!
      },
      include: {
        slots: {
          include: {
            responses: true
          }
        }
      }
    });

    if (!poll) {
      return res.status(404).json({ error: 'Poll not found' });
    }

    // Aggregate responses per slot
    const slotsWithAggregates = poll.slots.map(slot => {
      const yesCount = slot.responses.filter(r => r.choice === 'yes').length;
      const noCount = slot.responses.filter(r => r.choice === 'no').length;
      const uniqueParticipants = [...new Set(slot.responses.map(r => r.participant_name))];

      return {
        ...slot,
        yesCount,
        noCount,
        responses: slot.responses
      };
    });

    res.json({
      ...poll,
      slots: slotsWithAggregates
    });
  } catch (error) {
    console.error('Get poll error:', error);
    res.status(500).json({ error: 'Failed to get poll' });
  }
});

// Get public poll (no auth required)
router.get('/public/:publicId', async (req: Request, res: Response) => {
  try {
    const poll = await prisma.poll.findUnique({
      where: { public_id: req.params.publicId },
      include: {
        slots: {
          include: {
            responses: true
          }
        }
      }
    });

    if (!poll) {
      return res.status(404).json({ error: 'Poll not found' });
    }

    res.json(poll);
  } catch (error) {
    console.error('Get public poll error:', error);
    res.status(500).json({ error: 'Failed to get poll' });
  }
});

// Submit responses to public poll
router.post('/public/:publicId/responses', async (req: Request, res: Response) => {
  try {
    const { participant_name, responses } = req.body;

    if (!participant_name) {
      return res.status(400).json({ error: 'Participant name is required' });
    }

    if (!responses || !Array.isArray(responses) || responses.length === 0) {
      return res.status(400).json({ error: 'At least one response is required' });
    }

    const poll = await prisma.poll.findUnique({
      where: { public_id: req.params.publicId },
      include: { slots: true }
    });

    if (!poll) {
      return res.status(404).json({ error: 'Poll not found' });
    }

    // Validate slot IDs
    const slotIds = poll.slots.map(s => s.id);
    const invalidSlots = responses.filter((r: any) => !slotIds.includes(r.slot_id));

    if (invalidSlots.length > 0) {
      return res.status(400).json({ error: 'Invalid slot IDs' });
    }

    // Delete existing responses from this participant
    await prisma.pollResponse.deleteMany({
      where: {
        poll_id: poll.id,
        participant_name
      }
    });

    // Create new responses
    const newResponses = await prisma.pollResponse.createMany({
      data: responses.map((r: { slot_id: string; choice: string }) => ({
        poll_id: poll.id,
        slot_id: r.slot_id,
        participant_name,
        choice: r.choice
      }))
    });

    res.json({ success: true, count: newResponses.count });
  } catch (error) {
    console.error('Submit responses error:', error);
    res.status(500).json({ error: 'Failed to submit responses' });
  }
});

export default router;
