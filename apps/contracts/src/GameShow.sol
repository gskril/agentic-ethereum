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
        string title;
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

    /// @notice Percentage of a game's total prize pool that is taken as a fee, expressed in basis points.
    /// @dev 1000 = 10%
    uint256 public fee = 1000;

    mapping(uint256 => Game) public games;

    /*//////////////////////////////////////////////////////////////
                                 EVENTS
    //////////////////////////////////////////////////////////////*/
    event GameCreated(
        uint256 indexed gameId,
        string title,
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
    error CannotExecuteDuringGame();
    error CannotStartGame();
    error FailedToExecute();
    error FailedToSendPrize();
    error GameNotOver();
    error InvalidWinner();

    // Misc
    error QuestionsLengthMismatch();

    /*//////////////////////////////////////////////////////////////
                               MODIFIERS
    //////////////////////////////////////////////////////////////*/

    /// @notice User can join a game if all of the following are true:
    /// 1. The game exists
    /// 2. The entry fee is correct
    /// 3. The game's estimated start time is in the future
    /// 4. The game is not full
    /// 5. They have not already joined the game
    modifier canJoinGame(uint256 _gameId) {
        Game storage game = games[_gameId];

        if (game.state == GameState.Empty) revert GameDoesNotExist();
        if (msg.value != game.entryFee) revert InvalidEntryFee();
        if (block.timestamp > game.startTime) revert TooLateToJoin();
        if (game.playersCount >= game.playersLimit) revert GameIsFull();
        if (joinedGame(_gameId, msg.sender)) revert AlreadyJoined();

        _;
    }

    /// @notice User can submit responses if all of the following are true:
    /// 1. The game exists
    /// 2. The questions have been set (this officially starts the game)
    /// 3. The game has not ended
    /// 4. The sender is a player in the game (they have an initiated list of responses)
    modifier canSubmitResponses(uint256 _gameId) {
        Game storage game = games[_gameId];

        if (game.state == GameState.Empty) revert GameDoesNotExist();
        if (game.state < GameState.Active) revert GameHasNotStarted();
        if (block.timestamp > game.startTime + game.duration) revert GameHasEnded();
        if (!joinedGame(_gameId, msg.sender)) revert Unauthorized();

        _;
    }

    /*//////////////////////////////////////////////////////////////
                              CONSTRUCTOR
    //////////////////////////////////////////////////////////////*/

    constructor(address _owner) Ownable(_owner) {}

    /*//////////////////////////////////////////////////////////////
                            PUBLIC FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /// @notice Join a game.
    function joinGame(uint256 _gameId) external payable canJoinGame(_gameId) {
        Game storage game = games[_gameId];

        game.playersCount++;
        game.responses[msg.sender] = new bytes[](game.questions.length);

        emit GameJoined(msg.sender, _gameId);
    }

    /// @notice Submit responses for a game that you've already joined.
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

    function joinedGame(uint256 _gameId, address _player) public view returns (bool) {
        Game storage game = games[_gameId];
        return game.responses[_player].length > 0;
    }

    /*//////////////////////////////////////////////////////////////
                            ADMIN FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /// @notice Create a new game.
    function createGame(
        string memory _title,
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
        game.title = _title;
        game.state = GameState.Pending;
        game.entryFee = _entryFee;
        game.playersLimit = _playersLimit;
        game.startTime = _expectedStartTime;
        game.duration = _duration;
        game.questions = new string[](_questionsCount);

        emit GameCreated(
            gameId,
            _title,
            _entryFee,
            _playersLimit,
            _expectedStartTime,
            _duration,
            _questionsCount
        );
    }

    /// @notice Start a game by setting the questions.
    function startGame(uint256 _gameId, string[] calldata _questions) external onlyOwner {
        Game storage game = games[_gameId];
        uint256 startTime = block.timestamp;
        uint256 endTime = startTime + game.duration;

        if (startTime < game.startTime) revert CannotStartGame();
        if (game.state != GameState.Pending) revert CannotStartGame();
        if (_questions.length != game.questions.length) revert QuestionsLengthMismatch();

        // If nobody joined the game, settle early
        if (game.playersCount == 0) {
            game.state = GameState.Settled;
            emit GameSettled(_gameId, address(0), 0);
            return;
        }

        game.state = GameState.Active;
        game.startTime = startTime;
        game.questions = _questions;

        emit GameStarted(_gameId, startTime, endTime, _questions);
    }

    /// @notice Settle a game and send the prize to the winner.
    function settleGame(uint256 _gameId, address _winner) external onlyOwner {
        Game storage game = games[_gameId];

        // Check that we're ready to settle the game
        if (
            game.state < GameState.Active ||
            block.timestamp < game.startTime + game.duration
        ) revert GameNotOver();

        // Check that the selected winner actually joined the game, or is the contract itself as a fallback
        // Note: technically this doesn't check that they submitted responses
        if (game.responses[_winner].length == 0 && _winner != address(this)) {
            revert InvalidWinner();
        }

        // Settle the game and send the prize to the winner
        game.state = GameState.Settled;
        uint256 totalTicketValue = game.entryFee * game.playersCount;
        uint256 operatorShare = (totalTicketValue * fee) / 10000;
        uint256 winnerPrize = totalTicketValue - operatorShare;
        (bool success, ) = _winner.call{value: winnerPrize}("");
        if (!success) revert FailedToSendPrize();
        emit GameSettled(_gameId, _winner, winnerPrize);
    }

    /// @notice Execute an arbitrary call. Used for withdrawing earned fees or recovering accidentally sent tokens.
    /// @dev This cannot be called during a game to prevent the owner from stealing the prize.
    function execute(address _to, uint256 _value, bytes memory _data) public onlyOwner {
        // Make sure there is no other game currently active
        if (gameCount > 0) {
            Game storage previousGame = games[gameCount - 1];
            if (
                previousGame.state > GameState.Empty &&
                previousGame.state < GameState.Settled
            ) revert CannotExecuteDuringGame();
        }

        (bool success, ) = _to.call{value: _value}(_data);
        if (!success) revert FailedToExecute();
    }
}
