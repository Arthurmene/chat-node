const socket = io();
const chat = document.getElementById('chat');
const form = document.getElementById('msgForm');

function formatTimestamp(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

// Carregar mensagens iniciais
async function carregarMensagens() {
  const res = await fetch('/mensagens');
  const mensagens = await res.json();
  chat.innerHTML = mensagens.map(m => {
    const own = m.nome.trim().toLowerCase() === document.getElementById('nome').value.trim().toLowerCase();
    return `
      <div class="msg ${own ? 'own' : 'other'}">
        <strong>${m.nome}</strong>
        ${m.texto}
        <div class="timestamp">${formatTimestamp(m.data)}</div>
      </div>
    `;
  }).join('');
  chat.scrollTop = chat.scrollHeight;
}

carregarMensagens();

// Receber nova mensagem em tempo real via Socket.IO
socket.on('mensagemRecebida', (m) => {
  const own = m.nome.trim().toLowerCase() === document.getElementById('nome').value.trim().toLowerCase();
  const div = document.createElement('div');
  div.classList.add('msg', own ? 'own' : 'other');
  div.innerHTML = `<strong>${m.nome}</strong>${m.texto}<div class="timestamp">${formatTimestamp(m.data)}</div>`;
  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
});

// Enviar nova mensagem via Socket.IO
form.addEventListener('submit', e => {
  e.preventDefault();
  const nome = document.getElementById('nome').value.trim();
  const texto = document.getElementById('texto').value.trim();
  if (!nome || !texto) return;
  socket.emit('novaMensagem', { nome, texto });
  form.reset();
});

// Atualiza as mensagens a cada 3 segundos para garantir sincronização
setInterval(carregarMensagens, 3000);

// Botão limpar mensagens (só para usuário 'Lola2170')
document.getElementById('limparBtn').addEventListener('click', async () => {
  const nome = document.getElementById('nome').value.trim();
  if (nome !== 'Lola2170') {
    alert('Você não pode apagar as mensagens!');
    return;
  }
  const confirmar = confirm('Tem certeza que deseja apagar todas as conversas?');
  if (!confirmar) return;
  
  // Passa o nome no query param para autenticar
  await fetch('/mensagens?nome=Lola2170', { method: 'DELETE' });
  carregarMensagens();
});
