import requests
import random

API_URL = "http://localhost:5000/api"


# List of course ID's to create mock quizzes for
COURSES = [
    "68dca9ad38c974b08f2263fd",
]

# List of user ID's to create mock quiz attempts for
USERS = [
    "691ced2d11c9f360f5783b10"
]

QUIZZES_PER_COURSE = 5;

question_bank = [
    # Multiple-Choice
    {
        "title": "Which C++ fundamental data type is typically used to store single-precision floating-point numbers?",
        "type": "multiple-choice",
        "value": 1,
        "options": ["int", "double", "float", "bool"],
        "correctAnswer": "float"
    },
    # Fill-in-the-Blank
    {
        "title": "A ______ loop in C++ is an exit-controlled loop, meaning its condition is checked after its body executes at least once.",
        "type": "fill-in-the-blank",
        "value": 1,
        "correctAnswer": "do-while"
    },
    # Multiple-Answer
    {
        "title": "Select all of the following C++ operators that are used for logical operations:",
        "type": "multiple-answer",
        "value": 2,
        "options": ["+", "&&", ">", "||", "!", "*"],
        "correctAnswer": ["&&", "||", "!"]
    },
    # Complete-the-Code
    {
        "title": "Fill in the missing code to correctly output \"Access granted\" only if the integer variable 'age' is greater than or equal to 18:",
        "code": "int age = 20;\n[blank]\n{\n\tstd::cout << \"Access granted\";\n}",
        "type": "complete-the-code",
        "value": 2,
        "options": ["if (age >= 18)", "if (age == 18)", "while (age > 17)"],
        "lang": "cpp",
        "correctAnswer": "if (age >= 18)"
    },
    # True-False
    {
        "title": "In C++, the expression 5 / 2 results in 2.5.",
        "type": "true-false",
        "value": 2,
        "correctAnswer": "False"
    },{
        "title": "NOT NOT",
        "type": "true-false",
        "value": 2,
        "correctAnswer": "True"
    },{
        "title": "NOT TRUE",
        "type": "true-false",
        "value": 2,
        "correctAnswer": "False"
    },
    # Multiple-Choice (Second one for variety)
    {
        "title": "What is the correct syntax for a 'for' loop that iterates 5 times, from $i=0$ up to $i=4$?",
        "type": "multiple-choice",
        "value": 1,
        "options": [
            "for (int i; i < 5; i++)",
            "for (int i = 0; i <= 5; i++)",
            "for (int i = 0; i < 5; i++)",
            "for (i = 0; i < 5; i++)"
        ],
        "correctAnswer": "for (int i = 0; i < 5; i++)"
    },
]

quiz_ids = []
quizzes = {}

def create_new_quiz(course_id, index):
    questions = [q for q in question_bank if random.random() > 0.3]
    for i in range(len(questions)):
        questions[i]["value"] = random.randint(1, 10)

    quiz = {
        "title": f"Test quiz {index}",
        "description": "Just a test quiz.",
        "courseId": course_id,
        "questions" : questions
    }

    response = requests.post(f"{API_URL}/quizzes", json=quiz)
    print(f"✅ Quiz {index} created")

    q_id = response.json()["_id"]
    quiz_ids.append(q_id)
    quizzes[q_id] = quiz

def create_attempt(user_id, quiz_id):
    quiz = quizzes[quiz_id]

    for i in range(len(quiz["questions"])):
        if random.random() < .05:
            break
    
        ans = quiz["questions"][i]["correctAnswer"]
        if random.random() < 0.2:
            ans = "Wrong answer ._."
            
        response = requests.post(f"{API_URL}/quizzes/no-auth-submit-answer", json={
            "quizId": quiz_id,
            "userId": user_id,
            "questionIndex": i,
            "answer": ans
        })
    
    print(f"✅ Quiz attempt created")

if __name__ == "__main__":

    for c_id in COURSES:
        for i in range(QUIZZES_PER_COURSE):
            create_new_quiz(c_id, i+1)
    
    for u_id in USERS:
        for q_id in quiz_ids:
            create_attempt(u_id, q_id)