# dataroutes.py
from flask import Blueprint, render_template, url_for
from server.utils.auth import login_required 

# Define seu blueprint corretamente
page_bp = Blueprint('page', __name__)

# Rotas para os arquivos index

@page_bp.route('/')
@login_required
def index():
    return render_template('index.html')

@page_bp.route('/income')
@login_required
def income():
    return render_template('income.html')

@page_bp.route('/expense')
@login_required
def expense():
    return render_template('expense.html')

@page_bp.route('/datavalue')
@login_required
def datavalue():
    return render_template('datavalue.html')

@page_bp.route('/chart')
@login_required
def chart():
    return render_template('chart.html')

@page_bp.route('/exceldata')
@login_required
def exceldata():
    return render_template('exceldata.html')

@page_bp.route('/add-income')
def income_page():
    return render_template("income.html", transaction_url=url_for('data.add_transaction'))

def income_page():
    return render_template(
        "income.html",
        transaction_url=url_for('data.add_transaction')  # ESSENCIAL
    )
