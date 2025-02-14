from flask import Flask, request, jsonify
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from flask_cors import CORS
import joblib
import os

app = Flask(__name__)
CORS(app)

data = pd.DataFrame(columns=[
    "age", "gender", "jundice", "relation",
    "q1", "q2", "q3", "q4", "q5", "q6", "q7", "q8", "q9", "q10", "class"
])
model = RandomForestClassifier(random_state=42, n_estimators=100)

def clean_data(df):
    df.fillna({
        "age": 0, "gender": 0, "jundice": 0, "relation": 0,
        "q1": 0, "q2": 0, "q3": 0, "q4": 0, "q5": 0,
        "q6": 0, "q7": 0, "q8": 0, "q9": 0, "q10": 0, "class": 0
    }, inplace=True)
    return df

def add_class_column(df):
    if "class" not in df.columns:
        df["class"] = df["q1"].apply(lambda x: 1 if x > 0 else 0)
    return df


def ensure_consistent_features(input_df, model_features):
    for col in model_features:
        if col not in input_df.columns:
            input_df[col] = 0
    input_df = input_df[model_features]
    return input_df


def validate_and_prepare_input(input_data, required_fields):
    missing_fields = [field for field in required_fields if field not in input_data]
    if missing_fields:
        return {"error": f"Nedostaju polja: {', '.join(missing_fields)}"}, 400

    binary_map = {"Da": 1, "Ne": 0, "Muško": 0, "Žensko": 1}
    input_data = {k: binary_map.get(v, v) for k, v in input_data.items()}
    return input_data, 200

def predict_probability(model, input_df):
    prediction = model.predict_proba(input_df)[0][1] * 100
    return prediction

def update_dataset(data, input_data):
    data = pd.concat([data, pd.DataFrame([input_data])], ignore_index=True)
    temp_file = "asd_dataset_cleaned_temp.csv"
    data.to_csv(temp_file, index=False)
    os.replace(temp_file, "asd_dataset_cleaned.csv")
    return data


def retrain_model(data, model):
    if len(data) >= 10:
        X = data.drop(columns=["class"])
        y = data["class"].astype(int)
        model.fit(X, y)
        joblib.dump(model, "rf_model.pkl")
        print("Model je ponovno treniran sa ažuriranim podacima.")


def initialize_model():
    global data, model
    try:
        data = pd.read_csv("asd_dataset_cleaned.csv")
        print(f"Učitano {len(data)} uzoraka iz dataset-a.")
        data = clean_data(data)
        data = add_class_column(data)

        if len(data) >= 10:
            X = data.drop(columns=["class"])
            y = data["class"].astype(int)
            model.fit(X, y)
            print("Model je treniran na podacima.")
        else:
            print("Nema dovoljno podataka za treniranje modela.")
    except FileNotFoundError:
        print("Dataset nije pronađen. Početak sa praznim dataset-om.")
    except Exception as e:
        print(f"Greška prilikom inicijalizacije: {e}")

initialize_model()

@app.route('/predict', methods=['POST'])
def predict():
    global data, model
    try:
        input_data = request.get_json()

        required_fields = [
            "age", "gender", "jundice", "relation",
            "q1", "q2", "q3", "q4", "q5", "q6", "q7", "q8", "q9", "q10"
        ]
        validated_data, status = validate_and_prepare_input(input_data, required_fields)
        if status != 200:
            return jsonify(validated_data), status

        input_data = validated_data
        input_df = pd.DataFrame([input_data])

        model_features = data.drop(columns=["class"]).columns.tolist()
        input_df = ensure_consistent_features(input_df, model_features)

        if len(data) < 10:
            return jsonify({"error": "Nedovoljno podataka. Potrebno je minimalno 10 uzoraka za predikciju."}), 400

        if not hasattr(model, "feature_importances_"):
            return jsonify({"error": "Model nije treniran. Molimo pričekajte da se model inicijalizira."}), 500

        prediction = predict_probability(model, input_df)
        input_data["class"] = 1 if prediction > 50 else 0

        data = update_dataset(data, input_data)
        retrain_model(data, model)

        return jsonify({"probability": prediction})
    except Exception as e:
        print("Greška prilikom obrade predikcije:", str(e))
        return jsonify({"error": "Došlo je do greške prilikom obrade podataka."}), 500

if __name__ == '__main__':
    app.run(debug=True)
