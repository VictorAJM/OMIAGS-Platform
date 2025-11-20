import requests
import random
import sys
import time

# Configuration
BASE_URL = "http://localhost:5000/api"
AUTH_LOGIN_URL = f"{BASE_URL}/auth/login"
AUTH_REGISTER_URL = f"{BASE_URL}/auth/register" # Kept just for the admin
COURSE_URL = f"{BASE_URL}/courses"
LESSON_URL = f"{BASE_URL}/lessons"

# Categories
CATEGORIES = ["Secundaria", "Preparatoria"]

# Course Data (School Subjects)
COURSE_DATA = [
    {"title": "Matemáticas I: Álgebra Básica", "desc": "Introducción a variables y ecuaciones lineales.", "cat": "Secundaria"},
    {"title": "Historia de México", "desc": "Desde la época prehispánica hasta la independencia.", "cat": "Secundaria"},
    {"title": "Biología General", "desc": "La célula, genética y biodiversidad.", "cat": "Preparatoria"},
    {"title": "Física II: Mecánica", "desc": "Leyes de Newton y movimiento rectilíneo.", "cat": "Preparatoria"},
    {"title": "Literatura Universal", "desc": "Análisis de obras clásicas y modernas.", "cat": "Preparatoria"},
    {"title": "Geografía Mundial", "desc": "Recursos naturales y geopolítica.", "cat": "Secundaria"},
    {"title": "Química Orgánica", "desc": "Estructura del carbono y grupos funcionales.", "cat": "Preparatoria"}
]

# Video Placeholders
YOUTUBE_LINKS = [
    "https://www.youtube.com/watch?v=dQw4w9WgXcQ", 
    "https://www.youtube.com/watch?v=jNQXAC9IVRw",
    "https://www.youtube.com/watch?v=9bZkp7q19f0", 
    "https://www.youtube.com/watch?v=3tmd-ClpJxA",
]

def get_admin_token():
    """
    Logs in as the Director/Admin to own the courses.
    (If this user doesn't exist, it tries to create it first).
    """
    email = "jaramillovictorarmando@gmail.com"
    password = "Hola1234"
    name = "Director Académico"

    # 1. Try Login first
    print(f"🔑 Logging in as Admin ({email})...")
    res = requests.post(AUTH_LOGIN_URL, json={"email": email, "password": password})
    
    if res.status_code == 200:
        return res.json().get("token")
    
    # 2. If login fails, try to Register
    print("   ↳ Account not found. Creating Admin account...")
    requests.post(AUTH_REGISTER_URL, json={"name": name, "email": email, "password": password})
    
    # 3. Login again
    res = requests.post(AUTH_LOGIN_URL, json={"email": email, "password": password})
    if res.status_code == 200:
        return res.json().get("token")
    
    print(f"❌ Critical: Could not authenticate Admin. {res.text}")
    return None

def get_existing_student_emails(amount=10):
    """
    Generates the list of emails for the users that ALREADY exist in your DB.
    We don't call the API here, we just generate the strings to send in the enrollments.
    """
    emails = [f"test_{i}@test.com" for i in range(1, amount + 1)]
    print(f"👥 Target Students: {emails[0]} ... {emails[-1]}")
    return emails

def create_course_with_enrollments(token, course_info, student_emails):
    """Creates a course and enrolls a random subset of the existing students"""
    
    # Randomly pick students to enroll (e.g., 5 to 10 students per course)
    # Adjust 'k' if you have fewer than 5 test users
    subset_size = random.randint(min(3, len(student_emails)), len(student_emails))
    enrollees = random.sample(student_emails, k=subset_size)
    
    headers = {"Authorization": f"Bearer {token}"}
    payload = {
        "title": course_info["title"],
        "description": course_info["desc"],
        "category": course_info["cat"],
        "accessList": enrollees # Your API will find these emails and create Enrollments
    }
    
    try:
        res = requests.post(COURSE_URL, json=payload, headers=headers)
        
        if res.status_code == 201:
            data = res.json()
            print(f"📚 Course Created: '{data['title']}'")
            print(f"   ↳ Enrolled: {len(enrollees)} students from the list.")
            return data['id']
        else:
            print(f"❌ Error creating course: {res.text}")
            return None
    except Exception as e:
        print(f"❌ Connection Error: {e}")
        return None

def add_lessons_to_course(token, course_id):
    """Adds 3-5 video lessons to a specific course"""
    headers = {"Authorization": f"Bearer {token}"}
    num_lessons = random.randint(3, 5)
    
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
        
        requests.post(LESSON_URL, json=payload, headers=headers)

def main():
    print("==========================================")
    print("   SEEDING CONTENT & ENROLLMENTS")
    print("==========================================\n")

    # 1. Authenticate Admin (Director)
    token = get_admin_token()
    if not token:
        sys.exit(1)

    # 2. Define the existing users list
    # Change '10' to however many test users you actually created
    existing_emails = get_existing_student_emails(amount=10) 
    print("")

    # 3. Loop through data to create courses and enroll those users
    print("--- Starting Batch Generation ---")
    for info in COURSE_DATA:
        course_id = create_course_with_enrollments(token, info, existing_emails)
        
        if course_id:
            add_lessons_to_course(token, course_id)
            # Small delay to prevent database locking issues if SQLite/local
            time.sleep(0.1) 

    print("\n==========================================")
    print("✅ SUCCESS")
    print("   Courses created and 'test' users enrolled.")
    print("==========================================")

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n🛑 Script stopped")
    except requests.exceptions.ConnectionError:
        print("\n❌ ERROR: Server is not running on localhost:5000")