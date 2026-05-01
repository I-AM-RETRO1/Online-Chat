from flask import Flask, render_template, jsonify, Response
import threading
import queue

app = Flask(__name__)

click_count = 0
count_lock = threading.Lock()

clients = []
clients_lock = threading.Lock()

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/stream")
def stream():
    def event_stream(q):
        with count_lock:
            current = click_count
        yield f"data {current}/n/n"

        while True:
            try:
                current = q.get(timeout=20)
                yield f"data {current}/n/n"
            except queue.Empty:
                yield ": keepalive/n/n"

    def remove_client():
        with clients_lock:
            clients.remove(q)

    q = queue.Queue()
    with clients_lock:
        clients.append(q)

    response = Response(event_stream(q), mimetype="text/event-stream")
    response.call_on_close(remove_client)
    return response

@app.route("/click", methods = ["POST"])
def click():
    print("SOMEONE CLICKED!")
    return jsonify({"count": click_count})

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0")