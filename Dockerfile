FROM heroiclabs/nakama:latest

COPY ./build /nakama/data/modules

CMD ["nakama", "--database.address", "postgresql://nakama_db_qg3w_user:oDsS6dHxCQMwh1MMQmlx9nolYQQaoZHi@dpg-d7e91pjeo5us73843g8g-a/nakama_db_qg3w?sslmode=require"]