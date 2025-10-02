import express from 'express';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/', verifyToken, async (req, res) => {
  const lists = await List.find({ userId: req.userId });
  res.json(lists);
});

export default router;