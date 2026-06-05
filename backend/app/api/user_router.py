from fastapi import APIRouter
from fastapi import Depends
from sqlalchemy.orm import Session

from app.auth.dependencies import (
    get_current_user
)
from app.database.database import get_db
from app.services.user_service import (
    get_user_by_id
)
from app.schemas.update_profile_request import (
    UpdateProfileRequest
)
from app.schemas.change_password_request import (
    ChangePasswordRequest
)
from fastapi import HTTPException

from app.services.user_service import (
    update_user, change_password, get_target_goal, update_target_goal
)
from app.schemas.target_goal_request import (
    TargetGoalRequest
)
router = APIRouter(
    prefix="/user",
    tags=["User"]
)

@router.get("/profile")
def profile(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    user = get_user_by_id(
        db,
        current_user["user_id"]
    )

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User Not Found"
        )

    return {
        "id": user.id,
        "name": user.name,
        "email": user.email
    }

@router.put("/profile")
def update_profile(
    request: UpdateProfileRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    user = update_user(
        db,
        current_user["user_id"],
        request
    )

    return {
        "message": "Profile Updated",
        "name": user.name
    }

@router.put(
    "/change-password"
)
def update_password(

    request:
    ChangePasswordRequest,

    db: Session = Depends(
        get_db
    ),

    current_user=Depends(
        get_current_user
    )
):

    result = change_password(

        db,

        current_user["user_id"],

        request.old_password,

        request.new_password
    )

    if not result:

        raise HTTPException(
            status_code=400,
            detail="Old Password Incorrect"
        )

    return {
        "message":
        "Password Changed Successfully"
    }


@router.get("/goal")
def get_goal(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    user = get_target_goal(
        db,
        current_user["user_id"]
    )

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User Not Found"
        )

    return {
        "target_weight_kg": user.target_weight_kg
    }


@router.put("/goal")
def set_goal(
    request: TargetGoalRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    if request.target_weight_kg <= 0:
        raise HTTPException(
            status_code=400,
            detail="Target weight must be greater than 0."
        )

    user = update_target_goal(
        db,
        current_user["user_id"],
        request.target_weight_kg
    )

    return {
        "message": "Target goal updated",
        "target_weight_kg": user.target_weight_kg
    }
