# ASD Prediction

This project is an AI-based autism prediction system that consists of a Flask API backend and a simple web-based frontend. The backend utilizes a Random Forest model to predict the likelihood of autism based on input behavioral data.

## Features

- Machine learning model trained using Random Forest Classifier
- REST API built with Flask
- Web-based frontend using HTML, CSS, and JavaScript
- Data persistence and automatic model retraining

## 1. How to Set Up the Project

### 1.1 Install Dependencies

Navigate to the backend folder and install the required libraries:

```sh
cd backend
pip install -r requirements.txt
```
### 1.2 Run the Backend
Start the Flask server:

```sh
python app.py
```
The server will run on http://127.0.0.1:5000/ by default.

### 1.3 Run the Frontend

To start a local server for the frontend, use the following commands in the terminal:

```sh
cd frontend
python -m http.server 8000
```
This will run the server on port 8000, and you can access the frontend at:

🔗 http://127.0.0.1:8000
## 2. Dataset
For this project, the [Autistic Spectrum Disorder Screening Data for Children](https://archive.ics.uci.edu/dataset/419/autistic+spectrum+disorder+screening+data+for+children)
dataset from the **UCI Machine Learning Repository** was used. It contains 292 instances with 21 attributes, including demographic data and behavioral test results, enabling effective autism risk prediction.


## 3. API Routes
**POST /predict**

**Description:** Accepts user input data and returns the predicted probability of autism.

- **Request Body (JSON):**
``` json
{
  "age": 5,
  "gender": "0",
  "jundice": "1",
  "relation": "0",
  "q1": 1, "q2": 0, "q3": 1, "q4": 0, "q5": 1,
  "q6": 0, "q7": 1, "q8": 0, "q9": 1, "q10": 0
}
``` 
- **Response:**

``` json
{
  "probability": 76.5
}
```

## 4.Notes

- This project **is not** a diagnostic tool but an experimental application for pattern analysis.

- The model is retrained automatically when enough new data is collected.

- The API supports CORS, so it can be used with external applications.

## 5. Future Improvements

- Improve the model with a larger dataset

- Add a database for better data storage

- Enhance the frontend with a better UI design