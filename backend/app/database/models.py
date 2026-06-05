from sqlalchemy.orm import DeclarativeBase
from sqlalchemy import Column,Integer,String,Float,ForeignKey
from sqlalchemy import DateTime
from datetime import datetime

class Base(DeclarativeBase):
    pass
# User Model
class User(Base):

    __tablename__ = "users"

    id = Column(
        Integer,
        primary_key=True
    )

    name = Column(String)

    email = Column(String)

    password = Column(String)

    target_weight_kg = Column(Float, nullable=True)


# Prediction Model
class Prediction(Base):

    __tablename__ = "predictions"

    id = Column(
        Integer,
        primary_key=True
    )

    user_id = Column(
        Integer,
        ForeignKey("users.id")
    )

    prediction = Column(String)

    bmi = Column(Float)

    risk_level = Column(String)

    recommendation = Column(String)
    
    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )

