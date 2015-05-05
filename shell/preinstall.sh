sudo apt-get -y install libssl-dev libnl-genl-3-dev libnl-3-dev iw ethtool

# install aircrack
wget http://download.aircrack-ng.org/aircrack-ng-1.2-rc2.tar.gz
tar -zxvf aircrack-ng-1.2-rc2.tar.gz
make -C aircrack-ng-1.2-rc2
sudo make install -C aircrack-ng-1.2-rc2
rm aircrack-ng-1.2-rc2.tar.gz
rm -rf aircrack-ng-1.2-rc2

sudo airodump-ng-oui-update

mkdir data
