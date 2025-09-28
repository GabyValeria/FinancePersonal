# app/routes.py -- (COMPLETO E ATUALIZADO)
import io
import csv
from flask import Blueprint, jsonify, request, Response
from .db import get_db

bp = Blueprint('api', __name__, url_prefix='/api')

# --- ROTAS DE TRANSAÇÕES ---

@bp.route('/transacoes', methods=['GET'])
def get_transacoes():
    db = get_db()
    # Parâmetros de filtro
    data_inicio = request.args.get('data_inicio')
    data_fim = request.args.get('data_fim')

    query = 'SELECT * FROM transacoes WHERE 1=1'
    params = []

    if data_inicio:
        query += ' AND data >= ?'
        params.append(data_inicio)
    if data_fim:
        query += ' AND data <= ?'
        params.append(data_fim)
    
    query += ' ORDER BY data DESC'
    
    transacoes_cursor = db.execute(query, tuple(params))
    transacoes = [dict(row) for row in transacoes_cursor.fetchall()]
    return jsonify(transacoes)

# Rota para buscar uma ÚNICA transação (para edição)
@bp.route('/transacoes/<int:id>', methods=['GET'])
def get_transacao(id):
    db = get_db()
    transacao = db.execute(
        'SELECT * FROM transacoes WHERE id = ?', (id,)
    ).fetchone()
    if transacao is None:
        return jsonify({'error': 'Transação não encontrada'}), 404
    return jsonify(dict(transacao))

@bp.route('/transacoes', methods=['POST'])
def add_transacao():
    data = request.get_json()
    db = get_db()
    db.execute(
        'INSERT INTO transacoes (descricao, valor, tipo, categoria, data) VALUES (?, ?, ?, ?, ?)',
        (data['descricao'], data['valor'], data['tipo'], data['categoria'], data['data'])
    )
    db.commit()
    return jsonify({'status': 'sucesso', 'message': 'Transação adicionada!'}), 201

# Rota para ATUALIZAR uma transação
@bp.route('/transacoes/<int:id>', methods=['PUT'])
def update_transacao(id):
    data = request.get_json()
    db = get_db()
    db.execute(
        'UPDATE transacoes SET descricao = ?, valor = ?, tipo = ?, categoria = ?, data = ? WHERE id = ?',
        (data['descricao'], data['valor'], data['tipo'], data['categoria'], data['data'], id)
    )
    db.commit()
    return jsonify({'status': 'sucesso', 'message': 'Transação atualizada!'})

@bp.route('/transacoes/<int:id>', methods=['DELETE'])
def delete_transacao(id):
    db = get_db()
    db.execute('DELETE FROM transacoes WHERE id = ?', (id,))
    db.commit()
    return jsonify({'status': 'sucesso', 'message': 'Transação removida!'})

# --- ROTAS DE DASHBOARD E GRÁFICOS ---

@bp.route('/summary', methods=['GET'])
def get_summary():
    # ... (código existente sem alterações)
    db = get_db()
    receitas = db.execute("SELECT SUM(valor) FROM transacoes WHERE tipo = 'receita'").fetchone()[0] or 0
    despesas = db.execute("SELECT SUM(valor) FROM transacoes WHERE tipo = 'despesa'").fetchone()[0] or 0
    saldo = receitas - despesas
    return jsonify({'receitas': receitas, 'despesas': despesas, 'saldo': saldo})

@bp.route('/charts/despesas_por_categoria', methods=['GET'])
def get_despesas_por_categoria():
    # ... (código existente sem alterações)
    db = get_db()
    data_cursor = db.execute(
        'SELECT categoria, SUM(valor) as total FROM transacoes WHERE tipo = "despesa" GROUP BY categoria'
    )
    dados = {row['categoria']: row['total'] for row in data_cursor.fetchall()}
    return jsonify({'labels': list(dados.keys()), 'data': list(dados.values())})

# Rota para EXPORTAÇÃO CSV
@bp.route('/export/csv', methods=['GET'])
def export_csv():
    db = get_db()
    transacoes_cursor = db.execute('SELECT * FROM transacoes ORDER BY data DESC')
    
    # Usa um buffer de string em memória para criar o CSV
    si = io.StringIO()
    cw = csv.writer(si)
    
    # Escreve o cabeçalho
    cols = [description[0] for description in transacoes_cursor.description]
    cw.writerow(cols)
    
    # Escreve os dados
    cw.writerows(transacoes_cursor.fetchall())
    
    # Cria a resposta para download
    output = si.getvalue()
    return Response(
        output,
        mimetype="text/csv",
        headers={"Content-Disposition": "attachment;filename=transacoes.csv"}
    )

# --- ORÇAMENTOS E METAS ---

@bp.route('/orcamentos', methods=['GET'])
def get_orcamentos():
    db = get_db()
    # Junta orcamentos com a soma das despesas da categoria no mês atual
    query = """
    SELECT 
        o.categoria, 
        o.limite, 
        COALESCE(SUM(t.valor), 0) as gasto_atual
    FROM orcamentos o
    LEFT JOIN transacoes t ON o.categoria = t.categoria
        AND t.tipo = 'despesa'
        AND strftime('%Y-%m', t.data) = strftime('%Y-%m', 'now', 'localtime')
    GROUP BY o.categoria, o.limite
    """
    orcamentos_cursor = db.execute(query)
    orcamentos = [dict(row) for row in orcamentos_cursor.fetchall()]
    return jsonify(orcamentos)

@bp.route('/orcamentos', methods=['POST'])
def add_orcamento():
    data = request.get_json()
    db = get_db()
    try:
        db.execute(
            'INSERT INTO orcamentos (categoria, limite) VALUES (?, ?)',
            (data['categoria'], data['limite'])
        )
        db.commit()
        return jsonify({'status': 'sucesso'}), 201
    except db.IntegrityError:
        return jsonify({'error': 'Categoria de orçamento já existe'}), 409
    
# --- METAS DE ECONOMIA ---

@bp.route('/metas', methods=['GET'])
def get_metas():
    db = get_db()
    metas_cursor = db.execute('SELECT * FROM metas ORDER BY id DESC')
    metas = [dict(row) for row in metas_cursor.fetchall()]
    return jsonify(metas)

@bp.route('/metas', methods=['POST'])
def add_meta():
    data = request.get_json()
    db = get_db()
    db.execute(
        'INSERT INTO metas (descricao, valor_alvo) VALUES (?, ?)',
        (data['descricao'], data['valor_alvo'])
    )
    db.commit()
    return jsonify({'status': 'sucesso', 'message': 'Meta criada!'}), 201

@bp.route('/metas/<int:id>', methods=['PUT'])
def update_meta(id):
    data = request.get_json()
    db = get_db()
    db.execute(
        'UPDATE metas SET descricao = ?, valor_alvo = ?, valor_atual = ? WHERE id = ?',
        (data['descricao'], data['valor_alvo'], data['valor_atual'], id)
    )
    db.commit()
    return jsonify({'status': 'sucesso', 'message': 'Meta atualizada!'})
    
@bp.route('/metas/<int:id>/adicionar', methods=['POST'])
def add_contribuicao_meta(id):
    data = request.get_json()
    valor_adicionado = data.get('valor', 0)
    
    db = get_db()
    db.execute(
        'UPDATE metas SET valor_atual = valor_atual + ? WHERE id = ?',
        (valor_adicionado, id)
    )
    db.commit()
    return jsonify({'status': 'sucesso', 'message': 'Contribuição adicionada!'})


@bp.route('/metas/<int:id>', methods=['DELETE'])
def delete_meta(id):
    db = get_db()
    db.execute('DELETE FROM metas WHERE id = ?', (id,))
    db.commit()
    return jsonify({'status': 'sucesso', 'message': 'Meta removida!'})
