import { Router, Request, Response } from 'express';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
}

interface Session {
  id: string;
  characterId: string;
  title: string;
  messages: Message[];
  createdAt: string;
  updatedAt: string;
}

// In-memory storage (replace with database in production)
const sessions: Map<string, Session> = new Map();

const router = Router();

// GET /api/sessions - list sessions (optionally filter by characterId)
router.get('/', (req: Request, res: Response) => {
  const { characterId } = req.query;
  
  let sessionList = Array.from(sessions.values());
  
  // Filter by characterId if provided
  if (characterId && typeof characterId === 'string') {
    sessionList = sessionList.filter(session => session.characterId === characterId);
  }
  
  // Sort by updatedAt descending
  sessionList.sort((a, b) => 
    new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
  
  res.json({
    success: true,
    data: sessionList,
    count: sessionList.length
  });
});

// GET /api/sessions/:id - get session by ID
router.get('/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const session = sessions.get(id);
  
  if (!session) {
    return res.status(404).json({
      success: false,
      error: 'Session not found'
    });
  }
  
  res.json({
    success: true,
    data: session
  });
});

// POST /api/sessions - create new session
router.post('/', (req: Request, res: Response) => {
  const { characterId, title } = req.body;
  
  // Validation
  if (!characterId || typeof characterId !== 'string') {
    return res.status(400).json({
      success: false,
      error: 'CharacterId is required'
    });
  }
  
  const now = new Date().toISOString();
  const session: Session = {
    id: crypto.randomUUID(),
    characterId,
    title: title?.trim() || 'New Conversation',
    messages: [],
    createdAt: now,
    updatedAt: now
  };
  
  sessions.set(session.id, session);
  
  res.status(201).json({
    success: true,
    data: session,
    message: 'Session created successfully'
  });
});

// POST /api/sessions/:id/messages - send message and get response
router.post('/:id/messages', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { content } = req.body;
  
  const session = sessions.get(id);
  
  if (!session) {
    return res.status(404).json({
      success: false,
      error: 'Session not found'
    });
  }
  
  // Validation
  if (!content || typeof content !== 'string' || content.trim().length === 0) {
    return res.status(400).json({
      success: false,
      error: 'Content is required and must be a non-empty string'
    });
  }
  
  const now = new Date().toISOString();
  
  // Add user message
  const userMessage: Message = {
    id: crypto.randomUUID(),
    role: 'user',
    content: content.trim(),
    timestamp: now
  };
  
  session.messages.push(userMessage);
  
  // Generate assistant response (placeholder - integrate with LLM in production)
  const assistantMessage: Message = {
    id: crypto.randomUUID(),
    role: 'assistant',
    content: `This is a placeholder response to: "${content.trim()}"`,
    timestamp: new Date().toISOString()
  };
  
  session.messages.push(assistantMessage);
  session.updatedAt = assistantMessage.timestamp;
  
  res.json({
    success: true,
    data: {
      userMessage,
      assistantMessage
    }
  });
});

// DELETE /api/sessions/:id - delete session
router.delete('/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  
  const existingSession = sessions.get(id);
  
  if (!existingSession) {
    return res.status(404).json({
      success: false,
      error: 'Session not found'
    });
  }
  
  sessions.delete(id);
  
  res.json({
    success: true,
    message: 'Session deleted successfully'
  });
});

export { router as sessionsRouter };
