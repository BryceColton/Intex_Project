#!/bin/bash

# Adjust Nginx settings
NGINX_CONF="/etc/nginx/nginx.conf"

# Add custom settings if not already present
if ! grep -q "types_hash_max_size" $NGINX_CONF; then
    echo "Adding types_hash_max_size to Nginx config..."
    sed -i '/http {/a \    types_hash_max_size 2048;' $NGINX_CONF
fi

if ! grep -q "types_hash_bucket_size" $NGINX_CONF; then
    echo "Adding types_hash_bucket_size to Nginx config..."
    sed -i '/http {/a \    types_hash_bucket_size 128;' $NGINX_CONF
fi

if ! grep -q "server_names_hash_bucket_size" $NGINX_CONF; then
    echo "Adding server_names_hash_bucket_size to Nginx config..."
    sed -i '/http {/a \    server_names_hash_bucket_size 128;' $NGINX_CONF
fi

# Restart Nginx
nginx -t && service nginx restart

# Install certificate for Elastic Beanstalk
certbot install --cert-name thisistheapp-env.eba-e4mhqj2t.us-east-1.elasticbeanstalk.com

# Install certificate for custom domain
if certbot --nginx -d group47intex.is404.net --non-interactive --agree-tos --email bcolton9@byu.edu; then
    echo "Certificate installed successfully for group47intex.is404.net"
else
    echo "Failed to install certificate for group47intex.is404.net. Check logs."
    exit 1
fi

# Reload Nginx to apply changes
nginx -t && service nginx reload