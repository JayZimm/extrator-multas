/**
 * Configurações para a API do Google Maps
 * 
 * Substitua estas chaves pelas suas chaves reais e adicione o mapId gerado
 * no console do Google Cloud Platform (https://console.cloud.google.com)
 */

// Map ID para os Advanced Markers
export const GOOGLE_MAPS_MAP_ID = '18d275fa73dd63b460ab4253'; // Preencha com seu Map ID

// Opções padrão para o mapa
export const DEFAULT_MAP_OPTIONS = {
  fullscreenControl: false,
  streetViewControl: false,
  mapTypeControl: false,
  gestureHandling: 'cooperative',
  styles: [
    {
      featureType: 'poi',
      elementType: 'labels',
      stylers: [{ visibility: 'off' }]
    }
  ]
}; 