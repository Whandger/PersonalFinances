from flask import Flask, session
from flask_mysqldb import MySQL
from dotenv import load_dotenv
import os

# Carrega variáveis do .env
load_dotenv()

# Instância global do MySQL
mysql = MySQL()

def create_app():
    print("Criando app e registrando blueprints...")

    app = Flask(
        __name__,
        template_folder=os.path.join(os.path.dirname(__file__), '..', 'templates'),
        static_folder=os.path.join(os.path.dirname(__file__), '..', 'static')
    )

    # Verifica o ambiente (development ou production)
    env = os.getenv('FLASK_ENV', 'development')

    if env == 'production':
        from server.config.config import ProductionConfig
        app.config.from_object(ProductionConfig)
    else:
        from server.config.config import DevelopmentConfig
        app.config.from_object(DevelopmentConfig)

    # Configura a chave secreta (pode estar na config ou no .env)
    app.secret_key = os.getenv('SECRET_KEY', 'sua_chave_secreta_segura')

    # Inicializa o MySQL com a app
    mysql.init_app(app)
    app.extensions['mysql'] = mysql

    # Roda script SQL de inicialização apenas em desenvolvimento
    if env == 'development':
        from server.utils.init_db import run_sql_script
        run_sql_script()

    # Context processor para passar username para templates
    @app.context_processor
    def inject_user():
        username = session.get('username')
        return dict(username=username)

    # Registrar blueprints, se ainda não registrados
    print(app.url_map)
    if 'page' not in app.blueprints:
        from server.routes.pageroutes import page_bp
        app.register_blueprint(page_bp)
    if 'login' not in app.blueprints:
        from server.routes.loginroutes import login_bp
        app.register_blueprint(login_bp)
    if 'data' not in app.blueprints:
        from server.routes.dataroute import data_bp
        app.register_blueprint(data_bp)
    if 'tabel' not in app.blueprints:
        from server.routes.tabelroutes import tabel_bp
        app.register_blueprint(tabel_bp)

    return app

if __name__ == '__main__':
    app = create_app()
    # Rodar app normalmente, debug True só em desenvolvimento
    debug_mode = os.getenv('FLASK_ENV', 'development') == 'development'
    app.run(debug=debug_mode, use_reloader=False)
