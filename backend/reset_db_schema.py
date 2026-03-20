from config.database import engine
import models

print("Starting DB Reset...")
try:
    models.Base.metadata.drop_all(bind=engine)
    print("Dropped all tables.")
    models.Base.metadata.create_all(bind=engine)
    print("Created all tables.")
    print("DB Reset Successful.")
except Exception as e:
    print(f"DB Reset Failed: {e}")
