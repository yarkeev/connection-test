# connection-test
simple stress test for http services

# Install
```
npm install -g connection-test
```

# Usage
```
connection-test --url=http://example.com,http://example.com/foo,http://example.com/bar -i 100 -s 20 -w 1
```

# Options
* -i, --iteration

iteration count (default: 100)
* -u, --url

URL or list of URL for testing
* -s, --size

block size (default: 150)
* -t, --timeout

delay between batches (default: 1000ms)
* -w, --workers

workers count (default: 5)
* -c, --curl
use curl (default: false)
