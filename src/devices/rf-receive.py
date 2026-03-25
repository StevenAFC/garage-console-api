import sys
import RPi.GPIO as GPIO
from datetime import datetime

try:
    RECEIVE_PIN = int(sys.argv[1])
    print(f"Starting RF receiver on GPIO {RECEIVE_PIN}", flush=True)

    GPIO.setmode(GPIO.BCM)
    GPIO.setup(RECEIVE_PIN, GPIO.IN)

    while True:
        channel = GPIO.wait_for_edge(RECEIVE_PIN, GPIO.RISING, timeout=500)
        if channel is not None:
            print(f"[{datetime.now()}] Received signal on GPIO {RECEIVE_PIN}", flush=True)

except Exception as e:
    print(e, flush=True)

finally:
    GPIO.cleanup()

