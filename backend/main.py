from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import db, settings
from routes import auth, notes, tags, users

@asynccontextmanager
async def lifespan(app: FastAPI):
    db.connect()
    yield
    db.close()

app = FastAPI(lifespan=lifespan)

origins = [origin.strip() for origin in settings.ALLOWED_ORIGINS.split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # NO "*"
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ THEN routers
app.include_router(auth.router)
app.include_router(notes.router)
app.include_router(tags.router)
app.include_router(users.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to SnapNote Backend"}

@app.get("/healthz")
async def healthz():
    try:
        await db.client.admin.command("ping")
        return {"status": "ok", "db": "connected"}
    except Exception as e:
        return {"status": "error", "db": "disconnected", "details": str(e)}
