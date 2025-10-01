import requests

API_URL = "http://localhost:5000/api/quizzes"

def create_course(quiz_object):
    try:
        response = requests.post(API_URL, json=quiz_object)
        response.raise_for_status()
        print("✅ Quiz created:", response.json())
    except requests.exceptions.RequestException as e:
        print("❌ Error creating quiz:", e)

if __name__ == "__main__":

    quiz = {
        "title": "Introduction to JavaScript",
        "description": "A quiz to test your basic knowledge of JavaScript fundamentals.",
        "courseId": "60d5ecb4b7c5a53da8d6f123",
        "questions": [
            {
            "title": "Which keyword is used to declare a variable that cannot be reassigned?",
            "type": "multiple-choice",
            "value": 1,
            "options": ["let", "var", "const", "static"],
            "correctAnswer": "const"
            },
            {
            "title": "The ______ object is the top-level object in a browser environment.",
            "type": "fill-in-the-blank",
            "value": 2,
            "correctAnswer": "window"
            }
        ]
    }

    create_course(
        quiz
    )
