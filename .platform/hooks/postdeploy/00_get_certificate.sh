#!/usr/bin/env bash
# Place in .platform/hooks/postdeploy directory
sudo certbot -n -d thisistheapp-env.eba-e4mhqj2t.us-east-1.elasticbeanstalk.com --nginx --agree-tos --email bcolton9@byu.edu
    