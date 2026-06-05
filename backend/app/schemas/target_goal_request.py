from pydantic import BaseModel

class TargetGoalRequest(BaseModel):
    target_weight_kg: float
