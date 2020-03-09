# Remove pevious version of the git repo.
rm -rf webxr-input-profiles
rm -rf profiles

# A pretty large git repo. May take a bit.
git clone https://github.com/immersive-web/webxr-input-profiles.git

# Change to the appropriate directory.
cd webxr-input-profiles/packages/assets/

# The models and specificiations are in ./profiles/, but the profilesList.json
# file is missing (presumably created on build). I struggled to build this
# part of the repo, but you can just downloaded the profilesList.json file
# directly from their online app to get around it.
curl https://immersive-web.github.io/webxr-input-profiles/packages/viewer/dist/profiles/profilesList.json > profiles/profilesList.json

# The profile.json files are also incomplete. Get each of those from the
# remote server as well.
find profiles -name "profile.json" | awk '{print "curl https://immersive-web.github.io/webxr-input-profiles/packages/viewer/dist/" $1 " > " $1}' | bash

# Move your profiles directory elsewhere.
mv profiles ../../../

# Clean up
cd ../../../
rm -rf webxr-input-profiles
