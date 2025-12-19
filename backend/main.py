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

app.include_router(auth.router)
app.include_router(notes.router)
app.include_router(tags.router)
app.include_router(users.router)

origins = [origin.strip() for origin in settings.ALLOWED_ORIGINS.split(",")]
print(f"DEBUG: Allowed Origins: {origins}")

@app.middleware("http")
async def log_requests(request: Request, call_next):
    print(f"Incoming request: {request.method} {request.url}")
    origin = request.headers.get('origin')
    print(f"Origin header: {origin}")
    if origin:
        if origin in origins:
             print(f"Origin {origin} is allowed.")
        else:
             print(f"Origin {origin} is NOT in allowed origins: {origins}")
    
    response = await call_next(request)
    print(f"Response status: {response.status_code}")
    return response

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Welcome to SnapNote Backend"}

@app.get("/healthz")
async def healthz():
    try:
        await db.client.admin.command('ping')
        return {"status": "ok", "db": "connected"}
    except Exception as e:
        return {"status": "error", "db": "disconnected", "details": str(e)}