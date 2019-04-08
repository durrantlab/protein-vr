crc-squeue.py | grep "multi-bake" | awk '{print $4}' | sort | uniq -c | awk '{print $1 " " $2}'
