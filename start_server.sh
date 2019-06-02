#!/bin/bash
# You need the key from me, Ben, to connect
ssh -i "~/.ssh/kickflip.pem" ubuntu@ec2-13-59-33-94.us-east-2.compute.amazonaws.com << 'ENDSTART'
sudo iptables -t nat -A PREROUTING -p tcp --dport 80 -j REDIRECT --to-ports 3000
cd kickflip/
git pull
npm install
forever stopall
forever start main.js
ENDSTART
