import { useState, useEffect } from 'react';
import { MagnifyingGlassIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { useQueryClient } from '@tanstack/react-query';
import axios from '../config/axiosConfig';

function SearchBar() {
  const [search, setSearch] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const queryClient = useQueryClient();
  
  // Ao montar o componente, verificar se já existe um termo de busca
  useEffect(() => {
    const currentSearch = queryClient.getQueryData(['search']);
    if (currentSearch) {
      setSearch(currentSearch);
    }
  }, [queryClient]);

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearch(value);
    setErrorMessage('');
  };
  
  const limparBusca = () => {
    setSearch('');
    queryClient.setQueryData(['search'], '');
    queryClient.removeQueries(['autos']);
    queryClient.invalidateQueries(['autos']);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Limpa espaços em branco extras
    const trimmedSearch = search.trim();
    
    console.log('Iniciando busca por:', trimmedSearch);
    
    // Inicia o estado de busca
    setIsSearching(true);
    setErrorMessage('');
    
    try {
      // IMPORTANTE: Primeiro definimos o termo de busca no queryClient
      // para que os componentes que observam possam reagir imediatamente
      queryClient.setQueryData(['search'], trimmedSearch);
      console.log('[SearchBar] Termo de busca definido:', trimmedSearch);
      
      // Invalidar a query para forçar os observers a atualizarem
      await queryClient.invalidateQueries({
        queryKey: ['search'],
        exact: true
      });
      
      // Teste direto de conectividade com o backend
      // Fazendo uma requisição direto ao backend para confirmar conectividade
      const testResponse = await axios.get('/api/autos', {
        params: {
          page: 1,
          limit: 1,
          search: trimmedSearch,
          _t: new Date().getTime()
        }
      });
      
      console.log('Teste de conectividade bem-sucedido:', testResponse.data);
      
      // IMPORTANTE: Não remover o cache completamente, apenas invalidar para forçar refetch
      // Isso evita perder o valor de 'search' no cache
      
      // Log para verificar se o valor está presente no cache
      console.log('[SearchBar] Valor em cache para "search":', queryClient.getQueryData(['search']));
      
      try {
        // Invalidar a query de autos para forçar uma nova requisição
        await queryClient.invalidateQueries({
          queryKey: ['autos'],
          exact: false,
          refetchActive: true
        });

        // Esperar um pequeno tempo para garantir que a invalidação seja processada
        await new Promise(resolve => setTimeout(resolve, 50));

        // Então force um refetch explícito para garantir que os dados sejam atualizados
        await queryClient.refetchQueries({
          queryKey: ['autos'],
          type: 'active',
          exact: false
        });
      } finally {
        // Garante que o estado de busca é finalizado mesmo se houver erro no refetch
        // Adicionamos um pequeno delay para feedback visual
        setTimeout(() => {
          setIsSearching(false);
          console.log('[SearchBar] Estado de busca finalizado');
        }, 300);
      }
    } catch (error) {
      console.error('Erro ao realizar busca:', error);
      setErrorMessage(`Erro ao buscar: ${error.message}. Verifique o console para mais detalhes.`);
      setIsSearching(false);
    }
  };

  // Verificar se existe termo de busca atual
  const temBuscaAtiva = search.trim() !== '';

  return (
    <div className="flex-1">
      <form onSubmit={handleSubmit} className="flex">
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="input pl-10 w-full rounded-r-none"
            placeholder="Buscar por número do auto, descrição ou infrator..."
            value={search}
            onChange={handleSearch}
          />
          {temBuscaAtiva && (
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              onClick={limparBusca}
            >
              <XCircleIcon className="h-5 w-5" />
            </button>
          )}
        </div>
        <button 
          type="submit" 
          className={`px-4 flex items-center rounded-l-none transition-colors ${
            isSearching 
              ? "bg-blue-600 text-white"
              : "btn-primary"
          }`}
          disabled={isSearching}
        >
          {isSearching ? 'Buscando...' : 'Buscar'}
        </button>
      </form>
      {errorMessage && (
        <div className="mt-2 p-2 bg-red-100 border border-red-400 text-red-700 text-sm rounded">
          {errorMessage}
        </div>
      )}
      <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
        Digite parte do número, descrição ou nome do infrator
      </div>
    </div>
  );
}

export default SearchBar; 