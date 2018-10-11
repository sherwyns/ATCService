echo 'Deploying files to ATC repository'
rsync -avz -e "ssh -i /home/ravi/jenkins/ATC-Dev.pem"  /var/www/html/ATCService/ ubuntu@34.209.125.112:/var/www/html/atcbuild

