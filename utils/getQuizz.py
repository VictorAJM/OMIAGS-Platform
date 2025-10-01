import requests

API_URL = "http://localhost:5000/api/quizzes/"

def create_course(quiz_id):
    try:
        response = requests.get(API_URL+quiz_id)
        response.raise_for_status()
        print("✅ Quiz returned by the server:", response.json())
    except requests.exceptions.RequestException as e:
        print("❌ Error requesting the quiz:", e)

if __name__ == "__main__":
    quiz_id = "68dcaf1c9f7926ba2952d98d"
    create_course(quiz_id)
