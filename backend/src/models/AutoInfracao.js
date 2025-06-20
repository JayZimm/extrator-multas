import mongoose from 'mongoose';

const autoInfracaoSchema = new mongoose.Schema({
  numero_auto_infracao: {
    type: String,
    required: true,
    unique: true
  },
  infrator_nome: {
    type: String,
    required: true
  },
  infrator_cpf_cnpj: String,
  infrator_classificacao: String,
  veiculo_placa: String,
  veiculo_uf: String,
  veiculo_municipio: String,
  veiculo_marca: String,
  veiculo_modelo: String,
  veiculo_especie: String,
  veiculo_renavam: String,
  transportador_nome: String,
  transportador_cpf_cnpj: String,
  doc_tipo: String,
  doc_numero: String,
  doc_chave: String,
  doc_emissor_cpf_cnpj: String,
  doc_data_emissao: Date,
  local_infracao: String,
  local_data: Date,
  local_hora: String,
  local_uf: String,
  local_municipio: String,
  origem_uf: String,
  origem_municipio: String,
  destino_uf: String,
  destino_municipio: String,
  resolucao: String,
  codigo_infracao: String,
  artigo: String,
  inciso: String,
  alinea: String,
  descricao_infracao: String,
  amparo_legal: String,
  observacoes_agente: String,
  prazo_defesa_dias: Number,
  ordem_cessacao_pratica: String,
  agente_matricula: String,
  agente_data: Date,
  situacao: {
    type: String,
    enum: ['Pendente', 'Pago', 'Cancelado'],
    default: 'Pendente'
  },
  meta: {
    data_emissao_documento: Date,
    data_expedicao_documento: Date,
    fonte: String
  }
}, {
  timestamps: true,
  collection: 'autos_infracao'
});

// Índices para melhorar a performance das consultas
autoInfracaoSchema.index({ numero_auto_infracao: 1 });
autoInfracaoSchema.index({ infrator_nome: 1 });
autoInfracaoSchema.index({ local_data: -1 });
autoInfracaoSchema.index({ situacao: 1 });

const AutoInfracao = mongoose.model('AutoInfracao', autoInfracaoSchema);

export default AutoInfracao; 