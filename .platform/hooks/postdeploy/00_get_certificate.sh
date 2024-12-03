#!/usr/bin/env bash
# Place in .platform/hooks/postdeploy directory
sudo certbot -n -d carolineandrose.us-east-1.elasticbeanstalk.com --nginx --agree-tos --email cooperbt@byu.edu
