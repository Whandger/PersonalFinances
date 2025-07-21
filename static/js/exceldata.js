let registrosProcessados = []; // guarda os dados lidos no "Analisar"

function processarExcel(callback) {
  const fileInput = document.getElementById('inputExcel');
  const celExpense = document.getElementById('celExpense').value.toUpperCase().trim();
  const celIncome = document.getElementById('celIncome').value.toUpperCase().trim();
  const dataBaseInput = document.getElementById('dataBase').value;

  if (!fileInput.files.length) {
    alert('Selecione um arquivo Excel.');
    return;
  }

  if (!celExpense.match(/^[A-Z]+\d+$/) || !celIncome.match(/^[A-Z]+\d+$/)) {
    alert('Células inválidas. Use formatos como H5 ou G4.');
    return;
  }

  if (!dataBaseInput) {
    alert('Selecione a data base para os lançamentos.');
    return;
  }

  // Extrai ano e dia direto da string para evitar problemas de fuso horário
  const [anoBase, , diaBase] = dataBaseInput.split('-');

  const reader = new FileReader();
  reader.onload = function (e) {
    const data = new Uint8Array(e.target.result);
    const workbook = XLSX.read(data, { type: 'array' });

    const meses = [
      'janeiro', 'fevereiro', 'março', 'abril',
      'maio', 'junho', 'julho', 'agosto',
      'setembro', 'outubro', 'novembro', 'dezembro'
    ];

    const registros = [];

    workbook.SheetNames.forEach(sheetName => {
      const nomeSheet = sheetName.trim().toLowerCase();
      const idxMes = meses.findIndex(m => nomeSheet.includes(m));
      if (idxMes === -1) return;

      const ws = workbook.Sheets[sheetName];
      const expenseCell = ws[celExpense];
      const incomeCell = ws[celIncome];

      const valorExpense = expenseCell ? parseFloat(expenseCell.v) || 0 : 0;
      const valorIncome = incomeCell ? parseFloat(incomeCell.v) || 0 : 0;

      if (valorExpense === 0 && valorIncome === 0) return;

      const mes = String(idxMes + 1).padStart(2, '0');
      const dataRegistro = `${anoBase}-${mes}-${diaBase}`;

      if (valorExpense > 0) {
        registros.push({
          categoria: 'Month Expense',
          tipo: 'expense',
          valor: valorExpense,
          data: dataRegistro,
          observacao: `Importado de ${sheetName}`
        });
      }

      if (valorIncome > 0) {
        registros.push({
          categoria: 'Geral Value',
          tipo: 'income',
          valor: valorIncome,
          data: dataRegistro,
          observacao: `Importado de ${sheetName}`
        });
      }
    });

    callback(registros);
  };

  reader.readAsArrayBuffer(fileInput.files[0]);
}

// Botão Analisar: só mostra os dados
document.getElementById('btnAnalisar').addEventListener('click', () => {
  processarExcel((registros) => {
    registrosProcessados = registros; // salva pra importar depois
    if (registros.length === 0) {
      document.getElementById('output').textContent = 'Nenhum dado válido para exibir.';
      document.getElementById('btnProcessar').disabled = true;
    } else {
      document.getElementById('output').textContent = JSON.stringify(registros, null, 2);
      document.getElementById('btnProcessar').disabled = false;
    }
  });
});

// Botão Importar: envia os dados já processados
document.getElementById('btnProcessar').addEventListener('click', () => {
  if (registrosProcessados.length === 0) {
    alert('Nenhum dado para importar. Primeiro analise o arquivo.');
    return;
  }

  Promise.all(registrosProcessados.map(registro =>
    fetch('/data/transaction', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify(registro)
    })
    .then(async res => {
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    })
  ))
  .then(results => {
    const erros = results.filter(r => !r.success);
    if (erros.length > 0) {
      alert(`Importação concluída com erros em ${erros.length} registros.`);
      console.error('Erros:', erros);
    } else {
      alert('Importação concluída com sucesso!');
    }
    registrosProcessados = [];
    document.getElementById('output').textContent = '';
    document.getElementById('btnProcessar').disabled = true;
  })
  .catch(err => {
    alert('Erro ao importar dados: ' + err.message);
  });
});
