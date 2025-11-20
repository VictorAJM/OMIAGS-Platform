import requests
import random
import sys
import time

# Configuration
BASE_URL = "http://localhost:5000/api"
AUTH_LOGIN_URL = f"{BASE_URL}/auth/login"
COURSES_URL = f"{BASE_URL}/courses" 
LESSONS_BASE_URL = f"{BASE_URL}/lessons"

def login_and_get_user(email, password):
    """Logs in and returns the User ID and Token"""
    try:
        res = requests.post(AUTH_LOGIN_URL, json={"email": email, "password": password})
        if res.status_code == 200:
            data = res.json()
            # Depending on your Auth response structure, adjust these keys
            # Usually it returns { token: "...", user: { _id: "..." } }
            return data.get("user", {}).get("id"), data.get("token")
        else:
            print(f"   ⚠️ Could not log in {email}")
            return None, None
    except Exception as e:
        print(f"   ❌ Connection error: {e}")
        return None, None

def get_enrolled_courses(token):
    """Fetches courses the student is enrolled in"""
    headers = {"Authorization": f"Bearer {token}"}
    try:
        # Assuming your /courses endpoint returns only enrolled courses for students
        res = requests.get(COURSES_URL, headers=headers)
        if res.status_code == 200:
            return res.json()
        return []
    except:
        return []

def get_lessons_for_course(course_id):
    """Fetches lessons using the route defined in your snippet"""
    # Based on your snippet: router.get("/:courseId/lessons", ...)
    # Assuming the file is mounted at /api/lessons
    url = f"{LESSONS_BASE_URL}/{course_id}/lessons"
    try:
        res = requests.get(url)
        if res.status_code == 200:
            return res.json()
        return []
    except:
        return []

def toggle_lesson_completion(lesson_id, user_id, is_completed):
    """Calls the PUT /:id/toggle-completion endpoint"""
    url = f"{LESSONS_BASE_URL}/{lesson_id}/toggle-completion"
    
    # Your API specifically requires 'userId' and 'completed' in the body
    payload = {
        "userId": user_id,
        "completed": is_completed
    }
    
    try:
        # Note: Your toggle endpoint snippet didn't show 'requireAuth', 
        # but usually headers are good practice. The body contains the auth logic here.
        res = requests.put(url, json=payload)
        return res.status_code == 200
    except:
        return False

def main():
    print("==========================================")
    print("   SIMULATING STUDENT PROGRESS")
    print("==========================================\n")

    # Iterate through your test users
    for i in range(1, 11): 
        email = f"test_{i}@test.com"
        password = "testtest"
        
        print(f"👤 Processing: {email}")
        
        # 1. Login to get ID (needed for the payload)
        user_id, token = login_and_get_user(email, password)
        
        if not user_id or not token:
            print('Fack')
            continue
        
        print('Here we are logged in')
        # 2. Get Courses this user is enrolled in
        my_courses = get_enrolled_courses(token)
        if not my_courses:
            print("   ↳ No enrollments found.")
            continue

        # 3. Update progress for each course
        for course in my_courses:
            course_id = course.get("id") or course.get("_id")
            course_title = course.get("name") or course.get("title")
            
            lessons = get_lessons_for_course(course_id)
            if not lessons:
                continue

            print(f"   📚 Course: {course_title} ({len(lessons)} lessons)")

            # 4. Randomly update lessons
            updates_count = 0
            for lesson in lessons:
                # 50% chance to mark as complete, or leave incomplete
                # OR randomly decide to 'complete' it to simulate active usage
                should_complete = random.choice([True, False, True]) # 66% chance of completion
                
                if should_complete:
                    success = toggle_lesson_completion(lesson['_id'], user_id, True)
                    if success:
                        updates_count += 1
                        sys.stdout.write(".") # Visual progress bar
                        sys.stdout.flush()
            
            print(f"\n      ↳ Marked {updates_count}/{len(lessons)} lessons as complete.")
            time.sleep(0.2) # Be nice to the server

    print("\n==========================================")
    print("✅ PROGRESS UPDATED RANDOMLY")
    print("==========================================")

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n🛑 Script stopped")
    except requests.exceptions.ConnectionError:
        print("\n❌ ERROR: Server not running at http://localhost:5000")