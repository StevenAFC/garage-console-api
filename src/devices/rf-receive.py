import sys
import time
import RPi.GPIO as GPIO

# Collect timing of all transitions, starting on a falling edge.
# Outputs raw microsecond durations so the protocol can be identified.
PACKET_GAP_US = 10000  # 10ms silence = end of packet
MIN_TRANSITIONS = 20   # ignore tiny noise bursts

try:
    RECEIVE_PIN = int(sys.argv[1])
    print(f"Starting RF receiver on GPIO {RECEIVE_PIN}", flush=True)

    GPIO.setmode(GPIO.BCM)
    GPIO.setup(RECEIVE_PIN, GPIO.IN, pull_up_down=GPIO.PUD_DOWN)

    while True:
        # Wait for pin to go LOW (falling edge = start of a real signal)
        GPIO.wait_for_edge(RECEIVE_PIN, GPIO.FALLING, timeout=1000)
        if GPIO.input(RECEIVE_PIN) != 0:
            continue

        transitions = []
        last = time.time()

        while True:
            result = GPIO.wait_for_edge(RECEIVE_PIN, GPIO.BOTH, timeout=15)
            now = time.time()
            duration_us = int((now - last) * 1_000_000)

            if result is None or duration_us >= PACKET_GAP_US:
                break

            transitions.append(duration_us)
            last = now

        if len(transitions) >= MIN_TRANSITIONS:
            print(f"Timings: {transitions}", flush=True)

except Exception as e:
    print(f"Error: {e}", flush=True)

finally:
    GPIO.cleanup()
