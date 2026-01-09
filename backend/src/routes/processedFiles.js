import express from 'express';
import path from 'path';
import AutoInfracao from '../models/AutoInfracao.js';
import gcsService from '../services/gcsService.js';

const router = express.Router();

/**
 * GET /api/processed-files/list
 * Lista arquivos processados com contagem de Autos relacionados
 * Query params: fileName, infrator, dataExpedicaoInicio, dataExpedicaoFim, dataEmissaoInicio, dataEmissaoFim
 */
router.get('/list', async (req, res) => {
    try {
        console.log('=========== LISTANDO ARQUIVOS PROCESSADOS ===========');
        const { fileName, infrator, dataExpedicaoInicio, dataExpedicaoFim, dataEmissaoInicio, dataEmissaoFim } = req.query;
        console.log('Filtros recebidos:', { fileName, infrator, dataExpedicaoInicio, dataExpedicaoFim, dataEmissaoInicio, dataEmissaoFim });

        // Desabilitar cache
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
        res.setHeader('Surrogate-Control', 'no-store');

        // Construir filtro de match para a agregação
        const matchFilter = {};

        // Filtro por nome do arquivo (busca parcial no numero_auto_infracao ou arquivo_origem)
        if (fileName && fileName.trim() !== '') {
            const fileNameRegex = new RegExp(fileName.trim(), 'i');
            matchFilter.$or = [
                { 'meta.arquivo_origem': fileNameRegex },
                { numero_auto_infracao: fileNameRegex }
            ];
        }

        // Filtro por infrator (busca parcial)
        if (infrator && infrator.trim() !== '') {
            matchFilter.infrator_nome = { $regex: infrator.trim(), $options: 'i' };
        }

        // Filtro por intervalo de data de expedição
        // Datas armazenadas como strings no formato "YYYY-MM-DD"
        if (dataExpedicaoInicio || dataExpedicaoFim) {
            matchFilter['meta.data_expedicao_documento'] = {};
            if (dataExpedicaoInicio) {
                matchFilter['meta.data_expedicao_documento'].$gte = dataExpedicaoInicio;
            }
            if (dataExpedicaoFim) {
                matchFilter['meta.data_expedicao_documento'].$lte = dataExpedicaoFim;
            }
        }

        // Filtro por intervalo de data de emissão
        // Datas armazenadas como strings no formato "YYYY-MM-DD"
        if (dataEmissaoInicio || dataEmissaoFim) {
            matchFilter['meta.data_emissao_documento'] = {};
            if (dataEmissaoInicio) {
                matchFilter['meta.data_emissao_documento'].$gte = dataEmissaoInicio;
            }
            if (dataEmissaoFim) {
                matchFilter['meta.data_emissao_documento'].$lte = dataEmissaoFim;
            }
        }

        console.log('Filtro MongoDB construído:', JSON.stringify(matchFilter, null, 2));

        // Pipeline de agregação com filtros
        const pipeline = [];

        // Adicionar $match se houver filtros
        if (Object.keys(matchFilter).length > 0) {
            pipeline.push({ $match: matchFilter });
        }

        // Agrupar por arquivo
        pipeline.push({
            $group: {
                _id: {
                    $ifNull: ['$meta.arquivo_origem', { $concat: ['$numero_auto_infracao', '.pdf'] }]
                },
                count: { $sum: 1 },
                firstProcessedAt: { $min: '$createdAt' },
                infratores: { $addToSet: '$infrator_nome' } // Lista de infratores únicos
            }
        });

        // Ordenar por data de processamento
        pipeline.push({ $sort: { firstProcessedAt: -1 } });

        console.log('Pipeline de agregação:', JSON.stringify(pipeline, null, 2));

        // Executar agregação
        const autosWithFiles = await AutoInfracao.aggregate(pipeline);

        console.log(`Encontrados ${autosWithFiles.length} arquivos processados no MongoDB (com filtros aplicados)`);

        // Buscar arquivos do GCS para validar existência
        let gcsFiles = [];
        try {
            const gcsResult = await gcsService.listObjects('', 1, 1000);
            gcsFiles = gcsResult.items || [];
        } catch (error) {
            console.warn('Erro ao buscar arquivos do GCS:', error.message);
        }

        // Combinar dados
        const files = autosWithFiles.map(item => ({
            path: item._id,
            name: path.basename(item._id),
            autosCount: item.count,
            processedAt: item.firstProcessedAt,
            existsInGCS: gcsFiles.some(f => f.path === item._id),
            infratores: item.infratores || []
        }));

        console.log(`Retornando ${files.length} arquivos processados`);
        console.log('=========== FIM DA LISTAGEM ===========');

        res.json({
            success: true,
            data: files,
            filters: { fileName, infrator, dataExpedicaoInicio, dataExpedicaoFim, dataEmissaoInicio, dataEmissaoFim }
        });
    } catch (error) {
        console.error('Erro ao listar arquivos processados:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao listar arquivos processados',
            error: error.message
        });
    }
});

/**
 * DELETE /api/processed-files/:filePath
 * Exclui um arquivo específico e seus Autos relacionados
 */
router.delete('/:filePath(*)', async (req, res) => {
    try {
        const filePath = req.params.filePath;
        console.log(`=========== EXCLUINDO ARQUIVO: ${filePath} ===========`);

        if (!filePath) {
            return res.status(400).json({
                success: false,
                message: 'Caminho do arquivo é obrigatório'
            });
        }

        // Extrair nome do arquivo sem extensão
        const fileName = path.basename(filePath, path.extname(filePath));

        // Estratégia dupla de busca
        const filter = {
            $or: [
                { 'meta.arquivo_origem': filePath },
                { numero_auto_infracao: fileName }
            ]
        };

        // Buscar Autos relacionados ao arquivo
        const autos = await AutoInfracao.find(filter);
        console.log(`Encontrados ${autos.length} Autos relacionados ao arquivo`);

        if (autos.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Nenhum Auto de Infração encontrado para este arquivo'
            });
        }

        // Excluir Autos do MongoDB
        const deleteResult = await AutoInfracao.deleteMany(filter);
        console.log(`${deleteResult.deletedCount} Autos excluídos do MongoDB`);

        // Excluir arquivo físico do GCS
        try {
            await gcsService.deleteObject(filePath);
            console.log(`Arquivo ${filePath} excluído do GCS`);
        } catch (error) {
            console.warn(`Tentativa de exclusão direta falhou: ${error.message}`);
            // Se falhar, tentar buscar o arquivo pelo nome e excluir
            try {
                const fileName = path.basename(filePath);
                console.log(`Buscando local real do arquivo ${fileName}...`);
                const realPath = await gcsService.findFile(fileName);

                if (realPath) {
                    console.log(`Arquivo encontrado em: ${realPath}. Tentando excluir...`);
                    await gcsService.deleteObject(realPath);
                    console.log(`Arquivo ${realPath} excluído do GCS com sucesso`);
                } else {
                    console.warn(`Arquivo não encontrado em nenhum local do bucket.`);
                }
            } catch (findError) {
                console.error(`Erro na busca/exclusão secundária: ${findError.message}`);
            }
        }

        console.log('=========== EXCLUSÃO CONCLUÍDA ===========');

        res.json({
            success: true,
            data: {
                deletedFile: filePath,
                deletedAutosCount: deleteResult.deletedCount,
                autosIds: autos.map(a => a._id)
            }
        });
    } catch (error) {
        console.error('Erro ao excluir arquivo processado:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao excluir arquivo processado',
            error: error.message
        });
    }
});

/**
 * POST /api/processed-files/batch-delete
 * Exclui múltiplos arquivos em lote
 */
router.post('/batch-delete', async (req, res) => {
    try {
        const { filePaths } = req.body;
        console.log(`=========== EXCLUSÃO EM LOTE: ${filePaths?.length || 0} arquivos ===========`);

        if (!filePaths || !Array.isArray(filePaths) || filePaths.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Lista de arquivos é obrigatória'
            });
        }

        const results = [];

        // Processar cada arquivo
        for (const filePath of filePaths) {
            try {
                const fileName = path.basename(filePath, path.extname(filePath));

                const filter = {
                    $or: [
                        { 'meta.arquivo_origem': filePath },
                        { numero_auto_infracao: fileName }
                    ]
                };

                // Buscar e excluir Autos
                const autos = await AutoInfracao.find(filter);
                const deleteResult = await AutoInfracao.deleteMany(filter);

                // Tentar excluir arquivo do GCS
                try {
                    await gcsService.deleteObject(filePath);
                } catch (error) {
                    console.warn(`Erro ao excluir ${filePath} do GCS. Tentando buscar...`);
                    // Fallback: buscar e excluir
                    try {
                        const fileNameBase = path.basename(filePath);
                        const realPath = await gcsService.findFile(fileNameBase);
                        if (realPath) {
                            await gcsService.deleteObject(realPath);
                            console.log(`Arquivo encontrado e excluído de: ${realPath}`);
                        }
                    } catch (findError) {
                        console.warn(`Falha no fallback de exclusão para ${filePath}: ${findError.message}`);
                    }
                }

                results.push({
                    file: filePath,
                    success: true,
                    deletedAutosCount: deleteResult.deletedCount,
                    autosIds: autos.map(a => a._id)
                });

                console.log(`✅ ${filePath}: ${deleteResult.deletedCount} Autos excluídos`);
            } catch (error) {
                results.push({
                    file: filePath,
                    success: false,
                    error: error.message
                });
                console.error(`❌ ${filePath}: ${error.message}`);
            }
        }

        const successCount = results.filter(r => r.success).length;
        const failureCount = results.filter(r => !r.success).length;

        console.log(`=========== EXCLUSÃO EM LOTE CONCLUÍDA: ${successCount} sucesso, ${failureCount} falhas ===========`);

        res.json({
            success: failureCount === 0,
            data: {
                results,
                totalFiles: filePaths.length,
                successCount,
                failureCount
            }
        });
    } catch (error) {
        console.error('Erro na exclusão em lote:', error);
        res.status(500).json({
            success: false,
            message: 'Erro na exclusão em lote',
            error: error.message
        });
    }
});

export default router;
