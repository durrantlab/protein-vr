echo "Running before.sh"

# Should be run from main directory.
rm -rf dist/*

# Generate template.htm.ts files.
python utils/build/make_template_html_files.py

echo "Done before.sh"
