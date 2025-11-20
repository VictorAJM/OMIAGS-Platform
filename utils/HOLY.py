import requests
import random
import sys
import time

# ==========================================
# CONFIGURATION
# ==========================================
BASE_URL = "http://localhost:5000/api"
AUTH_LOGIN_URL = f"{BASE_URL}/auth/login"
AUTH_REGISTER_URL = f"{BASE_URL}/auth/register"
COURSE_URL = f"{BASE_URL}/courses"
LESSON_URL = f"{BASE_URL}/lessons"
QUIZ_URL = f"{BASE_URL}/quizzes"
QUIZ_ATTEMPT_URL = f"{BASE_URL}/quizzes/no-auth-submit-answer"

# ==========================================
# DATASETS
# ==========================================

CATEGORIES = ["Secundaria", "Preparatoria"]

# Course Data
COURSE_DATA = [
    {"title": "Taller de Robótica con Arduino", "desc": "Aprende electrónica básica y construye tu primer robot.", "cat": "Secundaria"},
    {"title": "Fotografía Digital y Edición", "desc": "Dominio de la cámara, iluminación y retoque básico.", "cat": "Secundaria"},
    {"title": "Finanzas Personales para Jóvenes", "desc": "Cómo ahorrar, invertir y manejar tu primer presupuesto.", "cat": "Preparatoria"},
    {"title": "Desarrollo de Videojuegos 2D", "desc": "Programación lógica y diseño de niveles en Unity.", "cat": "Preparatoria"},
    {"title": "Oratoria y Debate Público", "desc": "Técnicas para hablar frente a audiencias sin miedo.", "cat": "Preparatoria"},
    {"title": "Huerto Urbano y Sustentabilidad", "desc": "Cultivo de alimentos orgánicos en espacios pequeños.", "cat": "Secundaria"},
    {"title": "Producción Musical Digital", "desc": "Creación de beats, mezcla y uso de software de audio.", "cat": "Preparatoria"}
]

# Video Placeholders
YOUTUBE_LINKS = [
    "https://www.youtube.com/watch?v=dQw4w9WgXcQ", 
    "https://www.youtube.com/watch?v=jNQXAC9IVRw",
    "https://www.youtube.com/watch?v=9bZkp7q19f0", 
    "https://www.youtube.com/watch?v=3tmd-ClpJxA",
]

# Quiz Question Bank
QUESTION_BANK = [
    {
        "title": "Which C++ fundamental data type is typically used to store single-precision floating-point numbers?",
        "type": "multiple-choice",
        "options": ["int", "double", "float", "bool"],
        "correctAnswer": "float"
    },
    {
        "title": "A ______ loop in C++ is an exit-controlled loop, meaning its condition is checked after its body executes at least once.",
        "type": "fill-in-the-blank",
        "correctAnswer": "do-while"
    },
    {
        "title": "Select all of the following C++ operators that are used for logical operations:",
        "type": "multiple-answer",
        "options": ["+", "&&", ">", "||", "!", "*"],
        "correctAnswer": ["&&", "||", "!"]
    },
    {
        "title": "Fill in the missing code to correctly output \"Access granted\" only if the integer variable 'age' is greater than or equal to 18:",
        "code": "int age = 20;\n[blank]\n{\n\tstd::cout << \"Access granted\";\n}",
        "type": "complete-the-code",
        "options": ["if (age >= 18)", "if (age == 18)", "while (age > 17)"],
        "lang": "cpp",
        "correctAnswer": "if (age >= 18)"
    },
    {
        "title": "In C++, the expression 5 / 2 results in 2.5.",
        "type": "true-false",
        "correctAnswer": "False"
    }
]

# ==========================================
# AUTH HELPER FUNCTIONS
# ==========================================

def get_admin_token():
    """Logs in or Registers the Admin/Director."""
    email = "jaramillovictorarmando@gmail.com"
    password = "Hola1234"
    name = "Director Académico"

    print(f"🔑 Logging in as Admin ({email})...")
    try:
        res = requests.post(AUTH_LOGIN_URL, json={"email": email, "password": password})
        if res.status_code == 200:
            return res.json().get("token")
        
        print("   ↳ Account not found. Creating Admin account...")
        requests.post(AUTH_REGISTER_URL, json={"name": name, "email": email, "password": password})
        
        res = requests.post(AUTH_LOGIN_URL, json={"email": email, "password": password})
        if res.status_code == 200:
            return res.json().get("token")
    except Exception as e:
        print(f"❌ Connection Error: {e}")
    
    print("❌ Critical: Could not authenticate Admin.")
    return None

def get_or_create_students(amount=5):
    """
    Logs in or Registers test students. 
    Returns a list of dictionaries: [{'id': '...', 'email': '...'}]
    """
    students = []
    print(f"👥 Preparing {amount} Test Students...")

    for i in range(1, amount + 1):
        email = f"test_{i}@test.com"
        password = "password123"
        name = f"Test Student {i}"
        
        # Try Login
        user_data = None
        res = requests.post(AUTH_LOGIN_URL, json={"email": email, "password": password})
        
        if res.status_code == 200:
            data = res.json()
            if 'user' in data and '_id' in data['user']:
                user_data = {'id': data['user']['_id'], 'email': email}
            elif 'id' in data:
                 user_data = {'id': data['id'], 'email': email}
            else:
                pass 

        else:
            # Try Register
            res_reg = requests.post(AUTH_REGISTER_URL, json={"name": name, "email": email, "password": password})
            if res_reg.status_code in [200, 201]:
                data = res_reg.json()
                if 'user' in data and '_id' in data['user']:
                    user_data = {'id': data['user']['_id'], 'email': email}
                elif '_id' in data:
                    user_data = {'id': data['_id'], 'email': email}
        
        if user_data:
            students.append(user_data)
        else:
            students.append({'id': None, 'email': email})

    print(f"   ↳ {len(students)} students ready.")
    return students

# ==========================================
# CREATION FUNCTIONS
# ==========================================

def create_course(token, course_info, student_emails):
    """Creates a course and enrolls students."""
    headers = {"Authorization": f"Bearer {token}"}
    
    # Randomly enroll subset
    subset_size = random.randint(min(3, len(student_emails)), len(student_emails))
    enrollees = random.sample(student_emails, k=subset_size)

    payload = {
        "title": course_info["title"],
        "description": course_info["desc"],
        "category": course_info["cat"],
        "accessList": enrollees
    }

    try:
        res = requests.post(COURSE_URL, json=payload, headers=headers)
        if res.status_code in [200, 201]:
            data = res.json()
            c_id = data.get("id") or data.get("_id")
            print(f"📚 Course Created: '{data.get('title')}' (ID: {c_id})")
            return c_id
        else:
            print(f"❌ Error creating course: {res.text}")
            return None
    except Exception as e:
        print(f"❌ Error: {e}")
        return None

def add_lessons(token, course_id):
    """
    Adds video lessons to the course.
    UPDATED: Returns a list of lesson IDs so we can attach quizzes to them.
    """
    headers = {"Authorization": f"Bearer {token}"}
    num_lessons = random.randint(3, 5)
    created_lesson_ids = []

    for i in range(1, num_lessons + 1):
        content_payload = [{
            "title": f"Video del Tema {i}",
            "type": "video",
            "url": random.choice(YOUTUBE_LINKS)
        }]
        
        payload = {
            "courseId": course_id,
            "title": f"Lección {i}: Conceptos Fundamentales",
            "description": "Visualizar el video completo para asistencia.",
            "contents": content_payload
        }
        
        try:
            res = requests.post(LESSON_URL, json=payload, headers=headers)
            if res.status_code in [200, 201]:
                data = res.json()
                l_id = data.get("id") or data.get("_id")
                if l_id:
                    created_lesson_ids.append(l_id)
        except Exception as e:
            print(f"   ❌ Error adding lesson: {e}")
    
    print(f"   ↳ Added {len(created_lesson_ids)} Video Lessons.")
    return created_lesson_ids

def add_quizzes(token, lesson_ids):
    """
    1. Crea el quiz (POST /api/quizzes).
    2. Agrega la referencia del quiz a la lección (PUT /api/lessons/:id).
    """
    headers = {"Authorization": f"Bearer {token}"}
    created_quizzes_info = [] 

    print(f"   🔄 Creating quizzes and linking them to {len(lesson_ids)} lessons...")

    for i, lesson_id in enumerate(lesson_ids):
        # =================================================
        # PASO 1: CREAR EL QUIZ (POST)
        # =================================================
        
        # Preparar preguntas
        questions = [q.copy() for q in QUESTION_BANK if random.random() > 0.3]
        if not questions: questions = [QUESTION_BANK[0].copy()]
        for q in questions: q["value"] = random.randint(1, 10)

        quiz_title = f"Quiz {i+1}: Evaluación Práctica"
        
        quiz_payload = {
            "title": quiz_title,
            "description": "Demuestra lo aprendido en esta lección.",
            "lessonId": lesson_id, 
            "questions": questions
        }

        quiz_id = None
        quiz_data = None

        try:
            # POST al endpoint de Quizzes
            res = requests.post(QUIZ_URL, json=quiz_payload, headers=headers)
            if res.status_code in [200, 201]:
                quiz_data = res.json()
                quiz_id = quiz_data.get("id") or quiz_data.get("_id")
            else:
                print(f"      ❌ Error creando Quiz para lección {lesson_id}: {res.text}")
                continue # Si falla el quiz, saltamos a la siguiente lección
        except Exception as e:
            print(f"      ❌ Excepción creando Quiz: {e}")
            continue

        # =================================================
        # PASO 2: AGREGAR REFERENCIA A LA LECCIÓN (PUT)
        # =================================================
        
        if quiz_id:
            try:
                # A. Obtener contenidos actuales (GET)
                get_res = requests.get(f"{LESSON_URL}/{lesson_id}", headers=headers)
                if get_res.status_code != 200:
                    print("      ⚠️ No se pudo obtener la lección para actualizar.")
                    continue
                
                lesson_data = get_res.json()
                current_contents = lesson_data.get("contents", []) or []

                # B. Crear el objeto de contenido (Referencia al Quiz)
                # Nota: Aquí NO guardamos las preguntas de nuevo, solo la referencia
                new_content_item = {
                    "title": quiz_title,
                    "type": "quiz",     # Tipo de contenido
                    "quizId": quiz_id   # ID del quiz creado en el paso 1
                }

                current_contents.append(new_content_item)

                # C. Actualizar la lección (PUT)
                put_payload = {
                    "contents": current_contents
                }

                put_res = requests.put(f"{LESSON_URL}/{lesson_id}", json=put_payload, headers=headers)

                if put_res.status_code == 200:
                    # Guardamos info para la simulación de intentos
                    created_quizzes_info.append({"id": quiz_id, "data": quiz_data})
                else:
                    print(f"      ❌ Falló al vincular Quiz a la Lección. Status: {put_res.status_code}")

            except Exception as e:
                print(f"      ❌ Error en el proceso de vinculación (PUT): {e}")

    print(f"   ↳ Created and Linked {len(created_quizzes_info)} Quizzes.")
    return created_quizzes_info

def simulate_attempts(student_list, quizzes):
    """Simulates students taking the quizzes."""
    attempts_count = 0
    
    for quiz_obj in quizzes:
        quiz_id = quiz_obj["id"]
        quiz_data = quiz_obj["data"]
        
        for student in student_list:
            if not student['id']: continue # Skip if we couldn't capture ID
            
            # 50% chance a student takes a specific quiz
            if random.random() < 0.5: continue

            # Loop through questions in the quiz
            for idx, question in enumerate(quiz_data.get("questions", [])):
                
                # Determine answer (Correct or Garbage)
                ans = question.get("correctAnswer")
                if random.random() < 0.2: # 20% chance to fail
                    ans = "Wrong Answer Value"

                payload = {
                    "quizId": quiz_id,
                    "userId": student['id'],
                    "questionIndex": idx,
                    "answer": ans
                }
                
                try:
                    requests.post(QUIZ_ATTEMPT_URL, json=payload)
                except:
                    pass
            
            attempts_count += 1

    if attempts_count > 0:
        print(f"   ↳ 🤖 Simulated {attempts_count} student attempts on these quizzes.")

# ==========================================
# MAIN EXECUTION
# ==========================================

def main():
    print("==========================================")
    print("   FULL SEED: COURSES, LESSONS, QUIZZES")
    print("==========================================\n")

    # 1. Authenticate Admin
    token = get_admin_token()
    if not token: sys.exit(1)

    # 2. Get/Create Students (Need IDs for Quizzes, Emails for Courses)
    students = get_or_create_students(amount=5)
    student_emails = [s['email'] for s in students]
    
    print("")
    print("--- Starting Content Generation ---")

    # 3. Loop through Course Data
    for info in COURSE_DATA:
        # A. Create Course
        course_id = create_course(token, info, student_emails)
        
        if course_id:
            # B. Add Video Lessons (UPDATED to return IDs)
            lesson_ids = add_lessons(token, course_id)
            
            # C. Add Quizzes (UPDATED to take lesson_ids)
            if lesson_ids:
                created_quizzes = add_quizzes(token, lesson_ids)
                
                # D. Simulate Attempts
                if created_quizzes and students:
                    simulate_attempts(students, created_quizzes)

            time.sleep(0.2) # Prevent race conditions/locks

    print("\n==========================================")
    print("✅ SUCCESS: Database populated.")
    print("==========================================")

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n🛑 Script stopped")
    except requests.exceptions.ConnectionError:
        print("\n❌ ERROR: Server is not running on localhost:5000")