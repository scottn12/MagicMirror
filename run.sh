#!/bin/bash

cp -fR ./ /var/www/html
chromium-browser --kiosk --disable-infobars http://localhost/
