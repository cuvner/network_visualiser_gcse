from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path


HOST = "127.0.0.1"
START_PORT = 8000
WEB_DIR = Path(__file__).parent / "web"


class AppHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(WEB_DIR), **kwargs)


def main() -> None:
    if not WEB_DIR.exists():
        raise FileNotFoundError(f"Web directory not found: {WEB_DIR}")

    port = START_PORT
    while True:
        try:
            server = ThreadingHTTPServer((HOST, port), AppHandler)
            break
        except OSError:
            port += 1
            if port >= START_PORT + 20:
                raise

    url = f"http://{HOST}:{port}"
    print("Local GCSE networks web app")
    print(f"Open this in your browser: {url}")
    print("Press Ctrl+C to stop the server.")

    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nServer stopped.")
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
