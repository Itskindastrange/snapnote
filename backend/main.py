from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from database import db, settings
from routes import auth, notes, tags, users

@asynccontextmanager
async def lifespan(app: FastAPI):
    db.connect()
    yield
    db.close()

app = FastAPI(lifespan=lifespan)

# ✅ CORS MUST COME FIRST
origins = [origin.strip() for origin in settings.ALLOWED_ORIGINS.split(",")]
print(f"DEBUG: Allowed Origins: {origins}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # NO "*"
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ THEN custom middleware
@app.middleware("http")
async def log_requests(request: Request, call_next):
    print(f"Incoming request: {request.method} {request.url}")
    origin = request.headers.get("origin")
    print(f"Origin header: {origin}")

    response = await call_next(request)
    print(f"Response status: {response.status_code}")
    return response

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
