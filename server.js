const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Conexão com o MongoDB (ajuste se necessário)
mongoose.connect('mongodb+srv://arthur:Lola2170@cluster0.dm40ncb.mongodb.net/test?retryWrites=true&w=majority&appName=Cluster0', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('✅ MongoDB conectado');
}).catch(err => {
  console.error('❌ Erro ao conectar no MongoDB:', err);
});

// Modelo de Mensagem
const mensagemSchema = new mongoose.Schema({
  nome: String,
  texto: String,
  data: { type: Date, default: Date.now }
});
const Mensagem = mongoose.model('Mensagem', mensagemSchema, 'mensagems');

// WebSocket
io.on('connection', socket => {
  console.log('🔌 Novo usuário conectado');

  socket.on('novaMensagem', async (msgData) => {
    const msg = new Mensagem(msgData);
    await msg.save();
    io.emit('mensagemRecebida', msg);
  });
});

// API REST
app.get('/mensagens', async (req, res) => {
  const mensagens = await Mensagem.find().sort({ data: 1 });
  res.send(mensagens);
});

app.delete('/mensagens', async (req, res) => {
  const nome = req.query.nome;
  if (nome !== 'Lola2170') {
    return res.status(403).json({ erro: 'Apenas Lola2170 pode apagar as mensagens' });
  }

  try {
    await Mensagem.deleteMany({});
    io.emit('chatLimpo');
    res.json({ mensagem: 'Mensagens apagadas com sucesso!' });
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao apagar mensagens', detalhes: err });
  }
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
