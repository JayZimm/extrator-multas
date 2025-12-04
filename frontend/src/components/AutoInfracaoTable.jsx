import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import axios from '../config/axiosConfig';
import { ArrowDownTrayIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { Parser } from '@json2csv/plainjs';

function AutoInfracaoTable() {
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();
  // Estado para controlar o loading manualmente
  const [isManualLoading, setIsManualLoading] = useState(false);
  // Constante para o limite de registros por página
  const ITEMS_PER_PAGE = 10;

  // Observa o infrator selecionado
  const { data: infratorFiltro = '' } = useQuery({
    queryKey: ['infrator'],
    // A função apenas devolve o dado já presente no cache; não faz requisições HTTP
    queryFn: () => queryClient.getQueryData(['infrator']) ?? '',
    staleTime: Infinity,
    cacheTime: Infinity
  });

  // Observa o termo de busca
  const { data: termoBusca = '' } = useQuery({
    queryKey: ['search'],
    queryFn: () => queryClient.getQueryData(['search']) ?? '',
    staleTime: Infinity,
    cacheTime: Infinity
  });
  const navigate = useNavigate();
  const [filtroAtivo, setFiltroAtivo] = useState(false);

  // Reset da página quando o filtro muda
  useEffect(() => {
    console.log('[AutoInfracaoTable] Filtros atualizados', { termoBusca, infratorFiltro });
    setPage(1);
    setFiltroAtivo(!!termoBusca || !!infratorFiltro);
  }, [termoBusca, infratorFiltro]);

  // Função para limpar os filtros
  const limparFiltros = () => {
    queryClient.setQueryData(['search'], '');
    queryClient.setQueryData(['infrator'], '');
    queryClient.invalidateQueries(['search']);
    queryClient.invalidateQueries(['infrator']);
    queryClient.removeQueries(['autos']);
    queryClient.invalidateQueries(['autos']);
    setFiltroAtivo(false);
  };

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['autos', page, infratorFiltro, termoBusca],
    queryFn: async () => {
      try {
        console.log('Enviando requisição com parâmetros:', { page, limit: 10, infrator: infratorFiltro, search: termoBusca }); // Debug
        // Se tivermos o termo de busca, vamos garantir que seja enviado corretamente
        if (termoBusca) {
          console.log('[AutoInfracaoTable] Enviando termo de busca:', termoBusca);
        }
        
        // Se tivermos o infrator selecionado, vamos garantir que seja enviado corretamente
        if (infratorFiltro) {
          console.log('[AutoInfracaoTable] Enviando filtro de infrator:', infratorFiltro);
        }
        
        const { data } = await axios.get('/api/autos', {
          params: {
            page,
            limit: ITEMS_PER_PAGE,
            infrator: infratorFiltro,
            search: termoBusca,
            _t: new Date().getTime() // Adiciona timestamp para evitar cache
          }
        });
        
        // Log mais detalhado dos dados retornados pelo backend
        console.log('Dados recebidos:', {
          filtrosAplicados: data.filtros_aplicados,
          totalRegistros: data.total,
          registrosRetornados: data.autos.length
        });
        
        // Verificamos se os filtros aplicados pelo backend correspondem ao que enviamos
        if (termoBusca && data.filtros_aplicados.search !== termoBusca) {
          console.warn('[AutoInfracaoTable] ALERTA: Termo de busca enviado não corresponde ao aplicado pelo backend', 
            { enviado: termoBusca, aplicado: data.filtros_aplicados.search });
        }
        
        if (infratorFiltro && data.filtros_aplicados.infrator !== infratorFiltro) {
          console.warn('[AutoInfracaoTable] ALERTA: Filtro de infrator enviado não corresponde ao aplicado pelo backend', 
            { enviado: infratorFiltro, aplicado: data.filtros_aplicados.infrator });
        }
        
        return data;
      } catch (error) {
        console.error('Erro ao buscar autos:', error);
        throw error;
      }
    },
    staleTime: 1000, // Manter os dados válidos por 1 segundo
    cacheTime: 1000 * 60, // Manter em cache por 1 minuto
    keepPreviousData: true, // Manter os dados anteriores enquanto carrega novos dados
    refetchOnMount: true, // Sempre refazer a busca quando o componente é montado
    refetchOnWindowFocus: false, // Não fazer refetch quando a janela ganhar foco
    retry: 1 // Tentar novamente apenas uma vez em caso de falha
  });

  // Forçar refetch quando os parâmetros mudarem
  useEffect(() => {
    console.log('[AutoInfracaoTable] Valores para consulta:', {
      page,
      infrator: infratorFiltro,
      search: termoBusca
    });
    
    // Ativar loading manual antes de fazer refetch
    if (termoBusca || infratorFiltro) {
      setIsManualLoading(true);
    }
    
    // Executar refetch imediatamente quando qualquer parâmetro mudar
    console.log('[AutoInfracaoTable] Executando refetch imediato...');
    refetch();
  }, [page, infratorFiltro, termoBusca, refetch]);

  // Adicionamos um estado local para controlar o loading e evitar flickering
  const [localLoading, setLocalLoading] = useState(false);
  
  // Use um efeito para sincronizar isLoading com localLoading, mas com um atraso para saída
  useEffect(() => {
    if (isLoading) {
      // Se começou a carregar, atualizamos imediatamente
      setLocalLoading(true);
    } else {
      // Se terminou de carregar, esperamos um pouco para garantir que os dados foram renderizados
      const timer = setTimeout(() => {
        setLocalLoading(false);
        // Também desativamos o loading manual quando o isLoading termina
        setIsManualLoading(false);
        console.log('[AutoInfracaoTable] Estado de loading finalizado');
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  // Efeito para monitorar dados recebidos e garantir que o estado de loading seja desativado
  useEffect(() => {
    if (data && data.autos) {
      // Se temos dados, garantimos que o loading seja desativado após um breve delay
      const timer = setTimeout(() => {
        setLocalLoading(false);
        setIsManualLoading(false);
        console.log('[AutoInfracaoTable] Dados recebidos, desativando loading');
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [data]);

  const handleRowClick = (autoId) => {
    navigate(`/auto/${autoId}`);
  };

  // Função para formatar datas
  const formatarData = (dataStr) => {
    if (!dataStr) return 'N/A';
    
    try {
      const data = new Date(dataStr);
      return data.toLocaleDateString('pt-BR');
    } catch (e) {
      return 'N/A';
    }
  };

  const handleExport = async () => {
    try {
      const response = await axios.get('/api/autos/export', {
        params: {
          infrator: infratorFiltro,
          search: termoBusca,
          _t: new Date().getTime() // Adiciona timestamp para evitar cache
        },
        responseType: 'blob' // Importante para receber o arquivo
      });

      // Criar um link para download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'autos_infracao.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erro ao exportar autos:', error);
      alert('Erro ao exportar os dados. Por favor, tente novamente.');
    }
  };

  // Função para gerar array de páginas a exibir com reticências
  const getPageNumbers = () => {
    const totalPages = Math.ceil(data?.total / ITEMS_PER_PAGE) || 0;
    const current = page;
    const delta = 2; // Número de páginas para mostrar antes e depois da atual
    const pages = [];
    
    if (totalPages <= 7) {
      // Se tem 7 ou menos páginas, mostra todas
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Sempre mostra primeira página
      pages.push(1);
      
      // Calcula o range de páginas ao redor da atual
      const rangeStart = Math.max(2, current - delta);
      const rangeEnd = Math.min(totalPages - 1, current + delta);
      
      // Adiciona reticências se necessário (início)
      if (rangeStart > 2) {
        pages.push('...');
      }
      
      // Adiciona páginas do range
      for (let i = rangeStart; i <= rangeEnd; i++) {
        pages.push(i);
      }
      
      // Adiciona reticências se necessário (fim)
      if (rangeEnd < totalPages - 1) {
        pages.push('...');
      }
      
      // Sempre mostra última página
      pages.push(totalPages);
    }
    
    return pages;
  };

  // Verificar qualquer estado de loading (isLoading, localLoading, ou isManualLoading)
  if (isLoading || localLoading || isManualLoading) {
    console.log('[AutoInfracaoTable] Exibindo estado de loading', { isLoading, localLoading, isManualLoading });
    return (
      <div className="animate-pulse">
        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">Erro ao carregar os dados: {error.message}</p>
        <button 
          onClick={() => refetch()} 
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  if (!data?.autos?.length) {
    return (
      <div className="text-center py-8">
        {filtroAtivo ? (
          <>
            <p className="text-gray-500">Nenhum auto de infração encontrado para os filtros aplicados</p>
            <div className="mt-4 flex justify-center">
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-800">
                {termoBusca && <span className="mr-2">Busca: {termoBusca}</span>}
                {infratorFiltro && <span className="mr-2">Infrator: {infratorFiltro}</span>}
                <button 
                  onClick={limparFiltros}
                  className="ml-2 text-blue-600 hover:text-blue-800"
                >
                  <XCircleIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
            <button 
              onClick={limparFiltros} 
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
            >
              Limpar filtros
            </button>
          </>
        ) : (
          <p className="text-gray-500">Nenhum auto de infração encontrado</p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Autos de Infração
          {filtroAtivo && (
            <span className="ml-2 text-sm font-normal text-gray-500">
              (Filtrado)
            </span>
          )}
        </h2>
        <div className="flex gap-2">
          {filtroAtivo && (
            <button
              onClick={limparFiltros}
              className="btn-secondary flex items-center gap-1"
            >
              <XCircleIcon className="h-5 w-5" />
              Limpar filtros
            </button>
          )}
          <button
            onClick={handleExport}
            className="btn-primary"
            disabled={!data?.autos?.length}
          >
            <ArrowDownTrayIcon className="h-5 w-5" />
            Exportar CSV
          </button>
        </div>
      </div>
      
      {filtroAtivo && (
        <div className="flex flex-wrap gap-2 mb-2">
          {termoBusca && (
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
              <span>Busca: {termoBusca}</span>
            </div>
          )}
          {infratorFiltro && (
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
              <span>Infrator: {infratorFiltro}</span>
            </div>
          )}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-800">
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Número
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Data Autuação
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Infrator
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Data Emissão
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Data Expedição
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Situação
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-dark-card divide-y divide-gray-200 dark:divide-gray-700">
            {data.autos.map((auto) => (
              <tr 
                key={auto._id} 
                className="hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                onClick={() => handleRowClick(auto._id)}
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                  {auto.numero_auto_infracao}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                  {formatarData(auto.local_data)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                  {auto.infrator_nome}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                  {formatarData(auto.meta?.data_emissao_documento)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                  {formatarData(auto.meta?.data_expedicao_documento)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      auto.situacao === 'Pendente'
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                        : auto.situacao === 'Pago'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}
                  >
                    {auto.situacao}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {data.total > 0 && (
        <div className="flex items-center justify-between border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-dark-card px-4 py-3 sm:px-6">
          <div className="flex flex-1 justify-between sm:hidden">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="relative inline-flex items-center rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-dark-card px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anterior
            </button>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={page * ITEMS_PER_PAGE >= data.total}
              className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-dark-card px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Próxima
            </button>
          </div>
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Mostrando <span className="font-medium">{((page - 1) * ITEMS_PER_PAGE) + 1}</span> até{' '}
                <span className="font-medium">{Math.min(page * ITEMS_PER_PAGE, data.total)}</span> de{' '}
                <span className="font-medium">{data.total}</span> resultados
                {filtroAtivo && " (filtrados)"}
              </p>
            </div>
            <div>
              <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 dark:text-gray-500 ring-1 ring-inset ring-gray-300 dark:ring-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">Anterior</span>
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                  </svg>
                </button>
                {getPageNumbers().map((pageNumber, index) => {
                  if (pageNumber === '...') {
                    return (
                      <span
                        key={`ellipsis-${index}`}
                        className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 ring-1 ring-inset ring-gray-300 dark:ring-gray-600"
                      >
                        ...
                      </span>
                    );
                  }
                  
                  return (
                    <button
                      key={pageNumber}
                      onClick={() => setPage(pageNumber)}
                      className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                        pageNumber === page
                          ? 'z-10 bg-primary text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary'
                          : 'text-gray-900 dark:text-gray-100 ring-1 ring-inset ring-gray-300 dark:ring-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 focus:z-20 focus:outline-offset-0'
                      }`}
                    >
                      {pageNumber}
                    </button>
                  );
                })}
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page * ITEMS_PER_PAGE >= data.total}
                  className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 dark:text-gray-500 ring-1 ring-inset ring-gray-300 dark:ring-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">Próxima</span>
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                  </svg>
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AutoInfracaoTable; 