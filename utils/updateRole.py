import requests

API_URL = "http://localhost:5000/api/user"

def update_user_role(user_id, new_role):
    """
    Update a specific user's role to either 'student' or 'admin'
    
    Args:
        user_id (str): The ID of the user to update
        new_role (str): The new role - must be 'student' or 'admin'
    """
    
    # Validate role
    if new_role not in ['student', 'admin']:
        print("❌ Error: Role must be either 'student' or 'admin'")
        return False
    
    payload = {
        "role": new_role
    }
    
    print(f"🔄 Updating user {user_id} to role: {new_role}")
    
    try:
        response = requests.put(f"{API_URL}/{user_id}/role", json=payload)
        response.raise_for_status()
        
        result = response.json()
        print("✅ User role updated successfully!")
        print(f"📊 User: {result['user']['name']} ({result['user']['email']})")
        print(f"🎯 New Role: {result['user']['role']}")
        return True
        
    except requests.exceptions.HTTPError as e:
        if response.status_code == 404:
            print("❌ Error: User not found")
        elif response.status_code == 400:
            error_msg = response.json().get('message', 'Bad request')
            print(f"❌ Error: {error_msg}")
        elif response.status_code == 403:
            print("❌ Error: Access denied. Admin privileges required.")
        else:
            print(f"❌ HTTP Error: {e}")
    except requests.exceptions.ConnectionError:
        print("❌ Error: Cannot connect to server. Make sure the server is running on http://localhost:5000")
    except requests.exceptions.RequestException as e:
        print(f"❌ Request Error: {e}")
    
    return False

def get_user_details(user_id):
    """
    Get specific user details before and after update
    """
    try:
        response = requests.get(f"{API_URL}/{user_id}")
        response.raise_for_status()
        
        user = response.json()
        print(f"👤 Current User Details:")
        print(f"  Name: {user['name']}")
        print(f"  Email: {user['email']}")
        print(f"  Role: {user['role']}")
        return user
        
    except requests.exceptions.HTTPError as e:
        if response.status_code == 404:
            print("❌ Error: User not found")
        else:
            print(f"❌ HTTP Error while fetching user: {e}")
    except requests.exceptions.RequestException as e:
        print(f"❌ Request Error while fetching user: {e}")
    
    return None

if __name__ == "__main__":
    # SPECIFIC USER ID - Replace with the actual user ID you want to update
    TARGET_USER_ID = "691a7fb4cf1b0ee3f7731207"  # ⚠️ Change this to your specific user ID
    
    # SPECIFIC ROLE - Change this to either 'student' or 'admin'
    NEW_ROLE = "admin"  # ⚠️ Change this to desired role
    
    print("=== User Role Update Script ===")
    print(f"Target User ID: {TARGET_USER_ID}")
    print(f"Desired Role: {NEW_ROLE}")
    print("=" * 40)
    
    # Show current user details
    print("\n📋 Checking current user details...")
    current_user = get_user_details(TARGET_USER_ID)
    
    if current_user:
        print(f"\n🔄 Updating {current_user['name']} from '{current_user['role']}' to '{NEW_ROLE}'...")
        
        # Update the user role
        success = update_user_role(TARGET_USER_ID, NEW_ROLE)
        
        if success:
            # Verify the update
            print("\n✅ Verification - Checking updated user details...")
            get_user_details(TARGET_USER_ID)
        else:
            print("\n❌ Failed to update user role")
    else:
        print(f"\n❌ Cannot proceed. User with ID {TARGET_USER_ID} not found or inaccessible.")