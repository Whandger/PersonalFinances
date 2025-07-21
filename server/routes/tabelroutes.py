from flask import Blueprint, jsonify, request, current_app, render_template
import MySQLdb.cursors

tabel_bp = Blueprint('tabel', __name__, url_prefix='/tabel')

@tabel_bp.route('/transactions', methods=['GET'])
def listar_transacoes():
    try:
        mysql = current_app.extensions.get('mysql')  # acessar aqui dentro da função
        cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
        cursor.execute(
            "SELECT id, tipo, categoria, valor, data, observacao FROM transactions ORDER BY data DESC"
        )
        transactions = cursor.fetchall()
        cursor.close()
        return jsonify({'success': True, 'transactions': transactions}), 200
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@tabel_bp.route('/registros')
def registros():
    try:
        mysql = current_app.extensions.get('mysql')  # acessar aqui dentro da função
        cursor = mysql.connection.cursor()
        cursor.execute("SELECT * FROM registros")  # ajuste o nome da tabela se necessário
        registros = cursor.fetchall()
        cursor.close()
        return render_template('registros.html', registros=registros)
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500
