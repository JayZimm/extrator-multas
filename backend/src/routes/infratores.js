import express from 'express';
import AutoInfracao from '../models/AutoInfracao.js';

const router = express.Router();

// GET /api/infratores
router.get('/', async (req, res) => {
  try {
    const infratores = await AutoInfracao.distinct('infrator_nome');
    res.json(infratores.sort());
  } catch (error) {
    console.error('Erro ao buscar infratores:', error);
    res.status(500).json({
      message: 'Erro ao buscar lista de infratores',
      code: 'FETCH_ERROR'
    });
  }
});

export default router; 