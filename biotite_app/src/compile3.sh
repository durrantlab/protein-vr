./compile.sh

export id="643322071"
export id="238348964"
export id="moosedog"

rsync -rvz --exclude="*.blend*" --exclude="old" * durrantj@durrantlab.pitt.edu:/var/www/html/biotite/public/${id}/
