sudo apt-get update
sudo apt-get -y upgrade
sudo apt-get -y install unzip
sudo apt-get install -y libpango1.0-0
sudo apt-get -f install
wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
dpkg -i google-chrome*.deb
apt install -y -f
dpkg -i google-chrome*.deb
curl "http://chromedriver.storage.googleapis.com/LATEST_RELEASE"
sudo mkdir /var/chromedriver
cd /var/chromedriver
wget "http://chromedriver.storage.googleapis.com/2.38/chromedriver_linux64.zip"
unzip chromedriver_linux64.zip
chmod +x chromedriver
sudo apt-get -y install python3-pip python3-dev build-essential libssl-dev libffi-dev xvfb
pip3 install --upgrade pip
sudo pip3 install virtualenv
sudo pip3 install pyvirtualdisplay
sudo pip3 install selenium
sudo mv -f chromedriver /usr/local/share/chromedriver
sudo ln -s /usr/local/share/chromedriver /usr/local/bin/chromedriver
sudo ln -s /usr/local/share/chromedriver /usr/bin/chromedriver
