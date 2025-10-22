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
        "title": "Basic C++ Fundamentals",
        "description": "A quiz to test your foundational knowledge of C++ data types, control structures, and operators.",
        "courseId": "60d5ecb4b7c5a53da8d6f123",
        "questions": [
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
            }
        ]
    }

    create_course(
        quiz
    )
