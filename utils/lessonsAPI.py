import requests

API_URL = "http://localhost:5000/api/lessons"

def create_lesson(course_id, title, description="", content=None):
    if content is None:
        content = {}

    payload = {
        "courseId": course_id,
        "title": title,
        "description": description,
        "content": content
    }

    try:
        res = requests.post(API_URL, json=payload)
        res.raise_for_status()
        print("✅ Lesson created:", res.json())
        return res.json()
    except requests.exceptions.RequestException as e:
        print("❌ Error creating lesson:", e)
        
def get_lessons(course_id):
    try:
        res = requests.get(f"{API_URL}/{course_id}")
        res.raise_for_status()
        print("✅ Lessons fetched:", res.json())
        return res.json()
    except requests.exceptions.RequestException as e:
        print("❌ Error fetching lessons:", e)
        
def delete_lesson(lesson_id):
    try:
        res = requests.delete(f"{API_URL}/{lesson_id}")
        res.raise_for_status()
        print("✅ Lesson deleted:", res.json())
        return res.json()
    except requests.exceptions.RequestException as e:
        print("❌ Error deleting lesson:", e)

def update_lesson(lesson_id, title=None, description=None, content=None):
    payload = {}
    print(lesson_id)
    if title: payload["title"] = title
    if description: payload["description"] = description
    if content: payload["content"] = content

    try:
        res = requests.put(f"{API_URL}/{lesson_id}", json=payload)
        res.raise_for_status()
        print("✅ Lesson updated:", res.json())
        return res.json()
    except requests.exceptions.RequestException as e:
        print("❌ Error updating lesson:", e)
        
        
if __name__ == "__main__":

    course_id = "68d5b2d5ef25679dfa6dbdc9"

    lesson = create_lesson(course_id, "Intro to AI 2", "Basics of AI", {"video": "url"})
    if lesson:
        update_lesson(lesson["_id"], title="Intro to Artificial Intelligence 3")