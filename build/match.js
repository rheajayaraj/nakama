"use strict";
var matchInit = function (ctx, logger, nk, params) {
    var state = {
        board: Array(9).fill(""),
        players: [],
        turn: 0,
        winner: null,
    };
    logger.info("Match initialized");
    return {
        state: state,
        tickRate: 1,
        label: "tic-tac-toe",
    };
};
var matchJoin = function (ctx, logger, nk, dispatcher, tick, state, presences) {
    presences.forEach(function (p) {
        if (state.players.length < 2) {
            state.players.push(p.userId);
            logger.info("Player joined: ".concat(p.userId));
        }
    });
    dispatcher.broadcastMessage(1, nk.stringToBinary(JSON.stringify(state)));
    return { state: state };
};
var matchLoop = function (ctx, logger, nk, dispatcher, tick, state, messages) {
    messages.forEach(function (msg) {
        var data = JSON.parse(nk.binaryToString(msg.data));
        var position = data.position;
        if (state.winner) {
            logger.info("Move rejected: game already finished");
            return;
        }
        if (position < 0 || position > 8) {
            logger.info("Invalid move position");
            return;
        }
        if (state.board[position] !== "") {
            logger.info("Cell already occupied");
            return;
        }
        var playerIndex = state.players.indexOf(msg.sender.userId);
        if (playerIndex !== state.turn) {
            logger.info("Not your turn");
            return;
        }
        var symbol = playerIndex === 0 ? "X" : "O";
        state.board[position] = symbol;
        state.winner = checkWinner(state.board);
        state.turn = (state.turn + 1) % 2;
        logger.info("Move applied at position ".concat(position));
        dispatcher.broadcastMessage(1, nk.stringToBinary(JSON.stringify(state)));
    });
    return { state: state };
};
var matchLeave = function (ctx, logger, nk, dispatcher, tick, state, presences) {
    presences.forEach(function (presence) {
        logger.info("Player left: ".concat(presence.userId));
        state.players = state.players.filter(function (playerId) { return playerId !== presence.userId; });
        state.turn = 0;
    });
    if (!state.winner && state.players.length < 2) {
        state.winner = "opponent_left";
    }
    return { state: state };
};
var matchTerminate = function (ctx, logger, nk, dispatcher, tick, state, graceSeconds) {
    logger.info("Match terminated");
    return { state: state };
};
function checkWinner(board) {
    var wins = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6],
    ];
    for (var i = 0; i < wins.length; i++) {
        var a = wins[i][0];
        var b = wins[i][1];
        var c = wins[i][2];
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            return board[a];
        }
    }
    if (board.every(function (cell) {
        return cell !== "";
    })) {
        return "draw";
    }
    return null;
}
var matchJoinAttempt = function (ctx, logger, nk, dispatcher, tick, state, presence, metadata) {
    logger.info("Join attempt by ".concat(presence.userId));
    if (state.players.length >= 2) {
        return {
            state: state,
            accept: false,
            rejectMessage: "Match is full",
        };
    }
    return {
        state: state,
        accept: true,
    };
};
var matchSignal = function (ctx, logger, nk, dispatcher, tick, state, data) {
    logger.info("Received match signal");
    return {
        state: state,
        data: data,
    };
};
var matchmakerMatched = function (ctx, logger, nk, entries) {
    logger.info("Matchmaker matched users");
    var matchId = nk.matchCreate("match", {});
    logger.info("Created match: " + matchId);
    var matchIdStr = String(matchId);
    logger.info("Created match: " + matchIdStr);
    return matchId;
};
var InitModule = function (ctx, logger, nk, initializer) {
    initializer.registerMatch("match", {
        matchInit: matchInit,
        matchJoin: matchJoin,
        matchLoop: matchLoop,
        matchLeave: matchLeave,
        matchTerminate: matchTerminate,
        matchJoinAttempt: matchJoinAttempt,
        matchSignal: matchSignal,
    });
    initializer.registerMatchmakerMatched(matchmakerMatched);
    logger.info("Tic-Tac-Toe module loaded");
};
