# set your wifi in monitor mode
sudo airmon-ng start wlan0 
 
# listen
sudo airodump-ng --output-format csv --berlin 300 --write /home/pi/6sense/data/report --write-interval 300 wlan0mon
