import React, { useState } from 'react';
import { InformationCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';

const GoogleMapsHelp = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm flex items-center gap-1"
        title="Ajuda para configurar Google Maps"
      >
        <InformationCircleIcon className="h-4 w-4" />
        Como configurar o mapa?
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-dark-card rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Configuração do Google Maps
                </h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-4 text-sm">
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <h4 className="font-semibold text-red-800 dark:text-red-200 mb-2">
                    ❌ Erro atual: REQUEST_DENIED
                  </h4>
                  <p className="text-red-700 dark:text-red-300">
                    A Geocoding API não está habilitada ou a chave não tem permissões adequadas.
                  </p>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-3">
                    🔧 Solução: Configurar APIs no Google Cloud
                  </h4>
                  
                  <ol className="space-y-2 text-blue-700 dark:text-blue-300">
                    <li><strong>1.</strong> Acesse: <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer" className="underline">console.cloud.google.com</a></li>
                    <li><strong>2.</strong> Selecione ou crie um projeto</li>
                    <li><strong>3.</strong> Vá em "APIs e serviços" → "Biblioteca"</li>
                    <li><strong>4.</strong> Habilite essas APIs:
                      <ul className="ml-4 mt-1 space-y-1">
                        <li>• Maps JavaScript API</li>
                        <li>• <strong>Geocoding API</strong> (essencial!)</li>
                        <li>• Places API</li>
                      </ul>
                    </li>
                    <li><strong>5.</strong> Vá em "APIs e serviços" → "Credenciais"</li>
                    <li><strong>6.</strong> Crie ou edite uma chave de API</li>
                    <li><strong>7.</strong> Configure restrições:
                      <ul className="ml-4 mt-1 space-y-1">
                        <li>• Referenciadores HTTP: adicione <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">localhost:5173</code></li>
                        <li>• Ou deixe sem restrições para teste</li>
                      </ul>
                    </li>
                    <li><strong>8.</strong> Adicione a chave no arquivo <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">.env</code>:
                      <pre className="bg-gray-100 dark:bg-gray-800 p-2 rounded mt-2 text-xs">
VITE_GOOGLE_MAPS_API_KEY=sua_chave_aqui
                      </pre>
                    </li>
                  </ol>
                </div>

                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                  <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                    💡 Dicas importantes:
                  </h4>
                  <ul className="space-y-1 text-yellow-700 dark:text-yellow-300">
                    <li>• A <strong>Geocoding API</strong> é diferente da Maps JavaScript API</li>
                    <li>• Reinicie o servidor após alterar o .env</li>
                    <li>• Verifique se não há cotas excedidas</li>
                    <li>• Para produção, sempre configure restrições de segurança</li>
                  </ul>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Entendi
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default GoogleMapsHelp; 