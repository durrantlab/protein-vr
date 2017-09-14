# Pull base image.
FROM ubuntu:16.04

MAINTAINER Jacob Durrant <durrantj@pitt.edu>

# Install dependencies
RUN apt-get -yqq update
RUN apt-get -fyqq install
RUN apt-get -yqq install wget
RUN apt-get -yqq install bzip2
RUN apt-get -yqq install make
RUN apt-get -yqq install libfreetype6
RUN apt-get -yqq install libglu1-mesa
RUN apt-get -yqq install libxi6
RUN apt-get -yqq install libxrender1

#RUN apt-get -yqq install libgl1-mesa-glx
# libfontconfig1 libxrender1 libXext6 libXdamage1 libXfixes-dev libXcomposite-dev libasound-dev libdbus-glib-1-dev libgtk2.0-0 libxt6 python-pip

# Make the directories. blender and vmd in image_bins, external mountaed
# directory at /mounted/, internal scratch directory at /image_tmp/
RUN mkdir /image_bins/ && \
    mkdir /mounted/ && \
    mkdir /image_tmp/

# Download blender
RUN cd /image_bins/ && \
    wget http://mirror.cs.umn.edu/blender.org/release/Blender2.78/blender-2.78c-linux-glibc219-x86_64.tar.bz2

# Install blender
RUN cd /image_bins/ && \
    tar -xjf blender-2.78c-linux-glibc219-x86_64.tar.bz2 && \
    rm blender-2.78c-linux-glibc219-x86_64.tar.bz2

# Add and install VMD
ADD vmd-1.9.3.bin.LINUXAMD64.text.tar.gz /image_bins/
# The above uncompresses the tar.gz file too, FYI

# Configure and install VMD.
RUN cd /image_bins/vmd-1.9.3/ && \
    ./configure LINUXAMD64 TCL PTHREADS && \
    cd src && \
    make install

# Copy over script for making OBJ files
ADD save_pdb_objs.tcl /image_tmp/
ADD save_objs.py /image_tmp/
ADD save_vmd_objs.tcl /image_tmp/
ADD common.tcl /image_tmp/

# Copy over MSMS
ADD msms_i86_64Linux2_2.6.1.tar.gz /image_bins/
RUN cd /image_bins/ && \
    ln -s msms.x86_64Linux2.2.6.1 msms
ENV MSMSSERVER /image_bins/msms

# Add the bash file to run things
ADD workflow.bash /image_tmp/
RUN chmod +x /image_tmp/workflow.bash

# # Install dependencies
# RUN dpkg --add-architecture i386 && \
#     apt-get -yqq update && \
#     apt-get -yqq install wine:i386 zip

# # Install electron
# RUN npm install electron --save-dev

# # install
# RUN apt-get -yqq install icnsutils
# RUN apt-get -yqq install imagemagick
# RUN apt-get -yqq install icoutils

# # Global install electron-packager and npm-cache
# RUN npm set progress=false && \
#     npm install --global --progress=false electron-packager npm-cache

# # Binary may be called nodejs instead of node
# RUN ln -s /usr/bin/nodejs /usr/bin/node

# # Cleanup image
# RUN apt-get -yqq autoremove && \
# 		apt-get -yqq clean && \
# 		rm -rf /var/lib/apt/lists/* /var/cache/* /tmp/* /var/tmp/*

# # Add some files
# RUN mkdir /delme/
# ADD electron.js /delme/
# ADD package.json /delme/

# # Compile a small app on all OSs so you won't need to download things in the
# # future.
# RUN electron-packager /delme/ delme --asar --overwrite --platform=darwin,linux,win32 --arch=all --out=/delme/tmp/
# RUN rm -rf /delme/

# Run it
# CMD export MSMSSERVER=/obj_maker/msms && \
#     vmd

ENTRYPOINT ["/bin/bash", "-c", "/image_tmp/workflow.bash ${*}", "--"]

# Define working directory.
WORKDIR /image_tmp/ 
