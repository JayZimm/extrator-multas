import { useState } from 'react';
import { testarConexao, testarFiltro, testarCORS } from '../config/testeConexao';

/**
 * Componente para diagnóstico e teste da API
 * Para usar: importe e adicione <TesteDiagnostico /> em qualquer parte da aplicação
 */
function TesteDiagnostico() {
  const [termoBusca, setTermoBusca] = useState('');
  const [resultado, setResultado] = useState(null);
  const [mensagem, setMensagem] = useState('');
  const [carregando, setCarregando] = useState(false);

  const testarConectividade = async () => {
    setMensagem('Testando conexão...');
    setCarregando(true);
    
    try {
      const resultado = await testarConexao();
      setResultado(resultado);
      setMensagem(resultado.sucesso ? 'Conexão estabelecida!' : 'Falha na conexão');
    } catch (error) {
      console.error('Erro no teste:', error);
      setResultado({ sucesso: false, erro: error.message });
      setMensagem('Erro ao executar teste');
    } finally {
      setCarregando(false);
    }
  };

  const testarBusca = async () => {
    if (!termoBusca.trim()) {
      setMensagem('Informe um termo para busca');
      return;
    }
    
    setMensagem(`Testando busca por "${termoBusca}"...`);
    setCarregando(true);
    
    try {
      const resultado = await testarFiltro(termoBusca);
      setResultado(resultado);
      setMensagem(resultado.sucesso 
        ? `Busca concluída: ${resultado.total} resultados encontrados` 
        : 'Falha na busca');
    } catch (error) {
      console.error('Erro no teste de busca:', error);
      setResultado({ sucesso: false, erro: error.message });
      setMensagem('Erro ao executar busca');
    } finally {
      setCarregando(false);
    }
  };

  const executarTesteCORS = async () => {
    setMensagem('Testando CORS...');
    setCarregando(true);
    
    try {
      const resultado = await testarCORS();
      setResultado(resultado);
      setMensagem(resultado.sucesso 
        ? 'CORS configurado corretamente!' 
        : 'Problema na configuração CORS');
    } catch (error) {
      console.error('Erro no teste de CORS:', error);
      setResultado({ sucesso: false, erro: error.message });
      setMensagem('Erro ao testar CORS');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 p-4 bg-white dark:bg-dark-card shadow-lg rounded-lg border border-gray-300 dark:border-gray-700 w-80">
      <h3 className="text-lg font-bold mb-2 flex justify-between items-center">
        <span>Diagnóstico de API</span>
        <span className="text-xs px-2 py-1 rounded bg-yellow-100 text-yellow-800">Debug</span>
      </h3>
      
      <div className="space-y-3">
        <div className="flex gap-2">
          <button 
            className="flex-1 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            onClick={testarConectividade}
            disabled={carregando}
          >
            Testar Conexão
          </button>
          <button 
            className="flex-1 px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50"
            onClick={executarTesteCORS}
            disabled={carregando}
          >
            Testar CORS
          </button>
        </div>
        
        <div className="flex gap-2">
          <input 
            type="text" 
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded dark:bg-gray-800"
            placeholder="Termo para busca" 
            value={termoBusca}
            onChange={(e) => setTermoBusca(e.target.value)}
            disabled={carregando}
          />
          <button 
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
            onClick={testarBusca}
            disabled={carregando}
          >
            Testar
          </button>
        </div>
        
        {mensagem && (
          <div className={`text-sm p-2 rounded ${
            mensagem.includes('Falha') || mensagem.includes('Erro') || mensagem.includes('Problema')
              ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
              : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
          }`}>
            {mensagem}
          </div>
        )}
        
        {resultado && (
          <div className="mt-2 text-xs">
            <div className="p-2 rounded bg-gray-100 dark:bg-gray-800 max-h-40 overflow-auto">
              <pre>{JSON.stringify(resultado, null, 2)}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default TesteDiagnostico;