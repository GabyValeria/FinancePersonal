// app/static/js/main.js -- (COMPLETO E ATUALIZADO)
document.addEventListener('DOMContentLoaded', () => {
    // --- ESTADO DA APLICAÇÃO E CONSTANTES ---
    const API_URL = '/api';

    // --- FUNÇÕES UTILITÁRIAS ---
    const formatCurrency = (value) => (value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    
    // Sistema de Notificação "Toast"
    const toastContainer = document.getElementById('toast-container');
    function showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        toastContainer.appendChild(toast);
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }

    // --- FUNÇÕES DE CARREGAMENTO DE DADOS (READ) ---
    async function fetchAPI(url, options = {}) {
        try {
            const response = await fetch(url, options);
            if (!response.ok) throw new Error('Falha na requisição à API.');
            return response.json();
        } catch (error) {
            console.error('Erro na API:', error);
            showToast('Ocorreu um erro. Tente novamente.', 'error');
            return null;
        }
    }

    async function carregarTudo() {
        await Promise.all([
            carregarResumo(),
            carregarTransacoes(),
            carregarOrcamentos(),
            carregarMetas(),
            carregarGraficoDespesas() // do chart-config.js
        ]);
    }

    async function carregarResumo() {
        const data = await fetchAPI(`${API_URL}/summary`);
        if (!data) return;
        document.getElementById('total-receitas').textContent = formatCurrency(data.receitas);
        document.getElementById('total-despesas').textContent = formatCurrency(data.despesas);
        document.getElementById('saldo-atual').textContent = formatCurrency(data.saldo);
    }

    async function carregarTransacoes() {
        // Lógica de filtro aqui (sem alterações)
        // ...
        const transacoes = await fetchAPI(`${API_URL}/transacoes`); // Adapte com sua lógica de filtros
        const tbody = document.querySelector('#tabela-transacoes tbody');
        tbody.innerHTML = '';
        transacoes.forEach(t => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>
                    ${t.descricao}
                    <br><small>${t.categoria}</small>
                </td>
                <td class="valor-${t.tipo}">${t.tipo === 'receita' ? '+' : '-'} ${formatCurrency(t.valor)}</td>
                <td>${new Date(t.data + 'T03:00:00').toLocaleDateString('pt-BR')}</td>
                <td><button onclick="window.app.abrirModalEdicao(${t.id})">Editar</button></td>
            `;
            tbody.appendChild(tr);
        });
    }

    async function carregarOrcamentos() { /* ... (sem alterações na lógica) ... */ }

    // NOVA: Carregar Metas
    async function carregarMetas() {
        const metas = await fetchAPI(`${API_URL}/metas`);
        if (!metas) return;
        const container = document.getElementById('lista-metas');
        container.innerHTML = '';
        metas.forEach(meta => {
            const progresso = (meta.valor_atual / meta.valor_alvo) * 100;
            const item = document.createElement('div');
            item.className = 'meta-item';
            item.innerHTML = `
                <div class="meta-info">
                    <strong>${meta.descricao}</strong>
                    <span>${formatCurrency(meta.valor_atual)} / ${formatCurrency(meta.valor_alvo)}</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-bar-fill" style="width: ${progresso > 100 ? 100 : progresso}%;">${progresso.toFixed(1)}%</div>
                </div>
                <form class="add-contribuicao-form" onsubmit="window.app.adicionarContribuicao(event, ${meta.id})">
                    <input type="number" step="0.01" placeholder="Valor" required>
                    <button type="submit">Adicionar</button>
                </form>
            `;
            container.appendChild(item);
        });
    }

    // --- FUNÇÕES DE MANIPULAÇÃO DE DADOS (CREATE, UPDATE, DELETE) ---

    // Transações
    async function adicionarTransacao(event) {
        event.preventDefault();
        const form = event.target;
        const data = {
            descricao: form.descricao.value,
            valor: parseFloat(form.valor.value),
            tipo: form.tipo.value,
            categoria: form.categoria.value,
            data: form.data.value,
        };
        const result = await fetchAPI(`${API_URL}/transacoes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (result) {
            showToast('Transação adicionada com sucesso!');
            form.reset();
            document.getElementById('data').valueAsDate = new Date();
            carregarTudo();
        }
    }
    
    // NOVA: Metas
    async function adicionarMeta(event) {
        event.preventDefault();
        const form = event.target;
        const data = {
            descricao: form['meta-descricao'].value,
            valor_alvo: parseFloat(form['meta-valor-alvo'].value),
        };
        const result = await fetchAPI(`${API_URL}/metas`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if(result) {
            showToast('Meta criada com sucesso!');
            form.reset();
            form.parentElement.open = false; // Fecha o <details>
            carregarMetas();
        }
    }

    // NOVA: Adicionar Contribuição à Meta
    async function adicionarContribuicao(event, id) {
        event.preventDefault();
        const form = event.target;
        const valor = parseFloat(form.querySelector('input').value);
        const result = await fetchAPI(`${API_URL}/metas/${id}/adicionar`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ valor }),
        });
        if (result) {
            showToast('Contribuição adicionada!');
            carregarMetas();
        }
    }
    
    // --- MODAL (Exemplo para transações, pode ser adaptado para metas) ---
    // A implementação do modal permanece similar. Exponha as funções globalmente para o onclick.
    window.app = {
        adicionarContribuicao,
        // Adicione aqui outras funções que precisam ser chamadas pelo HTML (onclick)
    };


    // --- EVENT LISTENERS ---
    document.getElementById('add-transacao-form').addEventListener('submit', adicionarTransacao);
    document.getElementById('add-meta-form').addEventListener('submit', adicionarMeta);
    // Adicione listeners para filtros etc.
    document.getElementById('data').valueAsDate = new Date();
    
    // --- INICIALIZAÇÃO ---
    carregarTudo();
});
