let registros = [];
const registrosPorPagina = 10;
let paginaAtual = 1;
let filtroTipo = 'todos';

const categoriasExpenses = ['Month Expense', 'Geral Expense', 'Market', 'Present'];
const categoriasIncome = ['Salary', 'Passive Income', 'Food Ticket', 'Pix', 'Geral Value'];

const pElement = document.getElementById('p'); // Certifique-se que existe no HTML

// --- BUSCAR registros do backend ---
async function buscarRegistros() {
  try {
    const response = await fetch('/data/transactions');
    if (!response.ok) throw new Error('Erro ao buscar dados');
    const data = await response.json();
    if (!data.success) throw new Error(data.message || 'Erro no servidor');

    registros = data.transactions;
    registros.sort((a, b) => new Date(b.data) - new Date(a.data));
    renderTabela(paginaAtual);
    renderPaginacao();
  } catch (error) {
    alert('Erro ao carregar registros: ' + error.message);
  }
}

// --- ENVIAR novo registro para backend ---
async function enviarRegistro(novoRegistro) {
  try {
    const response = await fetch('/data/transaction', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(novoRegistro),
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message || 'Erro no servidor');

    await buscarRegistros(); // atualizar a lista depois de adicionar
    alert('Registro salvo com sucesso!');
  } catch (error) {
    alert('Erro ao salvar registro: ' + error.message);
  }
}

// --- ATUALIZAR registro no backend ---
async function atualizarRegistro(index, registroAtualizado) {
  try {
    const id = registros[index].id;
    const response = await fetch(`/data/transaction/${id}`, {
      method: 'PUT',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(registroAtualizado),
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message || 'Erro no servidor');

    await buscarRegistros();
    alert('Registro atualizado com sucesso!');
  } catch (error) {
    alert('Erro ao atualizar registro: ' + error.message);
  }
}

// --- DELETAR registro no backend ---
async function deletarRegistro(index) {
  try {
    const id = registros[index].id;
    const response = await fetch(`/data/transaction/${id}`, {
      method: 'DELETE',
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message || 'Erro no servidor');

    await buscarRegistros();
    alert('Registro deletado com sucesso!');
  } catch (error) {
    alert('Erro ao deletar registro: ' + error.message);
  }
}

// --- RENDERIZAÇÃO DA TABELA ---
function renderTabela(pagina) {
  const tbody = document.querySelector('#tabelaRegistros tbody');
  tbody.innerHTML = '';

  const registrosFiltrados = filtroTipo === 'todos' ? registros : registros.filter(r => r.tipo === filtroTipo);
  const inicio = (pagina - 1) * registrosPorPagina;
  const fim = inicio + registrosPorPagina;
  const paginaRegistros = registrosFiltrados.slice(inicio, fim);

  paginaRegistros.forEach((reg, i) => {
    const tr = document.createElement('tr');
    tr.className = i % 2 === 0 ? 'linha-par' : 'linha-impar';
    tr.innerHTML = `
      <td class="select"><input type="checkbox" name="select" aria-label="Selecionar linha" /></td>
      <td>${reg.categoria}</td>
      <td>${reg.observacao || ''}</td>
      <td>R$ ${parseFloat(reg.valor).toFixed(2)}</td>
      <td>${formatarData(reg.data)}</td>
      <td class="action-buttons">
        <button class="view-btn" data-index="${registros.indexOf(reg)}" title="Ver/Editar">⚙</button>
        <button class="delete-btn" data-index="${registros.indexOf(reg)}" title="Deletar">X</button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.onclick = async function () {
      const idx = parseInt(this.getAttribute('data-index'));
      if (confirm('Excluir registro?')) {
        await deletarRegistro(idx);
      }
    };
  });

  document.querySelectorAll('.view-btn').forEach(btn => {
    btn.onclick = function () {
      const idx = parseInt(this.getAttribute('data-index'));
      mostrarModal(idx);
    };
  });
}

// --- PAGINAÇÃO ---
function renderPaginacao() {
  const registrosFiltrados = filtroTipo === 'todos' ? registros : registros.filter(r => r.tipo === filtroTipo);
  const totalPaginas = Math.ceil(registrosFiltrados.length / registrosPorPagina);
  const pagContainer = document.getElementById('pagination');
  pagContainer.innerHTML = '';

  for (let i = 1; i <= totalPaginas; i++) {
    const btn = document.createElement('button');
    btn.textContent = i;
    if (i === paginaAtual) btn.classList.add('active');
    btn.onclick = () => {
      paginaAtual = i;
      renderTabela(paginaAtual);
      renderPaginacao();
    };
    pagContainer.appendChild(btn);
  }
}

// --- FORMATAÇÃO DA DATA PARA EXIBIÇÃO ---
function formatarData(data) {
  if (!data) return '';

  const d = new Date(data);
  if (isNaN(d)) return '';

  const dia = String(d.getUTCDate()).padStart(2, '0');
  const mes = String(d.getUTCMonth() + 1).padStart(2, '0');
  const ano = d.getUTCFullYear();

  return `${dia}/${mes}/${ano}`;
}

// --- FORMATAÇÃO DA DATA PARA input[type=date] (YYYY-MM-DD) ---
function formatarDataInputDate(data) {
  if (!data) return '';

  const d = new Date(data);
  if (isNaN(d)) return '';

  // Usando a data no UTC para evitar problemas de fuso horário
  const ano = d.getUTCFullYear();
  const mes = String(d.getUTCMonth() + 1).padStart(2, '0');
  const dia = String(d.getUTCDate()).padStart(2, '0');

  return `${ano}-${mes}-${dia}`;
}

// --- MODAL PARA EDITAR ---
function mostrarModal(index) {
  const reg = registros[index];
  const modalFundo = document.createElement('div');
  modalFundo.style.cssText = `
    position: fixed;
    top: 0; left: 0;
    width: 100vw; height: 100vh;
    background-color: rgba(0,0,0,0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  `;
  const modalCaixa = document.createElement('div');
  modalCaixa.style.cssText = `
    background-color: #fff;
    padding: 20px;
    border-radius: 8px;
    max-width: 400px;
    box-shadow: 0 0 10px rgba(0,0,0,0.3);
    text-align: left;
  `;
  modalCaixa.innerHTML = `
    <label>Data:<input type="date" value="${formatarDataInputDate(reg.data)}" style="display:block; margin-bottom:10px"></label>
    <label>Categoria:<select style="display:block; margin-bottom:10px"></select></label>
    <label>Valor:<input type="number" step="0.01" value="${reg.valor}" style="display:block; margin-bottom:10px"></label>
    <label>Observação:<textarea rows="3" style="display:block; width:100%; margin-bottom:10px">${reg.observacao || ''}</textarea></label>
    <button style="padding:8px 16px; background-color:#333; color:#fff; border:none; border-radius:4px; cursor:pointer">Salvar</button>
    <button style="margin-left:10px; padding:8px 16px; background-color:#ccc; color:#000; border:none; border-radius:4px; cursor:pointer">Cancelar</button>
  `;
  const selectCategoria = modalCaixa.querySelector('select');
  const categorias = reg.tipo === 'expense' ? categoriasExpenses : categoriasIncome;
  categorias.forEach(cat => {
    const option = document.createElement('option');
    option.value = cat;
    option.textContent = cat;
    if (cat === reg.categoria) option.selected = true;
    selectCategoria.appendChild(option);
  });
  const inputData = modalCaixa.querySelector('input[type=date]');
  const inputValor = modalCaixa.querySelector('input[type=number]');
  const inputObs = modalCaixa.querySelector('textarea');
  const btnSalvar = modalCaixa.querySelector('button:first-of-type');
  const btnCancelar = modalCaixa.querySelector('button:last-of-type');

  btnCancelar.onclick = () => {
    document.body.removeChild(modalFundo);
  };
  btnSalvar.onclick = async () => {
    const novaData = inputData.value;
    const novaCategoria = selectCategoria.value;
    const novoValor = parseFloat(inputValor.value);
    const novaObs = inputObs.value.trim();
    if (!novaData || isNaN(novoValor)) {
      alert("Preencha corretamente os campos obrigatórios.");
      return;
    }
    const registroAtualizado = {
      tipo: reg.tipo,
      categoria: novaCategoria,
      valor: novoValor,
      data: novaData,
      observacao: novaObs
    };
    await atualizarRegistro(index, registroAtualizado);
    document.body.removeChild(modalFundo);
  };
  modalFundo.appendChild(modalCaixa);
  document.body.appendChild(modalFundo);
}

// --- FILTRO ---
const botoesFiltro = document.querySelectorAll('#filtroRegistros button');
botoesFiltro.forEach(btn => {
  btn.addEventListener('click', () => {
    filtroTipo = btn.getAttribute('data-tipo');
    botoesFiltro.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    paginaAtual = 1;
    renderTabela(paginaAtual);
    renderPaginacao();
  });
});

// --- EVENTO DO BOTÃO ENVIAR ---
document.addEventListener('DOMContentLoaded', () => {
  const btnEnviar = document.getElementById('btnEnviar');
  if (btnEnviar) {
    btnEnviar.addEventListener('click', async (e) => {
      e.preventDefault();
      const categoriaSelecionada = pElement.textContent.toLowerCase() === 'todos' ? 'income' : pElement.textContent.toLowerCase();
      const valor = parseFloat(document.getElementById('valor').value);
      const data = document.getElementById('data').value;
      const observacao = document.getElementById('observacao').value.trim();
      if (isNaN(valor) || !data) {
        alert("Preencha o valor e a data corretamente.");
        return;
      }
      const novoRegistro = {
        categoria: categoriaSelecionada,
        valor: valor,
        data: data,
        tipo: filtroTipo === 'todos' ? 'income' : filtroTipo,
        observacao: observacao
      };
      await enviarRegistro(novoRegistro);
      document.getElementById('valor').value = '';
      document.getElementById('data').value = '';
      document.getElementById('observacao').value = '';
      pElement.textContent = filtroTipo.charAt(0).toUpperCase() + filtroTipo.slice(1);
    });
  }
});

// --- INICIALIZAÇÃO ---
buscarRegistros();
