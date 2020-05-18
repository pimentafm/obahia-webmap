#!/bin/bash

# The purpose of this script is to make changes into files generated by
# 'yarn create react-app' after 'build' is run.

helpFunction()
{
   echo ""
   echo "Usage: $0 -f folder_name"
   echo -e "\t-f Folder name"
   exit 1 # Exit script after printing help
}

while getopts "f:s:t:" opt
do
   case "$opt" in
      f ) folder_name="$OPTARG" ;;
      ? ) helpFunction ;; # Print help function in case parameter is non-existent
   esac
done

if [ -z "$folder_name" ]
then
   echo "Some or all of the parameters are empty";
   helpFunction
fi

echo "Create application folder: $folder_name"
mkdir -p $folder_name
cp -rf build/* $folder_name

#Change favicon url
find $folder_name"/index.html" -type f | xargs sed -i 's/\/favicon.ico/{{ STATIC_URL }}temporal\/favicon.ico/g'
find $folder_name"/index.html" -type f | xargs sed -i 's/\/static\/js/{{ STATIC_URL }}temporal\/static\/js/g'
find $folder_name"/index.html" -type f | xargs sed -i 's/\/static\/css/{{ STATIC_URL }}temporal\/static\/css/g'

find temporal/static/js/ -type f | xargs sed -i 's/static\/media/static\/temporal\/static\/media/g'
find temporal/static/css/ -type f | xargs sed -i 's/static\/media/static\/temporal\/static\/media/g'

find temporal/static/js/ -type f | xargs sed -i 's/logo.753248ba.png/logo.png/g'

cp src/assets/images/*.png temporal/static/media/