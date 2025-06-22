const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Conectar ao MongoDB (cole sua string de conexão aqui)
mongoose.connect((process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true }), {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('MongoDB conectado');
}).catch(err => {
  console.log('Erro ao conectar MongoDB:', err);
});

// Modelo da mensagem
const mensagemSchema = new mongoose.Schema({
  nome: String,
  texto: String,
  data: { type: Date, default: Date.now }
});

const Mensagem = mongoose.model('Mensagem', mensagemSchema);

// Rota para salvar mensagem
app.post('/mensagens', async (req, res) => {
  try {
    const msg = new Mensagem(req.body);
    await msg.save();
    res.status(201).send(msg);
  } catch (err) {
    res.status(400).send(err);
  }
});

// Rota para buscar mensagens
app.get('/mensagens', async (req, res) => {
  try {
    const msgs = await Mensagem.find().sort({ data: 1 });
    res.send(msgs);
  } catch (err) {
    res.status(500).send(err);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

// Rota para apagar todas as mensagens (apenas se nome for Lola2170 - verificado no front-end)
app.delete('/mensagens', async (req, res) => {
  try {
    await Mensagem.deleteMany({});
    res.status(200).send({ mensagem: 'Todas as mensagens foram apagadas.' });
  } catch (err) {
    res.status(500).send(err);
  }
});
