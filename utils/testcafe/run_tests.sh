# export URL="http://localhost:8082/"
# export URL="http://0.0.0.0:8000/"
export URL="https://durrantlab.pitt.edu/apps/protein-vr/beta/"

cat main.template.ts | sed "s|URLURL|${URL}|g"> tmp.ts

ls tests/ | grep "\.ts" | grep -v "\.old" | awk '{print "cat ./tests/" $1 " | sed \"s/TITLETITLE/" $1 "/g\" | sed \"s|\\.ts\\\"|\\\"|g\" >> tmp.ts; echo \"\" >> tmp.ts"}' | bash

testcafe chrome tmp.ts --disable-page-caching
testcafe firefox tmp.ts --disable-page-caching

#  -c 2

rm tmp.ts

echo
echo "COULD NOT TEST:"
echo "VR"
echo "    HTC Vive, Windows, Chrome"
echo "    HTC Vive, Windows, Firefox"
echo "    Oculus, Windows, Chrome"
echo "    Oculus, Windows, Firefox"
echo "    Oculus Quest"
echo "    Android"
echo "    iPhone (and web app)"
echo "Fullscreen"
echo "PWA (add to home screen on phone)"
echo "Leader with another computer (just tested open modal)"
echo "Full navigation (limited tests)"
echo "Error when bad remote URL loaded"