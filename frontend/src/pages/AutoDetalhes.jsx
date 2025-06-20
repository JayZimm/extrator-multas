import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { DocumentTextIcon, MapPinIcon } from '@heroicons/react/24/outline';
import { GoogleMap, InfoWindow } from '@react-google-maps/api';
import GoogleMapsWrapper from '../components/GoogleMapsWrapper';
import GoogleMapsHelp from '../components/GoogleMapsHelp';
import { GOOGLE_MAPS_MAP_ID, DEFAULT_MAP_OPTIONS } from '../config/mapConfig';
import axios from 'axios';

// Obter a chave da API do Google Maps das variáveis de ambiente
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
//console.log("Chave do Google Maps:", GOOGLE_MAPS_API_KEY);
//console.log("Todas as variáveis de ambiente:", import.meta.env);

// Ícone personalizado para o marcador do mapa
const getCustomMarkerIcon = () => {
  if (window.google && window.google.maps) {
    return {
      url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
      scaledSize: new window.google.maps.Size(32, 32)
    };
  }
  return {
    url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
    scaledSize: { width: 32, height: 32 }
  };
};

function AutoDetalhes() {
  const { id } = useParams();
  const [mapCenter, setMapCenter] = useState(null);
  const [activeTab, setActiveTab] = useState('principal');
  const [selectedMarkerInfo, setSelectedMarkerInfo] = useState(null);
  const [geocodeStatus, setGeocodeStatus] = useState('idle');
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const [isGoogleMapsApiLoaded, setIsGoogleMapsApiLoaded] = useState(false);
  
  // Dados mockados para documentos envolvidos
  const documentosEnvolvidos = [
    { tipo: 'MDF-e', chave: '43250218542151000218580010000078011097258891', data: '20/03/25' },
    { tipo: 'CT-e', chave: '43250218542151000218570010000027891862342891', data: '20/03/25' }
  ];

  const { data: auto, isLoading, error } = useQuery({
    queryKey: ['auto', id],
    queryFn: async () => {
      try {
        const response = await axios.get(`/api/autos/${id}`);
        return response.data;
      } catch (err) {
        console.error('Erro ao buscar detalhes do auto:', err);
        throw err;
      }
    },
    enabled: !!id,
  });

  // Geocodificação do endereço
  useEffect(() => {
    if (auto?.local_infracao) {
      const geocodeAddress = async () => {
        setGeocodeStatus('loading');
        const endereco = [
          auto.local_infracao,
          auto.local_municipio,
          auto.local_uf,
          'Brasil'
        ].filter(Boolean).join(', ');

        if (!GOOGLE_MAPS_API_KEY) {
          console.warn('Chave da API Google Maps não encontrada. Usando coordenadas padrão.');
          setMapCenter({ lat: -27.5969, lng: -48.5495 });
          setGeocodeStatus('error');
          return;
        }

        try {
          const response = await axios.get(
            `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(endereco)}&key=${GOOGLE_MAPS_API_KEY}`
          );
          
          if (response.data.status === 'OK' && response.data.results.length > 0) {
            const { lat, lng } = response.data.results[0].geometry.location;
            setMapCenter({ lat, lng });
            setGeocodeStatus('success');
          } else {
            console.warn('Geocodificação falhou:', response.data.status);
            
            // Mensagens específicas para cada tipo de erro
            if (response.data.status === 'REQUEST_DENIED') {
              console.error('Geocoding API: REQUEST_DENIED - Verifique se a Geocoding API está habilitada no seu projeto Google Cloud e se a chave tem as permissões necessárias');
            } else if (response.data.status === 'OVER_QUERY_LIMIT') {
              console.error('Geocoding API: OVER_QUERY_LIMIT - Cota da API foi excedida');
            } else if (response.data.status === 'ZERO_RESULTS') {
              console.warn('Geocoding API: ZERO_RESULTS - Endereço não encontrado');
            }
            
            // Usar coordenadas da UF como fallback
            const coordenadasUF = obterCoordenadasUF(auto.local_uf);
            setMapCenter(coordenadasUF);
            setGeocodeStatus('error');
          }
        } catch (err) {
          console.error('Erro ao geocodificar endereço:', err);
          const coordenadasUF = obterCoordenadasUF(auto.local_uf);
          setMapCenter(coordenadasUF);
          setGeocodeStatus('error');
        }
      };
      geocodeAddress();
    } else if (auto) {
      console.warn('local_infracao não disponível, usando fallback por UF.');
      const coordenadasUF = obterCoordenadasUF(auto.local_uf);
      setMapCenter(coordenadasUF);
      setGeocodeStatus('error');
    }
  }, [auto]);

  // Efeito para verificar se a API do Google Maps está carregada
  useEffect(() => {
    const checkGoogleMapsApi = () => {
      if (window.google && window.google.maps) {
        setIsGoogleMapsApiLoaded(true);
        return true;
      }
      return false;
    };

    // Verificar imediatamente
    if (checkGoogleMapsApi()) {
      return;
    }

    // Se não estiver carregado, verificar periodicamente
    const interval = setInterval(() => {
      if (checkGoogleMapsApi()) {
        clearInterval(interval);
      }
    }, 100);

    return () => clearInterval(interval);
  }, []);

  // Criação e atualização do marcador
  useEffect(() => {
    if (mapRef.current && mapCenter && isGoogleMapsApiLoaded) {
      const map = mapRef.current;

      // Limpar marcador existente
      if (markerRef.current) {
        markerRef.current.setMap(null);
        markerRef.current = null;
      }

      try {
        // Criar novo marcador
        markerRef.current = new window.google.maps.Marker({
          map: map,
          position: mapCenter,
          title: auto?.local_infracao || 'Local da Infração',
          icon: getCustomMarkerIcon(),
          animation: window.google.maps.Animation.DROP
        });

        // Adicionar evento de clique
        markerRef.current.addListener('click', () => {
          setSelectedMarkerInfo({
            position: mapCenter,
            content: auto?.local_infracao || 'Local da Infração',
            municipioUf: `${auto?.local_municipio || ''} - ${auto?.local_uf || ''}`,
            dataHora: `${formatarData(auto?.local_data)} às ${auto?.local_hora || '--:--'}`
          });
        });

      } catch (e) {
        console.error('[AutoDetalhes] Erro ao criar marcador:', e);
      }
    }

    return () => {
      if (markerRef.current) {
        markerRef.current.setMap(null);
        markerRef.current = null;
      }
    };
  }, [mapCenter, auto, isGoogleMapsApiLoaded]);

  // Função para obter coordenadas aproximadas por UF
  const obterCoordenadasUF = (uf) => {
    const coordenadasPorUF = {
      'AC': { lat: -9.0238, lng: -70.812 },
      'AL': { lat: -9.5713, lng: -36.782 },
      'AM': { lat: -3.4168, lng: -65.8561 },
      'AP': { lat: 1.4087, lng: -51.7706 },
      'BA': { lat: -12.2907, lng: -42.5 },
      'CE': { lat: -5.4984, lng: -39.3206 },
      'DF': { lat: -15.7998, lng: -47.8645 },
      'ES': { lat: -19.5687, lng: -40.6803 },
      'GO': { lat: -15.9272, lng: -49.9917 },
      'MA': { lat: -5.0878, lng: -45.2773 },
      'MG': { lat: -18.5122, lng: -44.5550 },
      'MS': { lat: -20.4428, lng: -54.6458 },
      'MT': { lat: -12.6819, lng: -56.9211 },
      'PA': { lat: -4.2605, lng: -52.9562 },
      'PB': { lat: -7.1219, lng: -36.7270 },
      'PE': { lat: -8.4116, lng: -37.5919 },
      'PI': { lat: -7.7183, lng: -42.7289 },
      'PR': { lat: -24.8951, lng: -51.9580 },
      'RJ': { lat: -22.9027, lng: -43.2075 },
      'RN': { lat: -5.4026, lng: -36.9541 },
      'RO': { lat: -10.8631, lng: -63.2861 },
      'RR': { lat: 1.9981, lng: -61.3308 },
      'RS': { lat: -30.0277, lng: -51.2287 },
      'SC': { lat: -27.5954, lng: -48.5480 },
      'SE': { lat: -10.5741, lng: -37.3857 },
      'SP': { lat: -23.5436, lng: -46.6291 },
      'TO': { lat: -9.4658, lng: -48.0261 }
    };
    
    return coordenadasPorUF[uf] || { lat: -15.7801, lng: -47.9292 }; // Default: Brasília
  };

  // Função para formatar datas
  const formatarData = (dataStr) => {
    if (!dataStr) return 'N/A';
    
    try {
      const data = new Date(dataStr);
      return data.toLocaleDateString('pt-BR');
    } catch (e) {
      return dataStr;
    }
  };

  // Salvar referência ao mapa quando for carregado
  const onMapLoad = (mapInstance) => {
    console.log('[AutoDetalhes] Mapa carregado:', mapInstance);
    mapRef.current = mapInstance;
    
    // Se já temos as coordenadas, criar o marcador imediatamente
    if (mapCenter) {
      console.log('[AutoDetalhes] Criando marcador após carregamento do mapa');
      try {
        markerRef.current = new window.google.maps.Marker({
          map: mapInstance,
          position: mapCenter,
          title: auto?.local_infracao || 'Local da Infração',
          icon: getCustomMarkerIcon(),
          animation: window.google.maps.Animation.DROP
        });
        console.log('[AutoDetalhes] Marcador criado após carregamento do mapa');
      } catch (e) {
        console.error('[AutoDetalhes] Erro ao criar marcador após carregamento do mapa:', e);
      }
    }
  };

  // Função para renderizar o mapa
  const renderMap = () => {
    if (!mapCenter && geocodeStatus !== 'loading') {
      return (
        <div className="h-full w-full flex flex-col items-center justify-center p-4 text-center">
          <p className="text-gray-500 dark:text-gray-400 mb-2">Não foi possível determinar a localização exata.</p>
          <p className="text-sm text-gray-400 dark:text-gray-500">
            O endereço fornecido não pôde ser localizado no mapa.
          </p>
        </div>
      );
    }
    
    if (geocodeStatus === 'loading') {
      return (
        <div className="h-full w-full flex flex-col items-center justify-center p-4 text-center">
          <p className="text-gray-500 dark:text-gray-400 mb-2">Buscando localização...</p>
          <p className="text-sm text-gray-400 dark:text-gray-500">
            Aguarde enquanto tentamos localizar o endereço no mapa.
          </p>
        </div>
      );
    }

    if (!GOOGLE_MAPS_API_KEY) {
      return (
        <div className="h-full w-full flex flex-col items-center justify-center p-4 text-center">
          <p className="text-gray-500 dark:text-gray-400 mb-2">Mapa não disponível</p>
          <p className="text-sm text-gray-400 dark:text-gray-500">
            Chave da API do Google Maps não configurada.
          </p>
        </div>
      );
    }

    const getMapOptions = () => {
      const baseOptions = {
        ...DEFAULT_MAP_OPTIONS,
        mapId: GOOGLE_MAPS_MAP_ID,
        mapTypeControl: true,
        streetViewControl: true,
        fullscreenControl: false,
        zoomControl: true
      };

      // Verifica se os submódulos da API do Google Maps estão carregados
      if (window.google && 
          window.google.maps && 
          window.google.maps.MapTypeControlStyle && 
          window.google.maps.ControlPosition) {
        return {
          ...baseOptions,
          mapTypeControlOptions: {
            style: window.google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
            position: window.google.maps.ControlPosition.TOP_RIGHT
          }
        };
      }

      // Retorna apenas as opções base se os submódulos não estiverem prontos
      return baseOptions;
    };

    return (
      <GoogleMap
        mapContainerStyle={{ width: '100%', height: '100%' }}
        center={mapCenter}
        zoom={15}
        onLoad={onMapLoad}
        options={getMapOptions()}
      >
        {selectedMarkerInfo && (
          <InfoWindow
            position={selectedMarkerInfo.position}
            onCloseClick={() => setSelectedMarkerInfo(null)}
          >
            <div className="bg-white p-2 max-w-xs">
              <p className="font-semibold text-sm">{selectedMarkerInfo.content}</p>
              <p className="text-xs text-gray-600">{selectedMarkerInfo.municipioUf}</p>
              <p className="text-xs text-gray-600 mt-1">{selectedMarkerInfo.dataHora}</p>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <p className="text-gray-600 dark:text-gray-300">Carregando detalhes do auto...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 dark:bg-red-900 p-4 rounded-md">
        <h2 className="text-lg font-semibold text-red-700 dark:text-red-300">Erro ao carregar detalhes</h2>
        <p className="text-red-600 dark:text-red-400">{error.message}</p>
      </div>
    );
  }

  if (!auto) {
    return (
      <div className="text-center">
        <h2 className="text-xl font-semibold">Auto de infração não encontrado</h2>
      </div>
    );
  }

  // Informação de um campo
  const InfoItem = ({ label, value, className = "" }) => {
    if (value === null || value === undefined || value === "") return null;
    
    return (
      <div className={className}>
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</h3>
        <p className="mt-1 text-gray-900 dark:text-white">{value}</p>
      </div>
    );
  };

  // Construir o endereço para exibição
  const enderecoCompleto = [
    auto.local_infracao,
    auto.local_municipio ? `${auto.local_municipio}${auto.local_uf ? ` - ${auto.local_uf}` : ''}` : auto.local_uf
  ].filter(Boolean).join(', ');

  return (
    <div>
      {/* Título da página */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Auto de Infração: {auto?.numero_auto_infracao || 'Carregando...'}
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Detalhes do Auto - Lado Esquerdo */}
        <div className="space-y-6">
          {/* Abas para organizar as informações */}
          <div className="bg-white dark:bg-dark-card rounded-lg shadow overflow-hidden">
            <div className="border-b border-gray-200 dark:border-gray-700">
              <nav className="flex -mb-px">
                {['principal', 'veiculo', 'documentos', 'infracao', 'agente'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`py-4 px-6 text-sm font-medium capitalize ${
                      activeTab === tab
                        ? 'border-b-2 border-primary text-primary'
                        : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                    }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </nav>
            </div>

            <div className="p-6">
              {/* Seção Principal */}
              {activeTab === 'principal' && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Situação</h3>
                    <p className="mt-1">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        auto?.situacao === 'Pendente'
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                          : auto?.situacao === 'Pago'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }`}>
                        {auto?.situacao || 'Pendente'}
                      </span>
                    </p>
                  </div>
                  
                  <InfoItem label="Número do Auto" value={auto?.numero_auto_infracao} />
                  
                  <InfoItem label="Infrator" value={auto?.infrator_nome} />
                  <InfoItem label="CNPJ/CPF do Infrator" value={auto?.infrator_cpf_cnpj} />
                  <InfoItem label="Classificação do Infrator" value={auto?.infrator_classificacao} />
                  
                  <InfoItem label="Data da Infração" value={formatarData(auto?.local_data)} />
                  <InfoItem label="Hora da Infração" value={auto?.local_hora} />
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Local da Infração</h3>
                    <p className="mt-1 text-gray-900 dark:text-white">{enderecoCompleto}</p>
                    {geocodeStatus === 'success' && (
                      <p className="text-xs text-green-600 dark:text-green-400 mt-1 flex items-center">
                        <MapPinIcon className="h-3 w-3 mr-1" />
                        Localização exata encontrada
                      </p>
                    )}
                    {geocodeStatus === 'error' && (
                      <p className="text-xs text-amber-600 dark:text-amber-400 mt-1 flex items-center">
                        <MapPinIcon className="h-3 w-3 mr-1" />
                        Localização aproximada (baseada na UF)
                      </p>
                    )}
                    {geocodeStatus === 'loading' && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center">
                        <MapPinIcon className="h-3 w-3 mr-1" />
                        Buscando localização...
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Seção Veículo */}
              {activeTab === 'veiculo' && (
                <div className="space-y-4">
                  <InfoItem label="Placa" value={auto?.veiculo_placa} />
                  <InfoItem label="UF" value={auto?.veiculo_uf} />
                  <InfoItem label="Município" value={auto?.veiculo_municipio} />
                  <InfoItem label="Marca" value={auto?.veiculo_marca} />
                  <InfoItem label="Modelo" value={auto?.veiculo_modelo} />
                  <InfoItem label="Espécie" value={auto?.veiculo_especie} />
                  <InfoItem label="RENAVAM" value={auto?.veiculo_renavam} />
                  
                  <InfoItem label="Transportador" value={auto?.transportador_nome} />
                  <InfoItem label="CNPJ/CPF do Transportador" value={auto?.transportador_cpf_cnpj} />
                  
                  <InfoItem label="Origem UF" value={auto?.origem_uf} />
                  <InfoItem label="Origem Município" value={auto?.origem_municipio} />
                  <InfoItem label="Destino UF" value={auto?.destino_uf} />
                  <InfoItem label="Destino Município" value={auto?.destino_municipio} />
                </div>
              )}

              {/* Seção Documentos */}
              {activeTab === 'documentos' && (
                <div className="space-y-4">
                  <InfoItem label="Tipo de Documento" value={auto?.doc_tipo} />
                  <InfoItem label="Número do Documento" value={auto?.doc_numero} />
                  <InfoItem label="Chave do Documento" value={auto?.doc_chave} />
                  <InfoItem label="CNPJ/CPF do Emissor" value={auto?.doc_emissor_cpf_cnpj} />
                  <InfoItem label="Data de Emissão" value={formatarData(auto?.doc_data_emissao)} />
                  <InfoItem label="Data de Emissão do Documento (Meta)" value={formatarData(auto?.meta?.data_emissao_documento)} />
                  <InfoItem label="Data de Expedição do Documento (Meta)" value={formatarData(auto?.meta?.data_expedicao_documento)} />
                  <InfoItem label="Fonte (Meta)" value={auto?.meta?.fonte} />
                </div>
              )}

              {/* Seção Infração */}
              {activeTab === 'infracao' && (
                <div className="space-y-4">
                  <InfoItem label="Resolução" value={auto?.resolucao} />
                  <InfoItem label="Código da Infração" value={auto?.codigo_infracao} />
                  <InfoItem label="Artigo" value={auto?.artigo} />
                  <InfoItem label="Inciso" value={auto?.inciso} />
                  <InfoItem label="Alínea" value={auto?.alinea} />
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Descrição da Infração</h3>
                    <p className="mt-1 text-gray-900 dark:text-white whitespace-pre-line">{auto?.descricao_infracao}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Amparo Legal</h3>
                    <p className="mt-1 text-gray-900 dark:text-white whitespace-pre-line">{auto?.amparo_legal}</p>
                  </div>
                  
                  <InfoItem label="Prazo para Defesa (dias)" value={auto?.prazo_defesa_dias} />
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Ordem de Cessação da Prática</h3>
                    <p className="mt-1 text-gray-900 dark:text-white whitespace-pre-line">{auto?.ordem_cessacao_pratica}</p>
                  </div>
                </div>
              )}

              {/* Seção Agente */}
              {activeTab === 'agente' && (
                <div className="space-y-4">
                  <InfoItem label="Matrícula do Agente" value={auto?.agente_matricula} />
                  <InfoItem label="Data do Agente" value={formatarData(auto?.agente_data)} />
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Observações do Agente</h3>
                    <p className="mt-1 text-gray-900 dark:text-white whitespace-pre-line">{auto?.observacoes_agente}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="space-y-6">
          {/* Mapa - Lado Direito Superior */}
          <div className="bg-white dark:bg-dark-card rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Mapa do Local</h2>
              {geocodeStatus === 'error' && <GoogleMapsHelp />}
            </div>
            
            <div className="h-64 w-full bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden relative">
              <GoogleMapsWrapper
                fallback={
                  <div className="h-full w-full flex items-center justify-center">
                    <p className="text-gray-500 dark:text-gray-400">Carregando API do Google Maps...</p>
                  </div>
                }
              >
                {renderMap()}
              </GoogleMapsWrapper>
              
              {/* Indicador de status da geocodificação */}
              {geocodeStatus === 'error' && (
                <div className="absolute bottom-2 left-2 right-2 bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200 p-2 rounded text-sm">
                  <p className="font-medium">Localização aproximada</p>
                  <p className="text-xs">O endereço exato não pôde ser localizado. Mostrando localização aproximada baseada na UF.</p>
                </div>
              )}
            </div>
            
            <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              {enderecoCompleto}
            </div>
          </div>
          
          {/* Documentos Envolvidos - Lado Direito Inferior */}
          <div className="bg-white dark:bg-dark-card rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Documentos Envolvidos</h2>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Tipo
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Chave
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Data
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-dark-card divide-y divide-gray-200 dark:divide-gray-700">
                  {documentosEnvolvidos.map((doc, index) => (
                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        {doc.tipo}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {doc.chave}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        {doc.data}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        <button 
                          className="text-primary hover:text-primary-dark"
                          title="Visualizar documento"
                        >
                          <DocumentTextIcon className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AutoDetalhes; 