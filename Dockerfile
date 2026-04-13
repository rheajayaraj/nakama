FROM heroiclabs/nakama:latest

COPY ./build /nakama/data/modules

CMD ["sh", "-c", "nakama --database.address \"$DATABASE_ADDRESS\""]