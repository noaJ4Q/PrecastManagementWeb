import express from 'express';
import { getViewerToken } from '../services/aps.js';

let router = express.Router();

router.get('/api/auth/token', async (req, res, next) => {
  try {
    res.json(await getViewerToken());
  } catch (err) {
    next(err);
  }
});

export default router;