import os
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    MONGODB_URI: str = "mongodb+srv://abdullahahmad_db_user:ogVjwfxAdTU6lPLN@cluster0.0cr6loe.mongodb.net/?appName=Cluster0"
    DB_NAME: str = "snapnote"
    JWT_SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    class Config:
        env_file = ".env"

settings = Settings()

class Database:
    client: AsyncIOMotorClient = None

    def connect(self):
        self.client = AsyncIOMotorClient(settings.MONGODB_URI)
        print("Connected to MongoDB")

    def close(self):
        if self.client:
            self.client.close()
            print("Closed MongoDB connection")

    def get_db(self):
        return self.client[settings.DB_NAME]

db = Database()