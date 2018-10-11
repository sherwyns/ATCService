echo 'Deploying files to ATC repository'
rsync -avz -e "ssh -i /home/ravi/jenkins/ATC-Dev.pem"  /var/lib/jenkins/workspace/testatc/  ubuntu@34.209.125.112:/var/www/html/atcbuild

