from pydantic import BaseModel

class UpdateProfileRequest(BaseModel):

    name: str