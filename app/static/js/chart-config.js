// app/static/js/chart-config.js
let despesasChart; // Variável para guardar a instância do gráfico

async function carregarGraficoDespesas() {
    const response = await fetch('/api/charts/despesas_por_categoria');
    const data = await response.json();
    
    const ctx = document.getElementById('despesasCategoriaChart').getContext('2d');

    // Se o gráfico já existir, destrua-o para criar um novo com dados atualizados
    if (despesasChart) {
        despesasChart.destroy();
    }
    
    despesasChart = new Chart(ctx, {
        type: 'pie', // Tipo do gráfico
        data: {
            labels: data.labels, // "Moradia", "Lazer", etc.
            datasets: [{
                label: 'Despesas por Categoria',
                data: data.data, // [500, 250, ...]
                backgroundColor: [ // Cores para as fatias da pizza
                    'rgba(255, 99, 132, 0.7)',
                    'rgba(54, 162, 235, 0.7)',
                    'rgba(255, 206, 86, 0.7)',
                    'rgba(75, 192, 192, 0.7)',
                    'rgba(153, 102, 255, 0.7)',
                    'rgba(255, 159, 64, 0.7)'
                ],
                borderColor: '#fff',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
        }
    });
}
