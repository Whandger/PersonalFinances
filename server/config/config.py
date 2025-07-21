import os

class Config:
    SECRET_KEY = os.getenv('SECRET_KEY', 'chave_padrao')
    MYSQL_HOST = os.getenv('MYSQL_HOST', 'localhost')
    MYSQL_USER = os.getenv('MYSQL_USER', 'root')
    MYSQL_PASSWORD = os.getenv('MYSQL_PASSWORD', '')
    MYSQL_DB = os.getenv('MYSQL_DB', 'SistemaLogin')
    MYSQL_PORT = int(os.getenv('MYSQL_PORT', 3306))
    DEBUG = False
    TESTING = False

class DevelopmentConfig(Config):
    DEBUG = True

class ProductionConfig(Config):
    DEBUG = False
