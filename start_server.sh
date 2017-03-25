#!/bin/bash
# You need the key from me, Sieu, to connect
ssh -i "kickflip.pem" ubuntu@ec2-52-14-104-27.us-east-2.compute.amazonaws.com << 'ENDSTART'
cd kickflip/
git pull
node main.js
ENDSTART