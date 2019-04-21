echo "Git pull to make sure you have the latest code..."
git pull

echo "Copy the latest code to the web directory..."
cp ../biotite_app/build/* ./web/

echo "Change into the web directory..."
cd web

echo "Start a python server..."
python ../server.py
