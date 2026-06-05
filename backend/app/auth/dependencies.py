from fastapi import Depends
from fastapi import HTTPException

from fastapi.security import OAuth2PasswordBearer

from app.auth.jwt_handler import verify_token

oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="/auth/token"
)

def get_current_user(
    token: str = Depends(oauth2_scheme)
):

    payload = verify_token(token)

    if not payload:

        raise HTTPException(
            status_code=401,
            detail="Invalid Token"
        )

    return payload