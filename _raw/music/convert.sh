for i in *.aiff ; do 
    ffmpeg -i "$i" -q:a 9 -acodec libmp3lame -y  $(basename "${i/.aiff}_92").mp3 
    ffmpeg -i "$i" -q:a 9 -y $(basename "${i/.aiff}_92").ogg 
done