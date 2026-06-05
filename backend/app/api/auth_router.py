from fastapi import APIRouter

router = APIRouter(
    prefix="/auth",
    tags=["Auth"]
)

from fastapi import Depends
from sqlalchemy.orm import Session

from app.database.database import get_db

from app.schemas.register_request import RegisterRequest

from app.services.user_service import create_user
from app.core.logger import logger

#Register Endpoint
@router.post("/register")

def register(

    request:RegisterRequest,

    db:Session=Depends(get_db)

):

    user = create_user(
        db,
        request
    )

    return {

        "id":user.id,

        "email":user.email
    }


# Login Endpoint

from fastapi import HTTPException

from app.schemas.login_request import LoginRequest

from app.services.user_service import (
    get_user_by_email
)

from app.auth.security import (
    verify_password
)

from app.auth.jwt_handler import (
    create_access_token
)

@router.post("/login")
def login(
    request: LoginRequest,
    db: Session = Depends(get_db)
):

    user = get_user_by_email(
        db,
        request.email
    )

    logger.info(
        f"User login attempt: {request.email}"
    )
    if not user:

        raise HTTPException(
            status_code=401,
            detail="Invalid email"
        )

    if not verify_password(
        request.password,
        user.password
    ):

        raise HTTPException(
            status_code=401,
            detail="Invalid password"
        )

    token = create_access_token(
        {
            "user_id": user.id,
            "email": user.email
        }
    )

    return {
        "access_token": token,
        "token_type": "bearer"
    }


from fastapi.security import OAuth2PasswordRequestForm

from app.auth.jwt_handler import create_access_token

from app.auth.security import verify_password

from app.services.user_service import get_user_by_email

from fastapi import HTTPException

@router.post("/token")
def token_login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):

    user = get_user_by_email(
        db,
        form_data.username
    )

    if not user:

        raise HTTPException(
            status_code=401,
            detail="Invalid Credentials"
        )

    if not verify_password(
        form_data.password,
        user.password
    ):

        raise HTTPException(
            status_code=401,
            detail="Invalid Credentials"
        )

    access_token = create_access_token(
        {
            "user_id": user.id,
            "email": user.email
        }
    )

    return {
        "access_token": access_token,
        "token_type": "bearer"
    }
