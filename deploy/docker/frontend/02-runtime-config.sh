#!/bin/bash

set -e

# Set default timeout if not provided
if [ -z "$LOWCODER_DEFAULT_QUERY_TIMEOUT" ]; then
   export LOWCODER_DEFAULT_QUERY_TIMEOUT=10
fi

# Check if runtime-config.js exists, if not, fail gracefully
if [ -f "/lowcoder/client/runtime-config.js" ]; then
   sed -i "s|__LOWCODER_DEFAULT_QUERY_TIMEOUT__|${LOWCODER_DEFAULT_QUERY_TIMEOUT}|g" /lowcoder/client/runtime-config.js
else
    echo "Error: /lowcoder/client/runtime-config.js not found. Exiting."
    exit 1
fi