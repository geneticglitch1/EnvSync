GOOS=darwin  GOARCH=amd64 go build -o envsync-mac .
GOOS=windows GOARCH=amd64 go build -o envsync.exe .
GOOS=linux   GOARCH=amd64 go build -o envsync-linux .