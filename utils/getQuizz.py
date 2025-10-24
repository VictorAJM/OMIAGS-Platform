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
    quiz_id = "68fa7e2c8612fb2797cde20e"
    create_course(quiz_id)
