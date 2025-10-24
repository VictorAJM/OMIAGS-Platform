import requests

API_URL = "http://localhost:5000/api/user"

def get_all_users():
    """
    Get all users from the system
    Returns list of users or None if error
    """
    print("🔄 Fetching all users...")
    
    try:
        response = requests.get(API_URL)
        response.raise_for_status()
        
        users = response.json()
        return users
        
    except requests.exceptions.HTTPError as e:
        if response.status_code == 403:
            print("❌ Error: Access denied. Admin privileges required.")
        elif response.status_code == 404:
            print("❌ Error: API endpoint not found.")
        else:
            print(f"❌ HTTP Error: {e}")
    except requests.exceptions.ConnectionError:
        print("❌ Error: Cannot connect to server. Make sure the server is running on http://localhost:5000")
    except requests.exceptions.RequestException as e:
        print(f"❌ Request Error: {e}")
    except Exception as e:
        print(f"❌ Unexpected Error: {e}")
    
    return None

def display_users(users):
    """
    Display users in a formatted way
    """
    if not users:
        print("📭 No users found")
        return
    
    print(f"\n📊 Found {len(users)} user(s):")
    print("=" * 80)
    
    for i, user in enumerate(users, 1):
        print(f"{i:2d}. 👤 {user.get('name', 'N/A')}")
        print(f"    📧 Email: {user.get('email', 'N/A')}")
        print(f"    🎯 Role: {user.get('role', 'N/A')}")
        print(f"    🆔 ID: {user.get('_id', 'N/A')}")
        
        # Show creation date if available
        if 'createdAt' in user:
            from datetime import datetime
            created_at = datetime.fromisoformat(user['createdAt'].replace('Z', '+00:00'))
            print(f"    📅 Created: {created_at.strftime('%Y-%m-%d %H:%M:%S')}")
        
        print()

def display_users_table(users):
    """
    Display users in a compact table format
    """
    if not users:
        print("📭 No users found")
        return
    
    print(f"\n📊 Users Table ({len(users)} users):")
    print("=" * 90)
    print(f"{'No.':<4} {'Name':<20} {'Email':<25} {'Role':<10} {'User ID':<20}")
    print("-" * 90)
    
    for i, user in enumerate(users, 1):
        name = user.get('name', 'N/A')[:18] + '..' if len(user.get('name', '')) > 18 else user.get('name', 'N/A')
        email = user.get('email', 'N/A')[:23] + '..' if len(user.get('email', '')) > 23 else user.get('email', 'N/A')
        role = user.get('role', 'N/A')
        user_id = user.get('_id', 'N/A')
        
        print(f"{i:<4} {name:<20} {email:<25} {role:<10} {user_id:<20}")

def count_users_by_role(users):
    """
    Count and display statistics by role
    """
    if not users:
        return
    
    role_count = {}
    for user in users:
        role = user.get('role', 'unknown')
        role_count[role] = role_count.get(role, 0) + 1
    
    print(f"\n📈 User Statistics:")
    for role, count in role_count.items():
        print(f"   {role.capitalize()}: {count} user(s)")

def save_users_to_file(users, filename="users_export.txt"):
    """
    Save users list to a text file
    """
    try:
        with open(filename, 'w', encoding='utf-8') as f:
            f.write(f"Users Export - {len(users)} users\n")
            f.write("=" * 50 + "\n\n")
            
            for user in users:
                f.write(f"Name: {user.get('name', 'N/A')}\n")
                f.write(f"Email: {user.get('email', 'N/A')}\n")
                f.write(f"Role: {user.get('role', 'N/A')}\n")
                f.write(f"ID: {user.get('_id', 'N/A')}\n")
                if 'createdAt' in user:
                    f.write(f"Created: {user['createdAt']}\n")
                f.write("-" * 30 + "\n")
        
        print(f"💾 Users list saved to: {filename}")
    except Exception as e:
        print(f"❌ Error saving to file: {e}")

if __name__ == "__main__":
    print("=== User Management System ===")
    print("🔄 Connecting to server...")
    
    users = get_all_users()
    
    if users is not None:
        # Display detailed view
        display_users(users)
        
        # Display table view
        display_users_table(users)
        
        # Show statistics
        count_users_by_role(users)
        
        # Ask if user wants to save to file
        try:
            save_choice = input("\n💾 Save users list to file? (y/n): ").strip().lower()
            if save_choice in ['y', 'yes']:
                filename = input("Enter filename (default: users_export.txt): ").strip()
                if not filename:
                    filename = "users_export.txt"
                save_users_to_file(users, filename)
        except KeyboardInterrupt:
            print("\n👋 Operation cancelled by user")
        
        print(f"\n✅ Successfully retrieved {len(users)} user(s)")
    else:
        print("❌ Failed to retrieve users list")