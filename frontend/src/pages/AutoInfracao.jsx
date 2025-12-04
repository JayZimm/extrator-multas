import React from 'react';
import AutoInfracaoTable from '../components/AutoInfracaoTable';
import SearchBar from '../components/SearchBar';
import InfratorFilter from '../components/InfratorFilter';

const AutoInfracao = () => {
  return (
    <div className="space-y-6">
      {/* Header da Página */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Autos de Infração ANTT
        </h2>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Consulte e gerencie os autos de infração registrados no sistema.
        </p>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 sm:max-w-md">
          <SearchBar />
        </div>
        <div className="flex-1 sm:max-w-md">
          <InfratorFilter />
        </div>
      </div>

      {/* Tabela */}
      <div className="bg-white dark:bg-dark-card rounded-lg shadow">
        <AutoInfracaoTable />
      </div>
    </div>
  );
};

export default AutoInfracao; 