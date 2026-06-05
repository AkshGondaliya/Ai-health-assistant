import joblib
import pandas as pd

model = joblib.load(
    "app/ml/obesity_model.pkl"
)

def calculate_bmi(weight,height):
    return round(
        weight/(height*height),
        2
    )

def get_risk_level(bmi):

    if bmi < 18.5:
        return "Low"

    elif bmi < 25:
        return "Normal"

    elif bmi < 30:
        return "Moderate"

    return "High"

# Function to generate personalized recommendations based on BMI and other factors
def get_recommendation(
    bmi,
    data
):

    recommendations = []

    if bmi >= 30:

        recommendations.append(
            "Increase physical activity."
        )

        recommendations.append(
            "Reduce calorie intake."
        )

    elif bmi < 18.5:

        recommendations.append(
            "Increase healthy calorie intake."
        )

    else:

        recommendations.append(
            "Maintain healthy lifestyle."
        )

    # Physical Activity

    if data["FAF"] < 1:

        recommendations.append(
            "Exercise at least 30 minutes daily."
        )

    # Water Intake

    if data["CH2O"] < 2:

        recommendations.append(
            "Drink more water."
        )

    # Vegetable Consumption

    if data["FCVC"] < 2:

        recommendations.append(
            "Eat more vegetables."
        )

    # High Calorie Food

    if data["FAVC"] == "yes":

        recommendations.append(
            "Reduce fast food consumption."
        )

    # Family History

    if data[
        "family_history_with_overweight"
    ] == "yes":

        recommendations.append(
            "Monitor weight regularly."
        )

    return recommendations

def predict_obesity(data):

    df = pd.DataFrame([data])

    prediction = model.predict(df)

    bmi = calculate_bmi(
        data["Weight"],
        data["Height"]
    )

    return {
        "prediction": prediction[0],
        "bmi": bmi,
        "risk_level": get_risk_level(bmi),
        "recommendation": get_recommendation( bmi,
        data)
    }