FROM heroiclabs/nakama:latest

COPY ./build /nakama/data/modules

CMD ["sh", "-ecx", "\
nakama migrate up --database.address $NAKAMA_DATABASE_ADDRESS && \
exec nakama \
--name nakama1 \
--database.address $NAKAMA_DATABASE_ADDRESS \
--session.token_expiry_sec 7200 \
--runtime.path /nakama/data/modules"]