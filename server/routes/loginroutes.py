from flask import Blueprint, redirect, render_template, request, session, jsonify, current_app, url_for
import MySQLdb.cursors
from werkzeug.security import generate_password_hash, check_password_hash
from server.utils.users import get_user_by_username_or_email, insert_user

login_bp = Blueprint('login', __name__)


@login_bp.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        data = request.get_json()
        username = data.get('username')
        password = data.get('password')

        # Acessa com segurança a extensão mysql
        mysql = current_app.extensions.get('mysql')
        if mysql is None:
            return jsonify({'success': False, 'message': 'MySQL não está configurado'}), 500

        cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
        user = get_user_by_username_or_email(cursor, username, username)
        cursor.close()

        if user and check_password_hash(user['password_hash'], password):
            session['user_id'] = user['id']
            session['username'] = user['username']
            return jsonify({'success': True}), 200
        else:
            return jsonify({'success': False, 'message': 'Login inválido'}), 401

    return render_template('login.html')


@login_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    email = data.get('email')
    username = data.get('username')
    password = data.get('password')

    if not email or not username or not password:
        return jsonify({'success': False, 'message': 'Todos os campos são obrigatórios'}), 400

    mysql = current_app.extensions.get('mysql')
    if mysql is None:
        return jsonify({'success': False, 'message': 'MySQL não está configurado'}), 500

    cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)

    existing_user = get_user_by_username_or_email(cursor, username, email)
    if existing_user:
        cursor.close()
        return jsonify({'success': False, 'message': 'Usuário ou email já existe'}), 409

    hashed_password = generate_password_hash(password)
    insert_user(cursor, email, username, hashed_password)

    mysql.connection.commit()
    cursor.close()

    return jsonify({'success': True}), 201




#Logout\/
@login_bp.route('/logout')
def logout():
    session.pop('user_id', None)  # Remove o ID do usuário da sessão
    session.pop('username', None)  # Remove o nome do usuário da sessão
    return redirect(url_for('login.login'))  # Redireciona para a página de login
#-------------------------------------------------------------------------------------------

