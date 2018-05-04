import subprocess

def send(msg, duration=5000):
    subprocess.check_output(["notify-send", "-t", str(duration), msg])
