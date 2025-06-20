import express from 'express';
import { Parser } from 'json2csv';
import AutoInfracao from '../models/AutoInfracao.js';

const router = express.Router();

/**
 * Rota para listar autos de infração com paginação e filtros
 * 
 * Parâmetros suportados:
 * - page: Número da página (default: 1)
 * - limit: Número de registros por página (default: 10)
 * - infrator: Nome exato do infrator para filtrar
 * - search: Termo de busca (busca parcial) em número do auto, descrição ou nome do infrator
 */
router.get('/', async (req, res) => {
  try {
    console.log('=========== INICIANDO BUSCA DE AUTOS ===========');
    const { page = 1, limit = 10, infrator, search } = req.query;
    console.log('Filtros recebidos:', { page, limit, infrator, search }); // Debug
    
    // Desabilitar cache
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Surrogate-Control', 'no-store');
    
    const skip = (page - 1) * parseInt(limit);
    console.log('Skip calculado:', skip);

    // Construir o filtro
    const filter = {};
    if (infrator) {
      filter.infrator_nome = { $regex: infrator, $options: 'i' };
      console.log('Filtro por infrator aplicado:', infrator);
    }
    
    // Adicionar filtro de busca se fornecido
    if (search && search.trim() !== '') {
      const searchTerm = search.trim();
      // Escapa caracteres especiais da regex para evitar erros
      const escapedSearchTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      
      filter.$or = [
        { numero_auto_infracao: { $regex: escapedSearchTerm, $options: 'i' } },
        { descricao_infracao: { $regex: escapedSearchTerm, $options: 'i' } },
        { infrator_nome: { $regex: escapedSearchTerm, $options: 'i' } }
      ];
      console.log('Filtro de busca aplicado com termo:', searchTerm);
    }
    
    console.log('Filtro final construído:', JSON.stringify(filter, null, 2)); // Log detalhado do filtro

    console.log('Executando consulta no MongoDB...');
    
    // Buscar autos com paginação
    const [autos, total] = await Promise.all([
      AutoInfracao.find(filter)
        .sort({ local_data: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      AutoInfracao.countDocuments(filter)
    ]);
    
    console.log(`Consulta realizada: Encontrados ${autos.length} autos de um total de ${total} com os filtros aplicados`);
    console.log('IDs dos primeiros 5 autos encontrados:', autos.slice(0, 5).map(auto => auto._id));
    console.log('=========== FIM DA BUSCA ===========');

    const response = {
      autos,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      filtros_aplicados: {
        search: search || null,
        infrator: infrator || null
      }
    };
    
    res.json(response);
  } catch (error) {
    console.error('Erro ao buscar autos:', error);
    res.status(500).json({
      message: 'Erro ao buscar autos de infração',
      error: error.message
    });
  }
});

/**
 * Rota para exportar autos de infração para CSV
 * 
 * Parâmetros suportados:
 * - infrator: Nome exato do infrator para filtrar
 * - search: Termo de busca (busca parcial) em número do auto, descrição ou nome do infrator
 */
router.get('/export', async (req, res) => {
  try {
    const { infrator, search } = req.query;
    
    // Desabilitar cache
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Surrogate-Control', 'no-store');
    
    const query = {};

    if (infrator) {
      // Usar regex case-insensitive para o filtro de infrator
      query.infrator_nome = { $regex: infrator, $options: 'i' };
    }

    if (search && search.trim() !== '') {
      const searchTerm = search.trim();
      // Escapa caracteres especiais da regex para evitar erros
      const escapedSearchTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      
      query.$or = [
        { numero_auto_infracao: { $regex: escapedSearchTerm, $options: 'i' } },
        { descricao_infracao: { $regex: escapedSearchTerm, $options: 'i' } },
        { infrator_nome: { $regex: escapedSearchTerm, $options: 'i' } }
      ];
    }
    
    console.log('Filtro para exportação:', JSON.stringify(query, null, 2));

    const autos = await AutoInfracao.find(query).sort({ local_data: -1 });
    
    console.log(`Exportando ${autos.length} autos com os filtros aplicados`);

    // Formata datas para o formato brasileiro
    const formatDate = (date) => {
      if (!date) return '';
      return new Date(date).toLocaleDateString('pt-BR');
    };

    // Prepara os dados para exportação
    const dadosFormatados = autos.map(auto => {
      const autoObj = auto.toObject();
      return {
        numero_auto_infracao: autoObj.numero_auto_infracao,
        infrator_nome: autoObj.infrator_nome,
        infrator_cpf_cnpj: autoObj.infrator_cpf_cnpj,
        infrator_classificacao: autoObj.infrator_classificacao,
        veiculo_placa: autoObj.veiculo_placa,
        veiculo_uf: autoObj.veiculo_uf,
        veiculo_municipio: autoObj.veiculo_municipio,
        veiculo_marca: autoObj.veiculo_marca,
        veiculo_modelo: autoObj.veiculo_modelo,
        veiculo_especie: autoObj.veiculo_especie,
        veiculo_renavam: autoObj.veiculo_renavam,
        transportador_nome: autoObj.transportador_nome,
        transportador_cpf_cnpj: autoObj.transportador_cpf_cnpj,
        doc_tipo: autoObj.doc_tipo,
        doc_numero: autoObj.doc_numero,
        doc_chave: autoObj.doc_chave,
        doc_emissor_cpf_cnpj: autoObj.doc_emissor_cpf_cnpj,
        doc_data_emissao: formatDate(autoObj.doc_data_emissao),
        local_infracao: autoObj.local_infracao,
        local_data: formatDate(autoObj.local_data),
        local_hora: autoObj.local_hora,
        local_uf: autoObj.local_uf,
        local_municipio: autoObj.local_municipio,
        origem_uf: autoObj.origem_uf,
        origem_municipio: autoObj.origem_municipio,
        destino_uf: autoObj.destino_uf,
        destino_municipio: autoObj.destino_municipio,
        resolucao: autoObj.resolucao,
        codigo_infracao: autoObj.codigo_infracao,
        artigo: autoObj.artigo,
        inciso: autoObj.inciso,
        alinea: autoObj.alinea,
        descricao_infracao: autoObj.descricao_infracao,
        amparo_legal: autoObj.amparo_legal,
        observacoes_agente: autoObj.observacoes_agente,
        prazo_defesa_dias: autoObj.prazo_defesa_dias,
        ordem_cessacao_pratica: autoObj.ordem_cessacao_pratica,
        agente_matricula: autoObj.agente_matricula,
        agente_data: formatDate(autoObj.agente_data),
        situacao: autoObj.situacao,
        data_emissao_documento: formatDate(autoObj.meta?.data_emissao_documento),
        data_expedicao_documento: formatDate(autoObj.meta?.data_expedicao_documento),
        fonte: autoObj.meta?.fonte,
        createdAt: formatDate(autoObj.createdAt),
        updatedAt: formatDate(autoObj.updatedAt)
      };
    });

    const fields = [
      'numero_auto_infracao',
      'infrator_nome',
      'infrator_cpf_cnpj',
      'infrator_classificacao',
      'veiculo_placa',
      'veiculo_uf',
      'veiculo_municipio',
      'veiculo_marca',
      'veiculo_modelo',
      'veiculo_especie',
      'veiculo_renavam',
      'transportador_nome',
      'transportador_cpf_cnpj',
      'doc_tipo',
      'doc_numero',
      'doc_chave',
      'doc_emissor_cpf_cnpj',
      'doc_data_emissao',
      'local_infracao',
      'local_data',
      'local_hora',
      'local_uf',
      'local_municipio',
      'origem_uf',
      'origem_municipio',
      'destino_uf',
      'destino_municipio',
      'resolucao',
      'codigo_infracao',
      'artigo',
      'inciso',
      'alinea',
      'descricao_infracao',
      'amparo_legal',
      'observacoes_agente',
      'prazo_defesa_dias',
      'ordem_cessacao_pratica',
      'agente_matricula',
      'agente_data',
      'situacao',
      'data_emissao_documento',
      'data_expedicao_documento',
      'fonte',
      'createdAt',
      'updatedAt'
    ];

    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(dadosFormatados);

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename=autos_infracao.csv');
    res.write('\ufeff'); // BOM para Excel
    res.end(csv);
  } catch (error) {
    console.error('Erro ao exportar autos:', error);
    res.status(500).json({
      message: 'Erro ao exportar autos de infração',
      code: 'EXPORT_ERROR'
    });
  }
});

// Obter detalhes de um auto específico
router.get('/:id', async (req, res) => {
  try {
    const auto = await AutoInfracao.findById(req.params.id);
    
    if (!auto) {
      return res.status(404).json({
        message: 'Auto de infração não encontrado',
        error: 'NOT_FOUND'
      });
    }
    
    res.json(auto);
  } catch (error) {
    console.error('Erro ao buscar detalhes do auto:', error);
    res.status(500).json({
      message: 'Erro ao buscar detalhes do auto de infração',
      error: error.message
    });
  }
});

/**
 * Rota para testar diretamente a consulta ao MongoDB
 * Útil para depuração de filtros
 */
router.get('/teste-direto', async (req, res) => {
  try {
    console.log('=========== TESTE DIRETO DE FILTRO ===========');
    const { termo } = req.query;
    console.log('Termo recebido:', termo);
    
    // Desabilitar cache
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    
    if (!termo || termo.trim() === '') {
      return res.status(400).json({ 
        mensagem: 'Termo de busca não fornecido',
        sucesso: false
      });
    }
    
    const searchTerm = termo.trim();
    const escapedSearchTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    
    // Consulta mais simples para teste
    const filter = {
      $or: [
        { numero_auto_infracao: { $regex: escapedSearchTerm, $options: 'i' } },
        { descricao_infracao: { $regex: escapedSearchTerm, $options: 'i' } },
        { infrator_nome: { $regex: escapedSearchTerm, $options: 'i' } }
      ]
    };
    
    console.log('Filtro de teste:', JSON.stringify(filter, null, 2));
    
    // Consulta direta sem paginação ou limite
    const autos = await AutoInfracao.find(filter).sort({ local_data: -1 }).limit(10);
    
    console.log(`Consulta direta: Encontrados ${autos.length} autos com o termo "${searchTerm}"`);
    
    if (autos.length === 0) {
      console.log('Executando consulta auxiliar para verificar se há dados...');
      const totalAutos = await AutoInfracao.countDocuments({});
      console.log(`Total de autos na base: ${totalAutos}`);
      
      if (totalAutos > 0) {
        const exemploAuto = await AutoInfracao.findOne({});
        console.log('Exemplo de auto para depuração:', {
          id: exemploAuto._id,
          numero: exemploAuto.numero_auto_infracao,
          infrator: exemploAuto.infrator_nome,
          descricao: exemploAuto.descricao_infracao?.substring(0, 100)
        });
      }
    }
    
    res.json({
      sucesso: true,
      termo_buscado: searchTerm,
      resultados: autos.length,
      autos: autos.map(auto => ({
        id: auto._id,
        numero: auto.numero_auto_infracao,
        infrator: auto.infrator_nome,
        descricao: auto.descricao_infracao
      }))
    });
  } catch (error) {
    console.error('Erro no teste direto:', error);
    res.status(500).json({
      sucesso: false,
      erro: error.message,
      pilha: error.stack
    });
  }
});

export default router; 