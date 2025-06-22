const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Conectar ao MongoDB
mongoose.connect('mongodb+srv://arthur:Lola2170%40@cluster0.dm40ncb.mongodb.net/test?retryWrites=true&w=majority&appName=Cluster0', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('MongoDB conectado');
}).catch(err => {
  console.log('Erro ao conectar MongoDB:', err);
});

// Modelo
const mensagemSchema = new mongoose.Schema({
  nome: String,
  texto: String,
  data: { type: Date, default: Date.now }
});
const Mensagem = mongoose.model('Mensagem', mensagemSchema, 'mensagems');

// Socket.io
io.on('connection', socket => {
  console.log('Usuário conectado');

  socket.on('novaMensagem', async (msgData) => {
    const msg = new Mensagem(msgData);
    await msg.save();
    io.emit('mensagemRecebida', msg);
  });
});

app.get('/mensagens', async (req, res) => {
  const msgs = await Mensagem.find().sort({ data: 1 });
  res.send(msgs);
});

app.delete('/mensagens', async (req, res) => {
  const nome = req.query.nome;
  if (nome !== 'Lola2170') {
    return res.status(403).send({ erro: 'Usuário não autorizado para apagar mensagens' });
  }

  await Mensagem.deleteMany({});
  io.emit('chatLimpo');
  res.send({ mensagem: 'Mensagens apagadas com sucesso' });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
