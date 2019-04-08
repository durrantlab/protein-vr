#!/bin/bash
#SBATCH --job-name=multi-bake-blender
#SBATCH --output=multi-bake-blender.out
#SBATCH --nodes=1
#SBATCH --ntasks-per-node=12
#SBATCH --time=08:00:00
#SBATCH --cluster=smp
#SBATCH --partition=high-mem

bash ./bakeit.sh
