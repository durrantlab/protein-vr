# Run from within dist directory.

import re
import glob
import os

# Get the files to keep
files_to_keep = set([])
with open("service-worker.js") as f1:
    with open("index.html") as f2:
        regex = r"(app|precache-manifest|runtime|vendors)\..+?\.js"
        matches = re.finditer(regex, f1.read() + f2.read(), re.MULTILINE)
        for match in matches:
            for groupNum in range(0, len(match.groups())):
                # groupNum = groupNum + 1
                files_to_keep.add(match.group(groupNum))

# the ones to delete
all_files = set(
    glob.glob("app.*.js")
    + glob.glob("precache-manifest.*.js")
    + glob.glob("runtime.*.js")
    + glob.glob("vendors.*.js")
)

files_to_delete = all_files - files_to_keep

for fl in files_to_delete:
    os.unlink(fl)

if os.path.exists("report.html"):
    os.unlink("report.html")
