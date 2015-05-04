wget http://download.aircrack-ng.org/aircrack-ng-1.2-rc2.tar.gz
sudo apt-get -y install libssl-dev libnl-genl-3-dev libnl-3-dev iw
tar -zxvf aircrack-ng-1.2-rc2.tar.gz
make -C aircrack-ng-1.2-rc2
sudo make install -C aircrack-ng-1.2-rc2

sudo airodump-ng-oui-update
sudo apt-get install ethtool
