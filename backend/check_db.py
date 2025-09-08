import sqlite3

try:
    conn = sqlite3.connect('fitnesspr.db')
    cursor = conn.cursor()
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
    tables = [row[0] for row in cursor.fetchall()]
    print('Tables in database:', tables)
    conn.close()
except Exception as e:
    print('Error:', e)
