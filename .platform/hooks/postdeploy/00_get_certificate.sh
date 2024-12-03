#!/usr/bin/env bash
# Place in .platform/hooks/postdeploy directory
#!/usr/bin/env bash
# Place in .platform/hooks/postdeploy directory

# Ensure Nginx is running before getting the certificate

# Certbot command to obtain and install the SSL certificate
sudo certbot -n -d http://thisistheapp-env.eba-e4mhqj2t.us-east-1.elasticbeanstalk.com/ --nginx --agree-tos --email bcolton9@byu.edu



