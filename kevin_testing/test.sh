echo "Git pull to make sure you have the latest code..."
git pull

echo "Rsync the latest code to the web directory..."
cp ../biotite_app/build/* ./web/
