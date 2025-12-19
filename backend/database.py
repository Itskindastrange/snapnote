import os
import logging
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic_settings import BaseSettings

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class Settings(BaseSettings):
    MONGODB_URI: str = "mongodb+srv://abdullahahmad_db_user:ogVjwfxAdTU6lPLN@cluster0.0cr6loe.mongodb.net/?appName=Cluster0"
    DB_NAME: str = "snapnote"
    JWT_SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    ALLOWED_ORIGINS: str = "http://localhost:3000"

    class Config:
        env_file = ".env"

settings = Settings()

class Database:
    client: AsyncIOMotorClient = None

    def connect(self):
        uri = settings.MONGODB_URI
        if not uri:
            logger.error("MONGODB_URI is not set.")
            raise ValueError("MONGODB_URI is not set.")

        if not uri.startswith(("mongodb://", "mongodb+srv://")):
            # Mask sensitive info for logging
            masked = uri
            if "@" in uri:
                # hide credentials: scheme://user:pass@host -> ...@host
                masked = "..." + uri.split("@")[-1]
            logger.error(f"Invalid MONGODB_URI scheme. Got: {masked}")
        
        try:
            self.client = AsyncIOMotorClient(uri)
            print("Connected to MongoDB")
            logger.info("Connected to MongoDB")
        except Exception as e:
            logger.error(f"Error connecting to MongoDB: {e}")
            raise

    def close(self):
        if self.client:
            self.client.close()
            print("Closed MongoDB connection")

    def get_db(self):
        return self.client[settings.DB_NAME]

db = Database()