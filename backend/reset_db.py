import os
import sys
from urllib.parse import quote_plus
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), '../.gitenv'))

from sqlalchemy import create_engine
from sqlalchemy import text
from models import Base

mysql_user = os.getenv("MYSQL_USER", "root")
mysql_password = os.getenv("MYSQL_PASSWORD", "")
mysql_host = os.getenv("MYSQL_HOST", "localhost")
mysql_db = os.getenv("MYSQL_DATABASE", "youtube_analytics")
encoded_password = quote_plus(mysql_password) if mysql_password else ""

# Connect without DB to recreate the entire DB
root_url = f"mysql+pymysql://{mysql_user}:{encoded_password}@{mysql_host}/"
print("Connecting to root MySQL...")

try:
    engine_root = create_engine(root_url)
    with engine_root.begin() as conn:
        print(f"Dropping database {mysql_db}...")
        conn.execute(text(f"DROP DATABASE IF EXISTS {mysql_db}"))
        print(f"Creating database {mysql_db}...")
        conn.execute(text(f"CREATE DATABASE {mysql_db}"))

    # Now connect to the newly created DB and create tables
    db_url = f"mysql+pymysql://{mysql_user}:{encoded_password}@{mysql_host}/{mysql_db}"
    engine = create_engine(db_url)
    print("Creating tables via Base.metadata...")
    Base.metadata.create_all(bind=engine)
    print("Tables created successfully!")
except Exception as e:
    with open("db_error2.txt", "w") as f:
        import traceback
        traceback.print_exc(file=f)
    print("Recreation error written to db_error2.txt")
