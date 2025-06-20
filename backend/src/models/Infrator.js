import mongoose from 'mongoose';

const infratorSchema = new mongoose.Schema({
  nome: {
    type: String,
    required: true,
    unique: true
  },
  cnpj: {
    type: String,
    sparse: true
  },
  cpf: {
    type: String,
    sparse: true
  },
  endereco: {
    logradouro: String,
    numero: String,
    complemento: String,
    bairro: String,
    cidade: String,
    estado: String,
    cep: String
  },
  contato: {
    telefone: String,
    email: String
  }
}, {
  timestamps: true,
  collection: 'infratores' // Especificando o nome da coleção
});

// Índices para melhorar a performance das consultas
infratorSchema.index({ nome: 1 });
infratorSchema.index({ cnpj: 1 });
infratorSchema.index({ cpf: 1 });

const Infrator = mongoose.model('Infrator', infratorSchema);

export default Infrator; 