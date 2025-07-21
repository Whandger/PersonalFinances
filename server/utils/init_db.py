import MySQLdb
import os
from dotenv import load_dotenv

def run_sql_script():
    load_dotenv()

    host = os.getenv('MYSQL_HOST', 'localhost')
    user = os.getenv('MYSQL_USER', 'root')
    password = os.getenv('MYSQL_PASSWORD', '')
    port = int(os.getenv('MYSQL_PORT', 3306))

    with open('database/init.sql', 'r', encoding='utf-8') as f:
        sql_script = f.read()

    try:
        # Conecta ao MySQL sem banco selecionado
        connection = MySQLdb.connect(
            host=host,
            user=user,
            passwd=password,
            port=port,
            charset='utf8'
        )
        cursor = connection.cursor()

        # Divide e executa os comandos
        for statement in sql_script.split(';'):
            stmt = statement.strip()
            if stmt:
                cursor.execute(stmt)

        connection.commit()
        cursor.close()
        connection.close()
        print('✅ Banco de dados inicializado com sucesso.')
    except Exception as e:
        print('❌ Erro ao inicializar o banco de dados:', e)