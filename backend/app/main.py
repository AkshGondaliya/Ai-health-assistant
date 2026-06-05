from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.prediction_router import router

from fastapi import Depends
from sqlalchemy.orm import Session
from app.database.models import Base
from app.database.database import engine
from app.database.database import get_db
from app.database.models import User

app = FastAPI(
    title="AI Health Assistant"
)

@app.on_event("startup")
def startup():
    Base.metadata.create_all(bind=engine)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:5173",
        "http://localhost:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from app.api.auth_router import router as auth_router
from app.api.user_router import (
    router as user_router
)


app.include_router(auth_router)
app.include_router(
    user_router
)
app.include_router(router)

@app.get("/")
def home():
    return {
        "message":"API Running"
    }

@app.get("/users")
def get_users(
    db: Session = Depends(get_db)
):  

    users = db.query(User).all()

    return users

from app.exceptions.handlers import (
    global_exception_handler
)

app.add_exception_handler(
    Exception,
    global_exception_handler
)
