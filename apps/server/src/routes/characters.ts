import { Router, Request, Response } from 'express';

interface Character {
  id: string;
  name: string;
  description: string;
  personality: string;
  background?: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

// In-memory storage (replace with database in production)
const characters: Map<string, Character> = new Map();

const router = Router();

// GET /api/characters - list all characters
router.get('/', (req: Request, res: Response) => {
  const characterList = Array.from(characters.values());
  res.json({
    success: true,
    data: characterList,
    count: characterList.length
  });
});

// GET /api/characters/:id - get character by ID
router.get('/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const character = characters.get(id);
  
  if (!character) {
    return res.status(404).json({
      success: false,
      error: 'Character not found'
    });
  }
  
  res.json({
    success: true,
    data: character
  });
});

// POST /api/characters - create new character
router.post('/', (req: Request, res: Response) => {
  const { name, description, personality, background, avatar } = req.body;
  
  // Validation
  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return res.status(400).json({
      success: false,
      error: 'Name is required and must be a non-empty string'
    });
  }
  
  if (!description || typeof description !== 'string') {
    return res.status(400).json({
      success: false,
      error: 'Description is required'
    });
  }
  
  if (!personality || typeof personality !== 'string') {
    return res.status(400).json({
      success: false,
      error: 'Personality is required'
    });
  }
  
  const now = new Date().toISOString();
  const character: Character = {
    id: crypto.randomUUID(),
    name: name.trim(),
    description: description.trim(),
    personality: personality.trim(),
    background: background?.trim(),
    avatar: avatar?.trim(),
    createdAt: now,
    updatedAt: now
  };
  
  characters.set(character.id, character);
  
  res.status(201).json({
    success: true,
    data: character,
    message: 'Character created successfully'
  });
});

// PUT /api/characters/:id - update character
router.put('/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, description, personality, background, avatar } = req.body;
  
  const existingCharacter = characters.get(id);
  
  if (!existingCharacter) {
    return res.status(404).json({
      success: false,
      error: 'Character not found'
    });
  }
  
  // Validation
  if (name !== undefined && (typeof name !== 'string' || name.trim().length === 0)) {
    return res.status(400).json({
      success: false,
      error: 'Name must be a non-empty string'
    });
  }
  
  const updatedCharacter: Character = {
    ...existingCharacter,
    name: name?.trim() ?? existingCharacter.name,
    description: description?.trim() ?? existingCharacter.description,
    personality: personality?.trim() ?? existingCharacter.personality,
    background: background?.trim() ?? existingCharacter.background,
    avatar: avatar?.trim() ?? existingCharacter.avatar,
    updatedAt: new Date().toISOString()
  };
  
  characters.set(id, updatedCharacter);
  
  res.json({
    success: true,
    data: updatedCharacter,
    message: 'Character updated successfully'
  });
});

// DELETE /api/characters/:id - delete character
router.delete('/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  
  const existingCharacter = characters.get(id);
  
  if (!existingCharacter) {
    return res.status(404).json({
      success: false,
      error: 'Character not found'
    });
  }
  
  characters.delete(id);
  
  res.json({
    success: true,
    message: 'Character deleted successfully'
  });
});

export { router as charactersRouter };
