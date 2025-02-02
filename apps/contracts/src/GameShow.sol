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
        string[] questions;
        uint256 playersCount;
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
        uint256 gameId,
        string name,
        uint256 entryFee,
        uint256 playersLimit,
        uint256 expectedStartTime,
        uint256 duration,
        uint256 questionsCount
    );

    event GameStarted(
        uint256 gameId,
        uint256 startTime,
        uint256 endTime,
        string[] questions
    );

    event GameJoined(address player, uint256 gameId);

    event GameEnded(uint256 gameId);

    event GameSettled(uint256 gameId, address winner);

    /*//////////////////////////////////////////////////////////////
                                 ERRORS
    //////////////////////////////////////////////////////////////*/

    // Errors relating to joining the game
    error InvalidEntryFee();
    error AlreadyJoined();
    error TooLateToJoin();
    error GameIsFull();

    // Error relating to submitting responses
    error GameHasNotStarted();
    error GameHasEnded();

    // Misc errors
    error Unauthorized();
    error CannotStartGame();
    error CannotCreateGame();
    error GameDoesNotExist();

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
        uint256 endTime = game.startTime + game.duration;
        uint256 responseCount = game.responses[msg.sender].length;

        if (game.state == GameState.Empty) revert GameDoesNotExist();
        if (game.state < GameState.Active) revert GameHasNotStarted();
        if (block.timestamp > endTime) revert GameHasEnded();
        if (responseCount != game.questions.length) revert Unauthorized();

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

    function startGame(
        uint256 _gameId,
        string[] calldata _questions
    ) external onlyOwner {
        Game storage game = games[_gameId];
        uint256 startTime = block.timestamp;
        uint256 endTime = startTime + game.duration;

        if (
            game.state != GameState.Pending ||
            _questions.length != game.questions.length
        ) {
            revert CannotStartGame();
        }

        game.state = GameState.Active;
        game.startTime = startTime;
        game.questions = _questions;

        emit GameStarted(_gameId, startTime, endTime, _questions);
    }

    /*//////////////////////////////////////////////////////////////
                           INTERNAL FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /*//////////////////////////////////////////////////////////////
                           REQUIRED OVERRIDES
    //////////////////////////////////////////////////////////////*/
}
