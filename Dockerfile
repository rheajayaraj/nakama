FROM heroiclabs/nakama:latest

COPY ./build /nakama/data/modules

CMD ["nakama", \
"--name", "nakama1", \
"--database.address", "postgres:5432", \
"--database.user", "postgres", \
"--database.password", "localdb", \
"--session.token_expiry_sec", "7200", \
"--runtime.path", "/nakama/data/modules"]