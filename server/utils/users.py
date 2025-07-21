def get_user_by_username_or_email(cursor, username, email):
    cursor.execute("SELECT * FROM users WHERE username = %s OR email = %s", (username, email))
    return cursor.fetchone()

def insert_user(cursor, email, username, hashed_password):
    cursor.execute(
        "INSERT INTO users (email, username, password_hash) VALUES (%s, %s, %s)",
        (email, username, hashed_password)
    )