FROM heroiclabs/nakama:latest

COPY ./build /nakama/data/modules

CMD ["nakama", "--database.address=${database.address}"]