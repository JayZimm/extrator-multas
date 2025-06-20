import React, { useEffect } from 'react';
import { useJsApiLoader } from '@react-google-maps/api';
import { GOOGLE_MAPS_MAP_ID } from '../config/mapConfig';

// Bibliotecas do Google Maps que queremos carregar
const libraries = ['places', 'geometry', 'marker'];

// Componente que carrega a API do Google Maps uma única vez e a mantém em memória
function GoogleMapsWrapper({ children, fallback }) {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries,
    mapIds: GOOGLE_MAPS_MAP_ID ? [GOOGLE_MAPS_MAP_ID] : undefined,
    preventGoogleFontsLoading: false,
  });

  useEffect(() => {
    if (isLoaded) {
      console.log('GoogleMapsWrapper: API carregada com sucesso.', GOOGLE_MAPS_MAP_ID ? `Usando Map ID: ${GOOGLE_MAPS_MAP_ID}` : 'Nenhum Map ID global fornecido ao loader.');
    }
    if (loadError) {
      console.error('GoogleMapsWrapper: Erro ao carregar Google Maps API:', loadError);
    }
  }, [isLoaded, loadError]);

  if (loadError) {
    return (
      <div className="flex items-center justify-center w-full h-full">
        <p className="text-red-500">
          Erro ao carregar o mapa. Por favor, tente novamente mais tarde.
        </p>
      </div>
    );
  }

  if (!isLoaded) {
    return fallback || (
      <div className="flex items-center justify-center w-full h-full">
        <p className="text-gray-500 dark:text-gray-400">
          Carregando API do Google Maps...
        </p>
      </div>
    );
  }

  return <>{children}</>;
}

export default GoogleMapsWrapper; 