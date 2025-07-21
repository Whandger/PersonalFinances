document.addEventListener('DOMContentLoaded', () => {
  const ctx = document.getElementById('chartCustos').getContext('2d');
  const chart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: [],
      datasets: [{
        label: 'Month Revenue (R$)',
        data: [],
        backgroundColor: [],
        borderColor: [],
        borderWidth: 1
      }]
    },
    options: {
      scales: {
        x: {
          title: { display: true, text: 'Month/year' }
        },
        y: {
          beginAtZero: true,
          title: { display: true, text: 'Value in R$' }
        }
      }
    }
  });

  const btn = document.getElementById('btnAtualizar');
  const inputInicio = document.getElementById('dataInicio');
  const inputFim = document.getElementById('dataFim');

  function formatMonth(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  }

  const hoje = new Date();
  const mesAtual = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
  const dozeMesesAtras = new Date(hoje.getFullYear(), hoje.getMonth() - 12, 1);
  inputInicio.value = formatMonth(dozeMesesAtras);
  inputFim.value = formatMonth(mesAtual);

  function getLastDayOfMonth(year, month) {
    return new Date(year, month + 1, 0);
  }

  function parseYearMonthToStart(anoMes) {
    const [ano, mes] = anoMes.split('-');
    return new Date(parseInt(ano), parseInt(mes) - 1, 1);
  }

  function parseYearMonthToEnd(anoMes) {
    const [ano, mes] = anoMes.split('-');
    return getLastDayOfMonth(parseInt(ano), parseInt(mes) - 1);
  }

  function convertToDateOnly(dateString) {
    // Converte a data no formato "Tue, 01 Jul 2025 00:00:00 GMT" para "YYYY-MM-DD"
    const date = new Date(dateString);
    return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
  }

  async function atualizarGrafico() {
    const inicio = inputInicio.value;
    const fim = inputFim.value;

    if (!inicio || !fim) {
      alert('Preencha as datas corretamente.');
      return;
    }

    const dataInicio = parseYearMonthToStart(inicio);
    const dataFim = parseYearMonthToEnd(fim);

    try {
      const response = await fetch('/tabel/transactions');
      if (!response.ok) throw new Error('Erro ao buscar dados');
      const data = await response.json();
      console.log(data); // Verifica a resposta da API

      const registros = data.transactions || [];
      const saldoPorMes = {};

      registros.forEach(reg => {
        // Usar a nova função convertToDateOnly
        const dataRegistro = convertToDateOnly(reg.data);
        
        if (dataRegistro >= dataInicio && dataRegistro <= dataFim) {
          const key = `${dataRegistro.getFullYear()}-${String(dataRegistro.getMonth() + 1).padStart(2, '0')}`;
          if (!saldoPorMes[key]) saldoPorMes[key] = 0;

          const tipo = reg.tipo.toLowerCase();
          const valor = parseFloat(reg.valor);
          if (tipo === 'income') {
            saldoPorMes[key] += valor;
          } else if (tipo === 'expense') {
            saldoPorMes[key] -= valor;
          }
        }
      });

      const sortedKeys = Object.keys(saldoPorMes).sort();
      chart.data.labels = sortedKeys.map(k => {
        const [ano, mes] = k.split('-');
        return `${mes}/${ano}`;
      });

      const valores = sortedKeys.map(k => saldoPorMes[k]);
      chart.data.datasets[0].data = valores;
      chart.data.datasets[0].backgroundColor = valores.map(v => v >= 0 ? 'rgba(75, 192, 192, 0.6)' : 'rgba(255, 99, 132, 0.6)');
      chart.data.datasets[0].borderColor = valores.map(v => v >= 0 ? 'rgba(75, 192, 192, 1)' : 'rgba(255, 99, 132, 1)');

      // Verificação dos dados
      console.log('Labels:', chart.data.labels);
      console.log('Valores:', chart.data.datasets[0].data);

      chart.update();
    } catch (error) {
      alert('Erro ao carregar os dados do gráfico: ' + error.message);
      console.error(error);
    }
  }

  btn.addEventListener('click', atualizarGrafico);
  atualizarGrafico();
});
