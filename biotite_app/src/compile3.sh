./compile.sh

export id="643322071"
export id="238348964"
export id="moosedog"
export id="47805880523"

rsync -rvz --exclude="*.blend*" --exclude="old" ../build/* durrantj@durrantlab.pitt.edu:/var/www/html/biotite/public/${id}/
rsync -rvz ../build/js durrantj@durrantlab.pitt.edu:/var/www/html/biotite/public/${id}/

say -v Samantha "boop"
