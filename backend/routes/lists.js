import express from 'express';
import List from '../models/List.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// create a new list
router.post('/', verifyToken, async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ message: 'Name required' });

  const list = new List({
    name,
    owner: req.user,
    collaborators: [],
    items: []
  })
  await list.save();
  res.status(201).json(list);
});

// get all lists a user owns or collaborates on
router.get('/', verifyToken, async (req, res) => {
  const lists = await List.find({
    $or: [
      { owner: req.user },
      { collaborators: req.user }
    ]
  });
  res.json(lists);
});

// gets one list
router.get('/:id', verifyToken, async (req, res) => {
  const list = await List.findById(req.params.id);
  if (!list) return res.status(404).json({ message: 'List not found' });
  if (!list.owner.equals(req.user) && !list.collaborators.includes(req.user)) {
    return res.sendStatus(403);
  }
  res.json(list);
});

// update name or collaborators
router.put('/:id', verifyToken, async (req, res) => {
  const list = await List.findById(req.params.id);
  if (!list) return res.status(404).json({ message: 'List not found' });

  if (!list.owner.equals(req.user)) return res.sendStatus(403); // only list owner can update name/collaborators

  const { name, collaborators } = req.body;
  if (name !== undefined) list.name = name;
  if (collaborators !== undefined) list.collaborators = collaborators;
  await list.save();
  res.json(list);
});

// delete list
router.delete('/:id', verifyToken, async (req, res) => {
  const list = await List.findById(req.params.id);
  if (!list) return res.status(404).json({ message: 'List not found' });

  if (!list.owner.equals(req.user)) return res.sendStatus(403);

  await list.deleteOne();
  res.json({ message: 'List deleted' })
});

// add item
router.post('/:id/items', verifyToken, async (req, res) => {
  const { name, quantity, category } = req.body;
  const list = await List.findById(req.params.id);
  
  if (!list) return res.status(404).json({ message: 'List not found' });
  if (!list.owner.equals(req.user) && !list.collaborators.includes(req.user)) {
    return res.sendStatus(403);
  }

  list.items.push({ name, quantity, category });
  await list.save();
  res.status(201).json(list);
});

// update item
router.put('/:id/items/:itemId', verifyToken, async (req, res) => {
  const list = await List.findById(req.params.id);

  if (!list) return res.status(404).json({ message: 'List not found' });
  if (!list.owner.equals(req.user) && !list.collaborators.includes(req.user)) {
    return res.sendStatus(403);
  }

  const item = list.items.id(req.params.itemId);
  if (!item) return res.status(404).json({ message: 'Item not found' });

  Object.assign(item, req.body);
  await list.save();
    res.json(list);
});

// delete item
router.delete('/:id/items/:itemId', verifyToken, async (req, res) => {
  const list = await List.findById(req.params.id);

  if (!list) return res.status(404).json({ message: 'List not found' });
  if (!list.owner.equals(req.user) && !list.collaborators.includes(req.user)) {
    return res.sendStatus(403);
  }

  const item = list.items.id(req.params.itemId);
  if (!item) return res.status(404).json({ message: 'Item not found' });

  item.deleteOne();
  await list.save();
  res.json(list);
});

export default router;