async function fetchJson(url, method="GET", data=null) {
    const options = {
        method,
        headers: { "Content-Type": "application/json" }
    };
    if (data) options.body = JSON.stringify(data);
    const response = await fetch(url, options);
    return response.json();
}

// ===================== RESUMO FINANCEIRO =====================
async function carregarResumo() {
    const dados = await fetchJson("/api/resumo");
    document.getElementById("entradas").textContent = "R$ " + dados.entradas.toFixed(2);
    document.getElementById("saidas").textContent = "R$ " + dados.saidas.toFixed(2);
    document.getElementById("saldo").textContent = "R$ " + dados.saldo.toFixed(2);

    // Gráfico por categoria
    const catColors = [
        "#4f8cff", "#26de81", "#f7b731", "#eb3b5a", "#a55eea", "#fd9644", "#76c7ff"
    ];
    const ctxCat = document.getElementById("grafico-categorias").getContext("2d");
    new Chart(ctxCat, {
        type: "pie",
        data: {
            labels: dados.categorias.labels,
            datasets: [{
                data: dados.categorias.valores,
                backgroundColor: catColors,
                borderWidth: 2,
            }]
        },
        options: {
            responsive: true,
            plugins: { legend: { position: 'bottom' } }
        }
    });

    // Gráfico mensal de entradas/saídas
    const ctxMensal = document.getElementById("grafico-mensal").getContext("2d");
    new Chart(ctxMensal, {
        type: "bar",
        data: {
            labels: dados.mensal.labels,
            datasets: [
                {
                    label: "Entradas",
                    data: dados.mensal.entradas,
                    backgroundColor: "#26de81"
                },
                {
                    label: "Saídas",
                    data: dados.mensal.saidas,
                    backgroundColor: "#eb3b5a"
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { position: 'bottom' },
                tooltip: { mode: 'index', intersect: false }
            },
            scales: {
                x: { stacked: true },
                y: { beginAtZero: true }
            }
        }
    });
}

// ===================== TRANSACOES =====================
async function carregarTransacoes() {
    const dados = await fetchJson("/api/transacoes");
    const tbody = document.querySelector("#tabela-transacoes tbody");
    tbody.innerHTML = "";
    dados.forEach(t => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${t.data}</td>
            <td>${t.descricao}</td>
            <td class="${t.tipo === 'entrada' ? 'entrada' : 'saida'}">R$ ${t.valor.toFixed(2)}</td>
            <td>${t.tipo}</td>
            <td>${t.categoria}</td>
            <td>
                <button onclick="editarTransacao('${t.id}')">Editar</button>
                <button onclick="excluirTransacao('${t.id}')">Excluir</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

document.getElementById("form-transacao")?.addEventListener("submit", async e => {
    e.preventDefault();
    const id = document.getElementById("transacao-id").value;
    const payload = {
        data: document.getElementById("data").value,
        descricao: document.getElementById("descricao").value,
        valor: parseFloat(document.getElementById("valor").value),
        tipo: document.getElementById("tipo").value,
        categoria: document.getElementById("categoria").value
    };
    if (id) {
        await fetchJson(`/api/transacoes/${id}`, "PUT", payload);
        document.getElementById("cancelar-edicao").style.display = "none";
    } else {
        await fetchJson("/api/transacoes", "POST", payload);
    }
    document.getElementById("form-transacao").reset();
    document.getElementById("transacao-id").value = "";
    carregarTransacoes();
});

async function editarTransacao(id) {
    const t = await fetchJson(`/api/transacoes/${id}`);
    document.getElementById("transacao-id").value = t.id;
    document.getElementById("data").value = t.data;
    document.getElementById("descricao").value = t.descricao;
    document.getElementById("valor").value = t.valor;
    document.getElementById("tipo").value = t.tipo;
    document.getElementById("categoria").value = t.categoria;
    document.getElementById("cancelar-edicao").style.display = "inline-block";
}

document.getElementById("cancelar-edicao")?.addEventListener("click", () => {
    document.getElementById("form-transacao").reset();
    document.getElementById("transacao-id").value = "";
    document.getElementById("cancelar-edicao").style.display = "none";
});

async function excluirTransacao(id) {
    if (confirm("Excluir esta transação?")) {
        await fetchJson(`/api/transacoes/${id}`, "DELETE");
        carregarTransacoes();
    }
}

window.filtrarTransacoes = async function() {
    const inicio = document.getElementById("filtro-inicio").value;
    const fim = document.getElementById("filtro-fim").value;
    const tipo = document.getElementById("filtro-tipo").value;
    const query = `?inicio=${inicio}&fim=${fim}&tipo=${tipo}`;
    const dados = await fetchJson("/api/transacoes" + query);
    const tbody = document.querySelector("#tabela-transacoes tbody");
    tbody.innerHTML = "";
    dados.forEach(t => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${t.data}</td>
            <td>${t.descricao}</td>
            <td class="${t.tipo === 'entrada' ? 'entrada' : 'saida'}">R$ ${t.valor.toFixed(2)}</td>
            <td>${t.tipo}</td>
            <td>${t.categoria}</td>
            <td>
                <button onclick="editarTransacao('${t.id}')">Editar</button>
                <button onclick="excluirTransacao('${t.id}')">Excluir</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
};

// ===================== PLANEJAMENTO FINANCEIRO =====================
async function carregarMetas() {
    const metas = await fetchJson("/api/metas");
    const lista = document.getElementById("metas-lista");
    lista.innerHTML = "";
    metas.forEach(m => {
        const progresso = Math.min(100, m.atual / m.objetivo * 100);
        const card = document.createElement("div");
        card.className = "meta-card";
        card.innerHTML = `
            <div class="meta-header">
                <strong>${m.nome}</strong>
                <span>R$ ${m.atual.toFixed(2)} / R$ ${m.objetivo.toFixed(2)}</span>
            </div>
            <div class="meta-progress">
                <div class="progress-bar-bg">
                    <div class="progress-bar-fill" style="width: ${progresso}%"></div>
                </div>
                <small>${progresso.toFixed(1)}%</small>
            </div>
            <div class="meta-actions">
                <button onclick="excluirMeta('${m.id}')">Excluir</button>
            </div>
        `;
        lista.appendChild(card);
    });
}

document.getElementById("form-meta")?.addEventListener("submit", async e => {
    e.preventDefault();
    const payload = {
        nome: document.getElementById("nome-meta").value,
        objetivo: parseFloat(document.getElementById("valor-objetivo").value)
    };
    await fetchJson("/api/metas", "POST", payload);
    document.getElementById("form-meta").reset();
    carregarMetas();
});

async function excluirMeta(id) {
    if (confirm("Excluir esta meta?")) {
        await fetchJson(`/api/metas/${id}`, "DELETE");
        carregarMetas();
    }
}
