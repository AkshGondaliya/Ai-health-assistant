from app.database.models import Prediction

def save_prediction(
    db,
    user_id,
    result
):

    prediction = Prediction(

        user_id=user_id,

        prediction=result["prediction"],

        bmi=result["bmi"],

        risk_level=result["risk_level"],

        recommendation=
        ",".join(
        result["recommendation"]
)
    )

    db.add(prediction)

    db.commit()

    db.refresh(prediction)

    return prediction

def get_prediction_history(
    db,
    user_id
):

    return (
        db.query(Prediction)
        .filter(
            Prediction.user_id == user_id
        )
        .all()
    )

def get_dashboard_data(
    db,
    user_id
):

    predictions = (
        db.query(Prediction)

        .filter(
            Prediction.user_id == user_id
        )

        .all()
    )

    if not predictions:

        return {
            "total_predictions":0
        }

    latest = predictions[-1]

    return {
        "total_predictions":len(predictions),

        "latest_prediction":
        latest.prediction,

        "latest_bmi":
        latest.bmi,

        "latest_risk":
        latest.risk_level
    }

from sqlalchemy import func

def get_analytics(
    db,
    user_id
):

    avg_bmi = (
        db.query(
            func.avg(
                Prediction.bmi
            )
        )
        .filter(
            Prediction.user_id == user_id
        )
        .scalar()
    )

    max_bmi = (
        db.query(
            func.max(
                Prediction.bmi
            )
        )
        .filter(
            Prediction.user_id == user_id
        )
        .scalar()
    )

    min_bmi = (
        db.query(
            func.min(
                Prediction.bmi
            )
        )
        .filter(
            Prediction.user_id == user_id
        )
        .scalar()
    )

    return {
        "average_bmi": avg_bmi,
        "highest_bmi": max_bmi,
        "lowest_bmi": min_bmi
    }

def delete_prediction(
    db,
    prediction_id,
    user_id
):

    prediction = (
        db.query(Prediction)
        .filter(
            Prediction.id == prediction_id,
            Prediction.user_id == user_id
        )
        .first()
    )

    if not prediction:
        return None

    db.delete(prediction)

    db.commit()

    return True