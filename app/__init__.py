# app/__init__.py
import os
from flask import Flask, render_template

def create_app(test_config=None):
    app = Flask(__name__, instance_relative_config=True)
    app.config.from_mapping(
        SECRET_KEY='dev', # Mude para um valor aleatório em produção
        DATABASE=os.path.join(app.instance_path, 'financas.db'),
    )

    if test_config is None:
        app.config.from_pyfile('config.py', silent=True)
    else:
        app.config.from_mapping(test_config)

    try:
        os.makedirs(app.instance_path)
    except OSError:
        pass

    # Inicializa o banco de dados
    from . import db
    db.init_app(app)

    # Registra as rotas da API
    from . import routes
    app.register_blueprint(routes.bp)

    # Rota principal que serve a página HTML
    @app.route('/')
    def index():
        return render_template('index.html')

    return app
