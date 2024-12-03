#!/usr/bin/env bash
# Place in .platform/hooks/postdeploy directory
sudo certbot -n -d ThisApplicationWillWork-env.eba-ktfhgqsd.us-east-1.elasticbeanstalk.com --nginx --agree-tos --email cooperbt@byu.edu
