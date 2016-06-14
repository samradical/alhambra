for i in *.aif ; do 
    ffmpeg -i "$i" -q:a 9 -acodec libmp3lame -y  $(basename "${i/.aif}_92").mp3 
    ffmpeg -i "$i" -q:a 9 -y $(basename "${i/.aif}_92").ogg 
done