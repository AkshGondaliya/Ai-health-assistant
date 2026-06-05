from unittest import result

from fastapi import APIRouter

from app.schemas.prediction_schema import PredictionRequest
from app.schemas.prediction_response import PredictionResponse

from app.services.prediction_service import predict_obesity
from fastapi import Depends
from app.core.logger import logger
from app.auth.dependencies import (
    get_current_user
)

from sqlalchemy.orm import Session

from app.database.database import (
    get_db
)

from app.services.prediction_db_service import (
    get_analytics, save_prediction,get_dashboard_data,delete_prediction
)

from app.services.prediction_db_service import (
    get_prediction_history
)
router = APIRouter()

# Endpoint to handle obesity prediction requests
@router.post("/predict")
def predict(

    request: PredictionRequest,

    db: Session = Depends(get_db),

    current_user=Depends(
        get_current_user
    )
):
    result = predict_obesity(
    request.model_dump()
 )
    logger.info(
    f"Prediction requested by {current_user['email']}"
)
    save_prediction(
        db,
        current_user["user_id"],
        result
    )

    return result

# New endpoint to fetch prediction history for the user
@router.get("/history")
def history(

    db: Session = Depends(get_db),

    current_user=Depends(
        get_current_user
    )
):

    return get_prediction_history(
        db,
        current_user["user_id"]
    )


# New endpoint to fetch dashboard data for the user
@router.get("/dashboard")
def dashboard(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    return get_dashboard_data(
        db,
        current_user["user_id"]
    )


# Analytics endpoint to provide insights based on prediction history
@router.get("/analytics")
def analytics(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    return get_analytics(
        db,
        current_user["user_id"]
    )

from fastapi import HTTPException
@router.delete("/history/{prediction_id}")
def remove_prediction(

    prediction_id: int,

    db: Session = Depends(get_db),

    current_user=Depends(
        get_current_user
    )
):

    result = delete_prediction(

        db,

        prediction_id,

        current_user["user_id"]
    )

    if not result:

        raise HTTPException(
            status_code=404,
            detail="Prediction Not Found"
        )

    return {
        "message":"Prediction Deleted"
    }

