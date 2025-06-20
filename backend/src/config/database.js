import mongoose from 'mongoose';

const config = {
  user: process.env.MONGODB_USER || 'dbardx',
  password: process.env.MONGODB_PASSWORD || 'rdxE10dba',
  host: process.env.MONGODB_HOST || '34.168.230.145',
  port: process.env.MONGODB_PORT || '27017',
  database: process.env.MONGODB_DATABASE || 'antt_multas'
};

const uri = `mongodb://${config.user}:${encodeURIComponent(config.password)}@${config.host}:${config.port}/${config.database}?authSource=admin`;

export const connectDB = async () => {
  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log('MongoDB conectado com sucesso!');
  } catch (error) {
    console.error('Erro ao conectar ao MongoDB:', error);
    process.exit(1);
  }
};

