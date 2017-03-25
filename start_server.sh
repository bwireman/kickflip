#!/bin/bash
# You need the key from me, Sieu, to connect
ssh -i "kickflip.pem" ubuntu@ec2-52-14-104-27.us-east-2.compute.amazonaws.com << 'ENDSTART'
sudo iptables -t nat -A PREROUTING -p tcp --dport 80 -j REDIRECT --to-ports 3000
cd kickflip/
git pull
node main.js
ENDSTART