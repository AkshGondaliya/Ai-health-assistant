from pydantic import BaseModel

class PredictionRequest(BaseModel):
    Age: int
    Gender: str
    Height: float
    Weight: float
    family_history_with_overweight: str
    FAVC: str
    FCVC: float
    CH2O: float
    FAF: float
    TUE: float