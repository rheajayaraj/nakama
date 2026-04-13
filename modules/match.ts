type GameState = {
  board: string[];
  players: string[];
  turn: number;
  winner: string | null;
};

var matchInit = function (
  ctx: nkruntime.Context,
  logger: nkruntime.Logger,
  nk: nkruntime.Nakama,
  params: any,
) {
  var state: GameState = {
    board: Array(9).fill(""),
    players: [],
    turn: 0,
    winner: null,
  };

  logger.info("Match initialized");

  return {
    state,
    tickRate: 1,
    label: "tic-tac-toe",
  };
};

var matchJoin = function (
  ctx: nkruntime.Context,
  logger: nkruntime.Logger,
  nk: nkruntime.Nakama,
  dispatcher: nkruntime.MatchDispatcher,
  tick: number,
  state: GameState,
  presences: nkruntime.Presence[],
) {
  presences.forEach(function (p) {
    if (state.players.length < 2) {
      state.players.push(p.userId);
      logger.info(`Player joined: ${p.userId}`);
    }
  });

  dispatcher.broadcastMessage(1, nk.stringToBinary(JSON.stringify(state)));

  return { state };
};

var matchLoop = function (
  ctx: nkruntime.Context,
  logger: nkruntime.Logger,
  nk: nkruntime.Nakama,
  dispatcher: nkruntime.MatchDispatcher,
  tick: number,
  state: GameState,
  messages: nkruntime.MatchMessage[],
) {
  messages.forEach(function (msg) {
    var data = JSON.parse(nk.binaryToString(msg.data));
    var position = data.position;

    // ❌ Invalid if game already finished
    if (state.winner) {
      logger.info("Move rejected: game already finished");
      return;
    }

    // ❌ Invalid position
    if (position < 0 || position > 8) {
      logger.info("Invalid move position");
      return;
    }

    // ❌ Cell already filled
    if (state.board[position] !== "") {
      logger.info("Cell already occupied");
      return;
    }

    var playerIndex = state.players.indexOf(msg.sender.userId);

    // ❌ Not player's turn
    if (playerIndex !== state.turn) {
      logger.info("Not your turn");
      return;
    }

    // ✅ Apply move
    var symbol = playerIndex === 0 ? "X" : "O";
    state.board[position] = symbol;

    // ✅ Check winner
    state.winner = checkWinner(state.board);

    // ✅ Switch turn
    state.turn = (state.turn + 1) % 2;

    logger.info(`Move applied at position ${position}`);

    // 📡 Broadcast updated state
    dispatcher.broadcastMessage(1, nk.stringToBinary(JSON.stringify(state)));
  });

  return { state };
};

var matchLeave = function (
  ctx: nkruntime.Context,
  logger: nkruntime.Logger,
  nk: nkruntime.Nakama,
  dispatcher: nkruntime.MatchDispatcher,
  tick: number,
  state: GameState,
  presences: nkruntime.Presence[],
) {
  presences.forEach(function (presence) {
    logger.info(`Player left: ${presence.userId}`);

    // ✅ Remove player from state
    state.players = state.players.filter(
      (playerId) => playerId !== presence.userId,
    );
    state.turn = 0;
  });

  // End game if someone leaves
  if (!state.winner && state.players.length < 2) {
    state.winner = "opponent_left";
  }

  return { state };
};

var matchTerminate = function (
  ctx: nkruntime.Context,
  logger: nkruntime.Logger,
  nk: nkruntime.Nakama,
  dispatcher: nkruntime.MatchDispatcher,
  tick: number,
  state: GameState,
  graceSeconds: number,
) {
  logger.info("Match terminated");
  return { state };
};

// 🧠 Winner Logic
function checkWinner(board: string[]): string | null {
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

  if (
    board.every(function (cell) {
      return cell !== "";
    })
  ) {
    return "draw";
  }

  return null;
}

var matchJoinAttempt = function (
  ctx: nkruntime.Context,
  logger: nkruntime.Logger,
  nk: nkruntime.Nakama,
  dispatcher: nkruntime.MatchDispatcher,
  tick: number,
  state: GameState,
  presence: nkruntime.Presence,
  metadata: any,
) {
  logger.info(`Join attempt by ${presence.userId}`);

  // Allow only 2 players
  if (state.players.length >= 2) {
    return {
      state,
      accept: false,
      rejectMessage: "Match is full",
    };
  }

  return {
    state,
    accept: true,
  };
};

var matchSignal = function (
  ctx: nkruntime.Context,
  logger: nkruntime.Logger,
  nk: nkruntime.Nakama,
  dispatcher: nkruntime.MatchDispatcher,
  tick: number,
  state: GameState,
  data: string,
) {
  logger.info("Received match signal");

  // You can handle custom signals here if needed
  return {
    state,
    data: data, // echo back
  };
};

var matchmakerMatched = function (
  ctx: nkruntime.Context,
  logger: nkruntime.Logger,
  nk: nkruntime.Nakama,
  entries: any,
) {
  logger.info("Matchmaker matched users");

  // ✅ Cast nk to any
  var matchId = (nk as any).matchCreate("match", {});
  logger.info("Created match: " + matchId);

  var matchIdStr = String(matchId);

  logger.info("Created match: " + matchIdStr);

  return matchId;
};

// 🚀 Register module
var InitModule = function (
  ctx: nkruntime.Context,
  logger: nkruntime.Logger,
  nk: nkruntime.Nakama,
  initializer: nkruntime.Initializer,
) {
  initializer.registerMatch("match", {
    matchInit: matchInit,
    matchJoin: matchJoin,
    matchLoop: matchLoop,
    matchLeave: matchLeave,
    matchTerminate: matchTerminate,
    matchJoinAttempt: matchJoinAttempt,
    matchSignal: matchSignal,
  });
  (initializer as any).registerMatchmakerMatched(matchmakerMatched);

  logger.info("Tic-Tac-Toe module loaded");
};
