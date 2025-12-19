import requests
import sys

BASE_URL = "http://localhost:8000"

def log(msg):
    print(f"[TEST] {msg}")

def run_verification():
    # 1. Signup/Login
    email = "test_sprint4@example.com"
    password = "password123"
    name = "Test Sprint4"
    
    log(f"Registering user {email}...")
    try:
        resp = requests.post(f"{BASE_URL}/auth/signup", json={
            "email": email,
            "password": password,
            "name": name
        })
        if resp.status_code == 201:
            log("User created.")
        elif resp.status_code == 400 and "Email already registered" in resp.text:
            log("User already exists, logging in...")
        else:
            log(f"Signup failed: {resp.status_code} {resp.text}")
            sys.exit(1)
    except Exception as e:
        log(f"Failed to connect: {e}")
        sys.exit(1)

    log("Logging in...")
    session = requests.Session()
    resp = session.post(f"{BASE_URL}/auth/login", json={
        "email": email,
        "password": password
    })
    if resp.status_code != 200:
        log(f"Login failed: {resp.status_code} {resp.text}")
        sys.exit(1)
    
    # Store cookie in session
    # requests.Session automatically handles cookies, but let's be sure
    # The API sets an HttpOnly cookie 'access_token'
    
    log("Logged in successfully.")

    # 2. Archive & Restore
    log("Creating note to test restore...")
    resp = session.post(f"{BASE_URL}/notes/", json={
        "title": "Restore Me",
        "content": "This note will be archived and restored."
    })
    if resp.status_code != 201:
        log(f"Failed to create note: {resp.status_code} {resp.text}")
        sys.exit(1)
    note_id = resp.json()["_id"]

    log(f"Archiving note {note_id}...")
    resp = session.delete(f"{BASE_URL}/notes/{note_id}") # Soft delete = archive
    if resp.status_code != 204:
        log(f"Failed to archive: {resp.status_code} {resp.text}")
        sys.exit(1)
    
    log("Restoring note...")
    resp = session.post(f"{BASE_URL}/notes/{note_id}/restore")
    if resp.status_code != 200:
        log(f"Failed to restore: {resp.status_code} {resp.text}")
        sys.exit(1)
    
    restored_note = resp.json()
    if restored_note["is_archived"] is not False:
        log("Error: Note is_archived is not False after restore.")
        sys.exit(1)
    log("Note restored successfully.")

    # 3. Permanent Delete
    log("Creating note to test permanent delete...")
    resp = session.post(f"{BASE_URL}/notes/", json={
        "title": "Delete Me",
        "content": "This note will be permanently deleted."
    })
    delete_id = resp.json()["_id"]

    log(f"Archiving note {delete_id}...")
    session.delete(f"{BASE_URL}/notes/{delete_id}")

    log("Permanently deleting note...")
    resp = session.delete(f"{BASE_URL}/notes/{delete_id}/permanent")
    if resp.status_code != 204:
        log(f"Failed to permanent delete: {resp.status_code} {resp.text}")
        sys.exit(1)
    
    log("Verifying note is gone...")
    resp = session.get(f"{BASE_URL}/notes/{delete_id}")
    if resp.status_code == 404:
        log("Note successfully deleted (404 received).")
    else:
        log(f"Error: Note still exists or other error: {resp.status_code}")
        sys.exit(1)

    # 4. Clear Archive
    log("Creating multiple notes to archive...")
    for i in range(3):
        resp = session.post(f"{BASE_URL}/notes/", json={
            "title": f"Archive Batch {i}",
            "content": "To be cleared."
        })
        n_id = resp.json()["_id"]
        session.delete(f"{BASE_URL}/notes/{n_id}") # Archive it
    
    log("Clearing archive...")
    resp = session.delete(f"{BASE_URL}/notes/archive/clear")
    if resp.status_code != 200:
        log(f"Failed to clear archive: {resp.status_code} {resp.text}")
        sys.exit(1)
    
    result = resp.json()
    log(f"Clear result: {result}")
    
    # Verify archive is empty
    resp = session.get(f"{BASE_URL}/notes/", params={"archived": True})
    archived_notes = resp.json()
    if len(archived_notes) == 0:
        log("Archive is empty. Success.")
    else:
        log(f"Error: Archive not empty. Count: {len(archived_notes)}")
        sys.exit(1)

    # 5. User Profile Update
    new_name = "Updated Sprint4 Name"
    log(f"Updating profile name to '{new_name}'...")
    resp = session.put(f"{BASE_URL}/users/profile", json={"name": new_name})
    if resp.status_code != 200:
        log(f"Failed to update profile: {resp.status_code} {resp.text}")
        sys.exit(1)
    
    updated_user = resp.json()
    if updated_user["name"] == new_name:
        log("Profile updated successfully in response.")
    else:
        log(f"Error: Name not updated in response. Got {updated_user['name']}")
        sys.exit(1)
        
    log("Verifying with /auth/me...")
    resp = session.get(f"{BASE_URL}/auth/me")
    me = resp.json()
    if me["name"] == new_name:
        log("/auth/me confirms name update.")
    else:
        log(f"Error: /auth/me shows old name: {me['name']}")
        sys.exit(1)

    log("\nALL SPRINT 4 CHECKS PASSED!")

if __name__ == "__main__":
    run_verification()