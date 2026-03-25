import sys
import time
import signal
from rpi_rf import RFDevice

try:
    RECEIVE_PIN = int(sys.argv[1])
    print(f"Starting RF receiver on GPIO {RECEIVE_PIN}", flush=True)

    rfdevice = RFDevice(RECEIVE_PIN)
    rfdevice.enable_rx()
    timestamp = None

    def cleanup(*_):
        rfdevice.cleanup()
        sys.exit(0)

    signal.signal(signal.SIGTERM, cleanup)
    signal.signal(signal.SIGINT, cleanup)

    while True:
        if rfdevice.rx_code_timestamp != timestamp:
            timestamp = rfdevice.rx_code_timestamp
            print(f"{rfdevice.rx_code},{rfdevice.rx_proto},{rfdevice.rx_pulselength}", flush=True)
        time.sleep(0.01)

except Exception as e:
    print(f"Error: {e}", flush=True)
