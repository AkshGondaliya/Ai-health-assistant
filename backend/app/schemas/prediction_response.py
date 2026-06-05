from pydantic import BaseModel

class PredictionResponse(BaseModel):
    prediction: str
    bmi: float
    risk_level: str
    recommendation: str