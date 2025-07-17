from flask import Flask, render_template, request, jsonify, send_from_directory
import json, os
from uuid import uuid4
from datetime import datetime

app = Flask(__name__, static_folder="static")
DATA_FILE = "data.json"

def ler_dados():
    if not os.path.exists(DATA_FILE):
        return {"transacoes": [], "metas": []}
    with open(DATA_FILE, "r", encoding="utf-8") as f:
        return json.load(f)

def salvar_dados(dados):
    with open(DATA_FILE, "w", encoding="utf-8") as f:
        json.dump(dados, f, ensure_ascii=False, indent=2)

@app.route("/")
def index():
    return send_from_directory(".", "index.html")

@app.route("/transacoes")
def transacoes():
    return send_from_directory(".", "transacoes.html")

@app.route("/planejamento")
def planejamento():
    return send_from_directory(".", "planejamento.html")

@app.route("/static/<path:filename>")
def static_files(filename):
    return send_from_directory("static", filename)

@app.route("/api/resumo")
def api_resumo():
    dados = ler_dados()
    entradas = sum(t["valor"] for t in dados["transacoes"] if t["tipo"] == "entrada")
    saidas = sum(t["valor"] for t in dados["transacoes"] if t["tipo"] == "saida")
    saldo = entradas - saidas
    categorias = {}
    for t in dados["transacoes"]:
        key = t["categoria"]
        categorias[key] = categorias.get(key, 0) + t["valor"]

    # Gráfico mensal: últimos 6 meses
    meses = []
    for i in range(5, -1, -1):
        mes = (datetime.now().replace(day=1) - timedelta(days=30*i))
        meses.append(mes.strftime("%Y-%m"))
    mensal_labels = []
    mensal_entradas = []
    mensal_saidas = []
    for mes in meses:
        mensal_labels.append(mes)
        ent = sum(
            t["valor"] for t in dados["transacoes"]
            if t["tipo"] == "entrada" and t["data"][:7] == mes
        )
        sai = sum(
            t["valor"] for t in dados["transacoes"]
            if t["tipo"] == "saida" and t["data"][:7] == mes
        )
        mensal_entradas.append(ent)
        mensal_saidas.append(sai)

    return jsonify({
        "entradas": entradas,
        "saidas": saidas,
        "saldo": saldo,
        "categorias": {
            "labels": list(categorias.keys()),
            "valores": list(categorias.values())
        },
        "mensal": {
            "labels": mensal_labels,
            "entradas": mensal_entradas,
            "saidas": mensal_saidas
        }
    })

@app.route("/api/transacoes", methods=["GET", "POST"])
def api_transacoes():
    dados = ler_dados()
    if request.method == "GET":
        inicio = request.args.get("inicio")
        fim = request.args.get("fim")
        tipo = request.args.get("tipo")
        transacoes = dados["transacoes"]
        if inicio:
            transacoes = [t for t in transacoes if t["data"] >= inicio]
        if fim:
            transacoes = [t for t in transacoes if t["data"] <= fim]
        if tipo:
            transacoes = [t for t in transacoes if t["tipo"] == tipo]
        return jsonify(transacoes)
    else:
        t = request.json
        t["id"] = str(uuid4())
        dados["transacoes"].append(t)
        salvar_dados(dados)
        return jsonify({"msg": "Transação adicionada"})

@app.route("/api/transacoes/<id>", methods=["GET", "PUT", "DELETE"])
def api_transacao_id(id):
    dados = ler_dados()
    transacoes = dados["transacoes"]
    idx = next((i for i, t in enumerate(transacoes) if t["id"] == id), None)
    if idx is None:
        return jsonify({"erro": "Transação não encontrada"}), 404
    if request.method == "GET":
        return jsonify(transacoes[idx])
    elif request.method == "PUT":
        t = request.json
        t["id"] = id
        transacoes[idx] = t
        salvar_dados(dados)
        return jsonify({"msg": "Transação editada"})
    elif request.method == "DELETE":
        transacoes.pop(idx)
        salvar_dados(dados)
        return jsonify({"msg": "Transação excluída"})

@app.route("/api/metas", methods=["GET", "POST"])
def api_metas():
    dados = ler_dados()
    if request.method == "GET":
        saldo = sum(t["valor"] if t["tipo"] == "entrada" else -t["valor"] for t in dados["transacoes"])
        for m in dados["metas"]:
            m["atual"] = min(saldo, m["objetivo"])
        return jsonify(dados["metas"])
    else:
        m = request.json
        m["id"] = str(uuid4())
        m["atual"] = 0
        dados["metas"].append(m)
        salvar_dados(dados)
        return jsonify({"msg": "Meta adicionada"})

@app.route("/api/metas/<id>", methods=["DELETE"])
def api_meta_id(id):
    dados = ler_dados()
    metas = dados["metas"]
    idx = next((i for i, m in enumerate(metas) if m["id"] == id), None)
    if idx is None:
        return jsonify({"erro": "Meta não encontrada"}), 404
    metas.pop(idx)
    salvar_dados(dados)
    return jsonify({"msg": "Meta excluída"})

if __name__ == "__main__":
    from datetime import timedelta
    app.run(debug=True)