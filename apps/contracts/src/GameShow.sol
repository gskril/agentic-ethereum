// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract GameShow is Ownable {
    /*//////////////////////////////////////////////////////////////
                                STRUCTS
    //////////////////////////////////////////////////////////////*/

    enum GameState {
        Empty,
        Pending,
        Active,
        // Ideally there could be a `Closed` state here, but that's not determined by a state change
        Settled
    }

    struct Game {
        string name;
        GameState state;
        uint256 entryFee;
        uint256 playersLimit;
        uint256 startTime;
        uint256 duration;
        uint256 playersCount;
        string[] questions;
        mapping(address => bytes[]) responses;
    }

    /*//////////////////////////////////////////////////////////////
                               PARAMETERS
    //////////////////////////////////////////////////////////////*/

    string public name = "Game Show";

    uint256 public gameCount;

    mapping(uint256 => Game) public games;

    /*//////////////////////////////////////////////////////////////
                                 EVENTS
    //////////////////////////////////////////////////////////////*/

    event GameCreated(
        uint256 indexed gameId,
        string name,
        uint256 entryFee,
        uint256 playersLimit,
        uint256 indexed expectedStartTime,
        uint256 duration,
        uint256 questionsCount
    );

    event GameStarted(
        uint256 indexed gameId,
        uint256 indexed startTime,
        uint256 indexed endTime,
        string[] questions
    );

    event GameJoined(address indexed player, uint256 indexed gameId);

    event ResponsesSubmitted(
        address indexed player,
        uint256 indexed gameId,
        bytes[] responses
    );

    event GameSettled(uint256 indexed gameId, address indexed winner, uint256 prize);

    /*//////////////////////////////////////////////////////////////
                                 ERRORS
    //////////////////////////////////////////////////////////////*/

    // Player
    error AlreadyJoined();
    error GameDoesNotExist();
    error GameHasEnded();
    error GameHasNotStarted();
    error GameIsFull();
    error InvalidEntryFee();
    error TooLateToJoin();
    error Unauthorized();

    // Owner
    error CannotCreateGame();
    error CannotStartGame();
    error FailedToSendPrize();
    error GameNotOver();
    error InvalidWinner();

    // Misc
    error QuestionsLengthMismatch();

    /*//////////////////////////////////////////////////////////////
                               MODIFIERS
    //////////////////////////////////////////////////////////////*/

    // User can join a game if all of the following are true:
    // 1. The game exists
    // 2. The entry fee is correct
    // 3. The game's estimated start time is in the future
    // 4. The game is not full
    // 5. They have not already joined the game
    modifier canJoinGame(uint256 _gameId) {
        Game storage game = games[_gameId];

        if (game.state == GameState.Empty) revert GameDoesNotExist();
        if (msg.value != game.entryFee) revert InvalidEntryFee();
        if (block.timestamp > game.startTime) revert TooLateToJoin();
        if (game.playersCount >= game.playersLimit) revert GameIsFull();
        if (game.responses[msg.sender].length > 0) revert AlreadyJoined();

        _;
    }

    // User can submit responses if all of the following are true:
    // 1. The game exists
    // 2. The questions have been set (this officially starts the game)
    // 3. The game has not ended
    // 4. The sender is a player in the game (they have an initiated list of responses)
    modifier canSubmitResponses(uint256 _gameId) {
        Game storage game = games[_gameId];

        if (game.state == GameState.Empty) revert GameDoesNotExist();
        if (game.state < GameState.Active) revert GameHasNotStarted();
        if (block.timestamp > game.startTime + game.duration) revert GameHasEnded();
        if (game.responses[msg.sender].length == 0) revert Unauthorized();

        _;
    }

    /*//////////////////////////////////////////////////////////////
                              CONSTRUCTOR
    //////////////////////////////////////////////////////////////*/

    constructor(address _owner) Ownable(_owner) {}

    /*//////////////////////////////////////////////////////////////
                            PUBLIC FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    function joinGame(uint256 _gameId) external payable canJoinGame(_gameId) {
        Game storage game = games[_gameId];

        game.playersCount++;
        game.responses[msg.sender] = new bytes[](game.questions.length);

        emit GameJoined(msg.sender, _gameId);
    }

    function submitResponses(
        uint256 _gameId,
        bytes[] calldata _responses
    ) external canSubmitResponses(_gameId) {
        Game storage game = games[_gameId];

        if (_responses.length != game.questions.length) {
            revert QuestionsLengthMismatch();
        }

        for (uint256 i = 0; i < _responses.length; i++) {
            game.responses[msg.sender][i] = _responses[i];
        }

        emit ResponsesSubmitted(msg.sender, _gameId, _responses);
    }

    /*//////////////////////////////////////////////////////////////
                            ADMIN FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    function createGame(
        string memory _name,
        uint256 _entryFee,
        uint256 _playersLimit,
        uint256 _expectedStartTime,
        uint256 _duration,
        uint256 _questionsCount
    ) external onlyOwner {
        // Make sure there is no other game currently active
        if (gameCount > 0) {
            Game storage previousGame = games[gameCount - 1];
            if (
                previousGame.state > GameState.Empty &&
                previousGame.state < GameState.Settled
            ) revert CannotCreateGame();
        }

        uint256 gameId = gameCount++;
        Game storage game = games[gameId];

        // Make sure that games are scheduled at least 1 minute in the future and last at least 30 seconds
        if (_expectedStartTime < block.timestamp + 60 || _duration < 30) {
            revert CannotCreateGame();
        }

        // Initialize the game
        game.name = _name;
        game.state = GameState.Pending;
        game.entryFee = _entryFee;
        game.playersLimit = _playersLimit;
        game.startTime = _expectedStartTime;
        game.duration = _duration;
        game.questions = new string[](_questionsCount);

        emit GameCreated(
            gameId,
            _name,
            _entryFee,
            _playersLimit,
            _expectedStartTime,
            _duration,
            _questionsCount
        );
    }

    function startGame(uint256 _gameId, string[] calldata _questions) external onlyOwner {
        Game storage game = games[_gameId];
        uint256 startTime = block.timestamp;
        uint256 endTime = startTime + game.duration;

        if (game.state != GameState.Pending) revert CannotStartGame();
        if (_questions.length != game.questions.length) revert QuestionsLengthMismatch();

        game.state = GameState.Active;
        game.startTime = startTime;
        game.questions = _questions;

        emit GameStarted(_gameId, startTime, endTime, _questions);
    }

    function settleGame(uint256 _gameId, address _winner) external onlyOwner {
        Game storage game = games[_gameId];

        // Check that we're ready to settle the game
        if (
            game.state < GameState.Active &&
            block.timestamp < game.startTime + game.duration
        ) revert GameNotOver();

        // Check that the selected winner actually joined the game
        // Note: technically this doesn't check that they submitted responses
        if (game.responses[_winner].length == 0) revert InvalidWinner();

        // Settle the game and send the prize to the winner
        game.state = GameState.Settled;
        uint256 prize = game.entryFee * game.playersCount;
        (bool success, ) = _winner.call{value: prize}("");
        if (!success) revert FailedToSendPrize();
        emit GameSettled(_gameId, _winner, prize);
    }

    /*//////////////////////////////////////////////////////////////
                           INTERNAL FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /*//////////////////////////////////////////////////////////////
                           REQUIRED OVERRIDES
    //////////////////////////////////////////////////////////////*/
}
