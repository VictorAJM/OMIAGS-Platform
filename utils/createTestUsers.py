import requests
import sys

def generate_users(amount=10):
    url = "http://localhost:5000/api/auth/register"
    headers = {
        "Content-Type": "application/json"
    }
    
    print(f"--- Iniciando creación de {amount} usuarios ---")
    print(f"Objetivo: {url}\n")

    for i in range(1, amount + 1):
        # Formato solicitado: test_numero@test.com
        email = f"test_{i}@test.com"
        password = "testtest"
        name = f"Test User {i}"

        payload = {
            "name": name,
            "email": email,
            "password": password
        }

        try:
            response = requests.post(url, json=payload, headers=headers)
            
            if response.status_code in [200, 201]:
                print(f"[OK] Usuario creado: {email}")
            else:
                print(f"[ERROR] Falló {email}. Status: {response.status_code}. Msg: {response.text}")
                
        except requests.exceptions.ConnectionError:
            print(f"[FATAL] No se pudo conectar a {url}. ¿Está corriendo el servidor?")
            break
        except Exception as e:
            print(f"[ERROR] Error inesperado: {e}")

if __name__ == "__main__":
    # Por defecto crea 5 usuarios, puedes cambiar el número aquí o pasarlo como argumento
    count = int(sys.argv[1]) if len(sys.argv) > 1 else 5
    generate_users(count)