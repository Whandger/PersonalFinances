from flask import Blueprint, request, session, jsonify, current_app
import MySQLdb.cursors

data_bp = Blueprint('data', __name__, url_prefix='/data')

# Helper para checar autenticação
def get_user_id():
    user_id = session.get('user_id')
    if not user_id:
        return None, jsonify({'success': False, 'message': 'Usuário não autenticado'}), 401
    return user_id, None, None

# Listar todas as transações do usuário

@data_bp.route('/transactions', methods=['GET'], endpoint='listar_transacoes')
def listar_transacoes():
    user_id, err_resp, status = get_user_id()
    if err_resp:
        return err_resp, status

    mysql = current_app.extensions.get('mysql')
    cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
    try:
        cursor.execute(
            "SELECT id, tipo, categoria, valor, data, observacao FROM transactions WHERE user_id = %s ORDER BY data DESC",
            (user_id,)
        )
        transactions = cursor.fetchall()
    except Exception as e:
        cursor.close()
        return jsonify({'success': False, 'message': str(e)}), 500

    cursor.close()
    return jsonify({'success': True, 'transactions': transactions}), 200

# Criar uma nova transação
@data_bp.route('/transaction', methods=['POST'], endpoint='add_transaction')
def add_transaction():
    user_id, err_resp, status = get_user_id()
    if err_resp:
        return err_resp, status

    data = request.get_json()
    tipo = data.get('tipo')
    categoria = data.get('categoria')
    valor = data.get('valor')
    data_lancamento = data.get('data')
    observacao = data.get('observacao')

    if tipo not in ['income', 'expense']:
        return jsonify({'success': False, 'message': 'Tipo inválido'}), 400
    if not categoria or valor is None or not data_lancamento:
        return jsonify({'success': False, 'message': 'Campos obrigatórios faltando'}), 400

    mysql = current_app.extensions.get('mysql')
    cursor = mysql.connection.cursor()
    try:
        cursor.execute("""
            INSERT INTO transactions (user_id, tipo, categoria, valor, data, observacao)
            VALUES (%s, %s, %s, %s, %s, %s)
        """, (user_id, tipo, categoria, valor, data_lancamento, observacao))
        mysql.connection.commit()
        new_id = cursor.lastrowid
    except Exception as e:
        cursor.close()
        return jsonify({'success': False, 'message': str(e)}), 500

    cursor.close()
    return jsonify({'success': True, 'message': 'Transação adicionada com sucesso', 'id': new_id}), 201

# Atualizar uma transação pelo ID
@data_bp.route('/transaction/<int:trans_id>', methods=['PUT'], endpoint='atualizar_transaction')
def atualizar_transaction(trans_id):
    user_id, err_resp, status = get_user_id()
    if err_resp:
        return err_resp, status

    data = request.get_json()
    tipo = data.get('tipo')
    categoria = data.get('categoria')
    valor = data.get('valor')
    data_lancamento = data.get('data')
    observacao = data.get('observacao')

    if tipo not in ['income', 'expense']:
        return jsonify({'success': False, 'message': 'Tipo inválido'}), 400
    if not categoria or valor is None or not data_lancamento:
        return jsonify({'success': False, 'message': 'Campos obrigatórios faltando'}), 400

    mysql = current_app.extensions.get('mysql')
    cursor = mysql.connection.cursor()
    try:
        cursor.execute("""
            UPDATE transactions 
            SET tipo=%s, categoria=%s, valor=%s, data=%s, observacao=%s
            WHERE id=%s AND user_id=%s
        """, (tipo, categoria, valor, data_lancamento, observacao, trans_id, user_id))
        if cursor.rowcount == 0:
            cursor.close()
            return jsonify({'success': False, 'message': 'Transação não encontrada ou sem permissão'}), 404
        mysql.connection.commit()
    except Exception as e:
        cursor.close()
        return jsonify({'success': False, 'message': str(e)}), 500

    cursor.close()
    return jsonify({'success': True, 'message': 'Transação atualizada com sucesso'}), 200

# Deletar uma transação pelo ID
@data_bp.route('/transaction/<int:trans_id>', methods=['DELETE'], endpoint='deletar_transaction')
def deletar_transaction(trans_id):
    user_id, err_resp, status = get_user_id()
    if err_resp:
        return err_resp, status

    mysql = current_app.extensions.get('mysql')
    cursor = mysql.connection.cursor()
    try:
        cursor.execute("DELETE FROM transactions WHERE id=%s AND user_id=%s", (trans_id, user_id))
        if cursor.rowcount == 0:
            cursor.close()
            return jsonify({'success': False, 'message': 'Transação não encontrada ou sem permissão'}), 404
        mysql.connection.commit()
    except Exception as e:
        cursor.close()
        return jsonify({'success': False, 'message': str(e)}), 500

    cursor.close()
    return jsonify({'success': True, 'message': 'Transação deletada com sucesso'}), 200


