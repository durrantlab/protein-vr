# Closure compiles a js file in place.

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

#export formatting="--formatting=PRETTY_PRINT"
export formatting=""

# --externs='utilities/jquery-1.9.js' --externs='utilities/twitter-bootstrap-2.1.1-externs.js'

java -jar ${DIR}/closure-compiler-v20180506.jar --compilation_level=ADVANCED_OPTIMIZATIONS \
    --externs=${DIR}/custom_extern.js --js_output_file=${1}.tmp ${1} \
    ${formatting} 2> ${1}.closure.out

mv ${1}.tmp ${1}
