#!/bin/bash

# Here, put the script needed to power the bluetooth dongle on.
# The script by default is made for archlinux.

echo -e 'power off\npower on\nexit' | bluetoothctl
