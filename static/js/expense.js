document.addEventListener('DOMContentLoaded', function () {
  const dropbtn = document.querySelector('.dropbtn2');
  const dropdownContent = document.querySelector('.dropdown-content2');
  const dropdownLinks = document.querySelectorAll('.dropdown-content2 a');
  const pElement = document.getElementById('p');
  const btnEnviar = document.getElementById('enviar');

  let categoriaSelecionada = 'Expense';  // Valor padrão

  // Abrir/fechar dropdown ao clicar no botão
  dropbtn.addEventListener('click', function(event) {
    event.preventDefault();
    dropdownContent.classList.toggle('show');
  });

  // Fechar dropdown se clicar fora dele
  window.addEventListener('click', function(event) {
    if (!dropbtn.contains(event.target)) {
      dropdownContent.classList.remove('show');
    }
  });

  // Selecionar categoria e fechar dropdown após seleção
  dropdownLinks.forEach(link => {
    link.addEventListener('click', function (event) {
      event.preventDefault();
      categoriaSelecionada = this.getAttribute('data-item');
      pElement.textContent = categoriaSelecionada;
      dropdownContent.classList.remove('show');
    });
  });

  // Evento para enviar o formulário
  btnEnviar.addEventListener('click', function (event) {
    event.preventDefault();

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
      tipo: 'expense',  // ajuste conforme necessário (expense ou income)
      observacao: observacao
    };

    // Desabilitar o botão enquanto a requisição está em andamento
    btnEnviar.disabled = true;
    btnEnviar.textContent = 'Saving...'; // Alterar texto para indicar que está processando

    // Realizar a requisição fetch
    fetch(transactionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'same-origin',
      body: JSON.stringify(novoRegistro)
    })
    .then(async response => {
      const contentType = response.headers.get('content-type');
    
      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Erro HTTP ${response.status}: ${text}`);
      }
    
      if (contentType && contentType.includes('application/json')) {
        return response.json();
      } else {
        throw new Error("Resposta não é JSON (possivelmente redirecionado para login)");
      }
    })
    .then(data => {
      console.log(data);
      if (data.success) {
        document.getElementById('sucess').innerHTML = "Value saved with sucess"
        

        // Limpar os campos do formulário
        document.getElementById('valor').value = '';
        document.getElementById('data').value = '';
        document.getElementById('observacao').value = '';
        pElement.textContent = 'Expense';
        categoriaSelecionada = 'Expense';
      } else {
        alert("Erro ao salvar valor: " + data.message);
      }
    })
    .catch(error => {
      alert("Erro ao salvar valor: " + error);
    })
    .finally(() => {
      // Reabilitar o botão depois de terminar a requisição
      btnEnviar.disabled = false;
      btnEnviar.textContent = 'Send'; // Voltar o texto original
      setTimeout(function() {
        document.getElementById('sucess').innerHTML = "" 
           }, 1500);// Faz com que o texto de value saved with sucess suma depois de 1,5  segundos
    });
  });
});
