import time
import sys
import RPi.GPIO as GPIO

RECEIVE_PIN = int(sys.argv[1])

GPIO.setmode(GPIO.BCM)
GPIO.setup(RECEIVE_PIN, GPIO.IN)

while True:
    if GPIO.input(RECEIVE_PIN):
        print('Received signal')
    time.sleep(0.1)
