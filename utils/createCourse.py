import requests

API_URL = "http://localhost:5000/api/courses"

def create_course(title, description, access_list=None):
    if access_list is None:
        access_list = []

    payload = {
        "title": title,
        "description": description,
        "accessList": access_list
    }

    try:
        response = requests.post(API_URL, json=payload)
        response.raise_for_status()
        print("✅ Course created:", response.json())
    except requests.exceptions.RequestException as e:
        print("❌ Error creating course:", e)

if __name__ == "__main__":
    # Example usage:
    create_course(
        title="Machine Learning 101",
        description="Introductory course on ML",
        access_list=[]
    )
