import express from 'express';
import AutoInfracao from '../models/AutoInfracao.js';

const router = express.Router();

// GET /api/infratores
router.get('/', async (req, res) => {
  try {
    // Buscar infratores distintos por nome e CNPJ
    const infratores = await AutoInfracao.aggregate([
      {
        $group: {
          _id: {
            nome: '$infrator_nome',
            cnpj: '$infrator_cpf_cnpj'
          }
        }
      },
      {
        $project: {
          _id: 0,
          nome: '$_id.nome',
          cnpj: '$_id.cnpj'
        }
      },
      {
        $sort: { nome: 1, cnpj: 1 }
      }
    ]);
    
    res.json(infratores);
  } catch (error) {
    console.error('Erro ao buscar infratores:', error);
    res.status(500).json({
      message: 'Erro ao buscar lista de infratores',
      code: 'FETCH_ERROR'
    });
  }
});

export default router; 