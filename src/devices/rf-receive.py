import sys
import time
import RPi.GPIO as GPIO

# A '1' bit is a ~200us HIGH pulse
# A '0' bit is a ~0us HIGH spike then ~200us LOW
# Threshold to distinguish them
BIT_THRESHOLD = 0.00005  # 50us

try:
    RECEIVE_PIN = int(sys.argv[1])
    print(f"Starting RF receiver on GPIO {RECEIVE_PIN}", flush=True)

    GPIO.setmode(GPIO.BCM)
    GPIO.setup(RECEIVE_PIN, GPIO.IN)

    while True:
        # Wait for start of a transmission (rising edge)
        GPIO.wait_for_edge(RECEIVE_PIN, GPIO.RISING, timeout=1000)

        if not GPIO.input(RECEIVE_PIN):
            continue

        code = ''

        while True:
            rise_time = time.time()

            # Measure how long pin stays HIGH
            result = GPIO.wait_for_edge(RECEIVE_PIN, GPIO.FALLING, timeout=10)
            high_duration = time.time() - rise_time

            if result is None:
                # No falling edge within 10ms - end of signal
                break

            code += '1' if high_duration >= BIT_THRESHOLD else '0'

            # Wait for next rising edge (next bit) or gap (end of packet)
            result = GPIO.wait_for_edge(RECEIVE_PIN, GPIO.RISING, timeout=10)

            if result is None:
                # No rising edge within 10ms - end of packet
                break

        if len(code) > 10:
            print(code, flush=True)

except Exception as e:
    print(f"Error: {e}", flush=True)

finally:
    GPIO.cleanup()
