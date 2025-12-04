import { Fragment, useState, useEffect } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/24/solid';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import axios from '../config/axiosConfig';

function InfratorFilter() {
  const [selectedInfrator, setSelectedInfrator] = useState(null);
  const queryClient = useQueryClient();

  const { data: infratores = [], isLoading } = useQuery({
    queryKey: ['infratores'],
    queryFn: async () => {
      try {
        const { data } = await axios.get('/api/infratores');
        return data;
      } catch (error) {
        console.error('Erro ao buscar infratores:', error);
        return [];
      }
    },
    staleTime: 300000, // 5 minutos
    retry: 2
  });

  // Atualizar estado local quando o componente montar
  useEffect(() => {
    const currentInfratorNome = queryClient.getQueryData(['infrator']);
    if (currentInfratorNome) {
      // Encontrar o infrator correspondente na lista
      const infrator = infratores.find(i => i.nome === currentInfratorNome);
      if (infrator) {
        setSelectedInfrator(infrator);
      }
    }
  }, [queryClient, infratores]);

  const handleInfratorChange = (infrator) => {
    const infratorNome = infrator?.nome || '';
    const currentNome = selectedInfrator?.nome || '';
    
    if (infratorNome !== currentNome) {
      setSelectedInfrator(infrator);
      
      // Atualiza o queryClient com o nome do infrator (para manter compatibilidade com o backend)
      queryClient.setQueryData(['infrator'], infratorNome);
      
      // Adicionar logging para depuração
      console.log('[InfratorFilter] Alterado infrator para:', infratorNome);
      
      // Invalidar a query de autos para forçar uma nova busca
      queryClient.invalidateQueries({
        queryKey: ['autos'],
        exact: false,
        refetchActive: true
      });
    }
  };
  
  // Função auxiliar para formatar a exibição
  const formatInfratorDisplay = (infrator) => {
    if (!infrator) return 'Selecione um infrator';
    if (infrator.cnpj && infrator.cnpj !== 'null' && infrator.cnpj !== null) {
      return `${infrator.nome} - ${infrator.cnpj}`;
    }
    return infrator.nome;
  };

  if (isLoading) {
    return (
      <div className="w-full">
        <div className="input animate-pulse bg-gray-200 dark:bg-gray-700 h-10"></div>
      </div>
    );
  }

  // Verificar se há um infrator selecionado
  const temFiltroAtivo = selectedInfrator !== null;

  return (
    <div className="w-full">
      <Listbox value={selectedInfrator} onChange={handleInfratorChange}>
        <div className="relative">
          <Listbox.Button className={`input w-full text-left pl-3 pr-10 ${temFiltroAtivo ? 'border-blue-500 dark:border-blue-400' : ''}`}>
            <span className={`block truncate ${temFiltroAtivo ? 'font-medium text-blue-600 dark:text-blue-300' : ''}`} title={formatInfratorDisplay(selectedInfrator)}>
              {formatInfratorDisplay(selectedInfrator)}
            </span>
            <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
              <ChevronUpDownIcon className={`h-5 w-5 ${temFiltroAtivo ? 'text-blue-500' : 'text-gray-400'}`} />
            </span>
          </Listbox.Button>
          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Listbox.Options className="absolute z-10 w-full py-1 mt-1 overflow-auto text-base bg-white dark:bg-dark-card rounded-md shadow-lg max-h-60 ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
              <Listbox.Option
                key="todos"
                value={null}
                className={({ active }) =>
                  `cursor-default select-none relative py-2 pl-10 pr-4 ${
                    active ? 'text-primary bg-primary/10' : 'text-gray-900 dark:text-gray-100'
                  }`
                }
              >
                {({ selected }) => (
                  <>
                    <span className={`block break-words ${selected ? 'font-medium' : 'font-normal'}`}>
                      Todos os infratores
                    </span>
                    {selected && (
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-primary">
                        <CheckIcon className="h-5 w-5" />
                      </span>
                    )}
                  </>
                )}
              </Listbox.Option>
              {infratores.map((infrator, index) => (
                <Listbox.Option
                  key={`${infrator.nome}-${infrator.cnpj || index}`}
                  value={infrator}
                  className={({ active }) =>
                    `cursor-default select-none relative py-2 pl-10 pr-4 ${
                      active ? 'text-primary bg-primary/10' : 'text-gray-900 dark:text-gray-100'
                    }`
                  }
                >
                  {({ selected }) => (
                    <>
                      <span className={`block break-words ${selected ? 'font-medium' : 'font-normal'}`}>
                        {formatInfratorDisplay(infrator)}
                      </span>
                      {selected && (
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-primary">
                          <CheckIcon className="h-5 w-5" />
                        </span>
                      )}
                    </>
                  )}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </Transition>
        </div>
      </Listbox>
    </div>
  );
}

export default InfratorFilter;