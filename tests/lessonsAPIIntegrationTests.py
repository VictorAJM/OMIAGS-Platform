import unittest
from utils.lessonsAPI import create_lesson, get_lessons, delete_lesson

class TestLessonAPI(unittest.TestCase):

    COURSE_ID = "68d5b2d5ef25679dfa6dbdc9"

    def test_lesson_API(self):
        # Create
        lesson = create_lesson(self.COURSE_ID, "Unit Test Lesson", "Testing", {"pdf": "url"})
        self.assertIsNotNone(lesson)
        lesson_id = lesson["_id"]

        # Get
        lessons = get_lessons(self.COURSE_ID)
        self.assertTrue(any(l["_id"] == lesson_id for l in lessons))
        
    def test_delete_lesson_API(self):
        # Create
        lesson = create_lesson(self.COURSE_ID, "Unit Test Lesson", "Testing", {"pdf": "url"})
        self.assertIsNotNone(lesson)
        lesson_id = lesson["_id"]
        
        # Delete
        delete_response = delete_lesson(lesson_id)
        self.assertEqual(delete_response["message"], "Lesson deleted")
    

if __name__ == "__main__":
    unittest.main()
