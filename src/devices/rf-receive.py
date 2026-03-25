import time
import sys
import RPi.GPIO as GPIO
from datetime import datetime

try:
    RECEIVE_PIN = int(sys.argv[1])
    print(f"Starting RF receiver on GPIO {RECEIVE_PIN}")

    GPIO.setmode(GPIO.BCM)
    GPIO.setup(RECEIVE_PIN, GPIO.IN)

    while True:
        if GPIO.input(RECEIVE_PIN):
            print(f"[{datetime.now()}] Received signal: {GPIO.input(RECEIVE_PIN)}")
        time.sleep(0.1)

except Exception as e:
    print(e)

finally:
    GPIO.cleanup()
