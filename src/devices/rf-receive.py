import sys
import time
import RPi.GPIO as GPIO

PACKET_GAP_MS  = 15   # gap this long = end of packet
MIN_TRANSITIONS = 20  # minimum transitions after outlier removal

def decode(transitions):
    filtered = [t for t in transitions if 50 < t < 10000]
    if len(filtered) < MIN_TRANSITIONS:
        return None, None

    sorted_t = sorted(filtered)

    # Find the biggest gap — splits into "short" and "long" clusters
    split_idx = max(range(len(sorted_t) - 1), key=lambda i: sorted_t[i+1] - sorted_t[i])

    short_vals = sorted_t[:split_idx + 1]
    long_vals  = sorted_t[split_idx + 1:]

    if not short_vals or not long_vals:
        return None, filtered

    short_avg = sum(short_vals) / len(short_vals)
    long_avg  = sum(long_vals)  / len(long_vals)

    # Clusters must be clearly separated
    if long_avg / short_avg < 1.3:
        return None, filtered

    # Each cluster must be internally consistent (CV < 0.6)
    def cv(vals, avg):
        return (sum((v - avg) ** 2 for v in vals) / len(vals)) ** 0.5 / avg

    if cv(short_vals, short_avg) > 0.6 or cv(long_vals, long_avg) > 0.6:
        return None, filtered

    threshold = (short_avg + long_avg) / 2
    code = ''.join('1' if t >= threshold else '0' for t in filtered)
    return code, filtered

try:
    RECEIVE_PIN = int(sys.argv[1])
    print(f"Starting RF receiver on GPIO {RECEIVE_PIN}", flush=True)

    GPIO.setmode(GPIO.BCM)
    GPIO.setup(RECEIVE_PIN, GPIO.IN, pull_up_down=GPIO.PUD_DOWN)

    while True:
        transitions = []

        GPIO.wait_for_edge(RECEIVE_PIN, GPIO.FALLING, timeout=1000)
        if GPIO.input(RECEIVE_PIN) != 0:
            continue

        last = time.time()

        while True:
            result = GPIO.wait_for_edge(RECEIVE_PIN, GPIO.BOTH, timeout=PACKET_GAP_MS)
            now = time.time()
            duration_us = int((now - last) * 1_000_000)

            if result is None or duration_us >= PACKET_GAP_MS * 1000:
                break

            transitions.append(duration_us)
            last = now

        code, filtered = decode(transitions)
        if code:
            print(code, flush=True)
        elif filtered and len(filtered) >= MIN_TRANSITIONS:
            # Didn't decode cleanly — print raw timings for analysis
            print(f"RAW:{filtered}", flush=True)

except Exception as e:
    print(f"Error: {e}", flush=True)

finally:
    GPIO.cleanup()
