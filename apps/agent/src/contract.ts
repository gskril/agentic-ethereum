// This should probably be in a separate "shared" package but this works fine for now
export const GAMESHOW_CONTRACT = {
  fromBlock: 26156358n,
  address: '0x00000000B5bec517B9641973230B171E3E859662',
  abi: [
    {
      inputs: [
        {
          internalType: 'address',
          name: '_owner',
          type: 'address',
        },
      ],
      stateMutability: 'nonpayable',
      type: 'constructor',
    },
    {
      inputs: [],
      name: 'AlreadyJoined',
      type: 'error',
    },
    {
      inputs: [],
      name: 'CannotCreateGame',
      type: 'error',
    },
    {
      inputs: [],
      name: 'CannotExecuteDuringGame',
      type: 'error',
    },
    {
      inputs: [],
      name: 'CannotStartGame',
      type: 'error',
    },
    {
      inputs: [],
      name: 'FailedToExecute',
      type: 'error',
    },
    {
      inputs: [],
      name: 'FailedToSendPrize',
      type: 'error',
    },
    {
      inputs: [],
      name: 'GameDoesNotExist',
      type: 'error',
    },
    {
      inputs: [],
      name: 'GameHasEnded',
      type: 'error',
    },
    {
      inputs: [],
      name: 'GameHasNotStarted',
      type: 'error',
    },
    {
      inputs: [],
      name: 'GameIsFull',
      type: 'error',
    },
    {
      inputs: [],
      name: 'GameNotOver',
      type: 'error',
    },
    {
      inputs: [],
      name: 'InvalidEntryFee',
      type: 'error',
    },
    {
      inputs: [],
      name: 'InvalidWinner',
      type: 'error',
    },
    {
      inputs: [
        {
          internalType: 'address',
          name: 'owner',
          type: 'address',
        },
      ],
      name: 'OwnableInvalidOwner',
      type: 'error',
    },
    {
      inputs: [
        {
          internalType: 'address',
          name: 'account',
          type: 'address',
        },
      ],
      name: 'OwnableUnauthorizedAccount',
      type: 'error',
    },
    {
      inputs: [],
      name: 'QuestionsLengthMismatch',
      type: 'error',
    },
    {
      inputs: [],
      name: 'TooLateToJoin',
      type: 'error',
    },
    {
      inputs: [],
      name: 'Unauthorized',
      type: 'error',
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,
          internalType: 'uint256',
          name: 'oldFee',
          type: 'uint256',
        },
        {
          indexed: false,
          internalType: 'uint256',
          name: 'newFee',
          type: 'uint256',
        },
      ],
      name: 'FeeChanged',
      type: 'event',
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: 'uint256',
          name: 'gameId',
          type: 'uint256',
        },
        {
          indexed: false,
          internalType: 'string',
          name: 'title',
          type: 'string',
        },
        {
          indexed: false,
          internalType: 'uint256',
          name: 'entryFee',
          type: 'uint256',
        },
        {
          indexed: false,
          internalType: 'uint256',
          name: 'playersLimit',
          type: 'uint256',
        },
        {
          indexed: true,
          internalType: 'uint256',
          name: 'expectedStartTime',
          type: 'uint256',
        },
        {
          indexed: false,
          internalType: 'uint256',
          name: 'duration',
          type: 'uint256',
        },
        {
          indexed: false,
          internalType: 'uint256',
          name: 'questionsCount',
          type: 'uint256',
        },
      ],
      name: 'GameCreated',
      type: 'event',
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: 'address',
          name: 'player',
          type: 'address',
        },
        {
          indexed: true,
          internalType: 'uint256',
          name: 'gameId',
          type: 'uint256',
        },
      ],
      name: 'GameJoined',
      type: 'event',
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: 'uint256',
          name: 'gameId',
          type: 'uint256',
        },
        {
          indexed: true,
          internalType: 'address',
          name: 'winner',
          type: 'address',
        },
        {
          indexed: false,
          internalType: 'uint256',
          name: 'prize',
          type: 'uint256',
        },
      ],
      name: 'GameSettled',
      type: 'event',
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: 'uint256',
          name: 'gameId',
          type: 'uint256',
        },
        {
          indexed: true,
          internalType: 'uint256',
          name: 'startTime',
          type: 'uint256',
        },
        {
          indexed: true,
          internalType: 'uint256',
          name: 'endTime',
          type: 'uint256',
        },
        {
          indexed: false,
          internalType: 'string[]',
          name: 'questions',
          type: 'string[]',
        },
      ],
      name: 'GameStarted',
      type: 'event',
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: 'address',
          name: 'previousOwner',
          type: 'address',
        },
        {
          indexed: true,
          internalType: 'address',
          name: 'newOwner',
          type: 'address',
        },
      ],
      name: 'OwnershipTransferred',
      type: 'event',
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: 'address',
          name: 'player',
          type: 'address',
        },
        {
          indexed: true,
          internalType: 'uint256',
          name: 'gameId',
          type: 'uint256',
        },
        {
          indexed: false,
          internalType: 'bytes[]',
          name: 'responses',
          type: 'bytes[]',
        },
      ],
      name: 'ResponsesSubmitted',
      type: 'event',
    },
    {
      inputs: [
        {
          internalType: 'uint256',
          name: '_newFee',
          type: 'uint256',
        },
      ],
      name: 'changeFee',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [
        {
          internalType: 'string',
          name: '_title',
          type: 'string',
        },
        {
          internalType: 'uint256',
          name: '_entryFee',
          type: 'uint256',
        },
        {
          internalType: 'uint256',
          name: '_playersLimit',
          type: 'uint256',
        },
        {
          internalType: 'uint256',
          name: '_expectedStartTime',
          type: 'uint256',
        },
        {
          internalType: 'uint256',
          name: '_duration',
          type: 'uint256',
        },
        {
          internalType: 'uint256',
          name: '_questionsCount',
          type: 'uint256',
        },
      ],
      name: 'createGame',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [
        {
          internalType: 'address',
          name: '_to',
          type: 'address',
        },
        {
          internalType: 'uint256',
          name: '_value',
          type: 'uint256',
        },
        {
          internalType: 'bytes',
          name: '_data',
          type: 'bytes',
        },
      ],
      name: 'execute',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [],
      name: 'fee',
      outputs: [
        {
          internalType: 'uint256',
          name: '',
          type: 'uint256',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [],
      name: 'gameCount',
      outputs: [
        {
          internalType: 'uint256',
          name: '',
          type: 'uint256',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [
        {
          internalType: 'uint256',
          name: '',
          type: 'uint256',
        },
      ],
      name: 'games',
      outputs: [
        {
          internalType: 'string',
          name: 'title',
          type: 'string',
        },
        {
          internalType: 'enum GameShow.GameState',
          name: 'state',
          type: 'uint8',
        },
        {
          internalType: 'uint256',
          name: 'entryFee',
          type: 'uint256',
        },
        {
          internalType: 'uint256',
          name: 'playersLimit',
          type: 'uint256',
        },
        {
          internalType: 'uint256',
          name: 'startTime',
          type: 'uint256',
        },
        {
          internalType: 'uint256',
          name: 'duration',
          type: 'uint256',
        },
        {
          internalType: 'uint256',
          name: 'playersCount',
          type: 'uint256',
        },
        {
          internalType: 'address',
          name: 'winner',
          type: 'address',
        },
        {
          internalType: 'uint256',
          name: 'questionsCount',
          type: 'uint256',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [
        {
          internalType: 'uint256',
          name: '_gameId',
          type: 'uint256',
        },
      ],
      name: 'joinGame',
      outputs: [],
      stateMutability: 'payable',
      type: 'function',
    },
    {
      inputs: [
        {
          internalType: 'uint256',
          name: '_gameId',
          type: 'uint256',
        },
        {
          internalType: 'address',
          name: '_player',
          type: 'address',
        },
      ],
      name: 'joinedGame',
      outputs: [
        {
          internalType: 'bool',
          name: '',
          type: 'bool',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [],
      name: 'name',
      outputs: [
        {
          internalType: 'string',
          name: '',
          type: 'string',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [],
      name: 'owner',
      outputs: [
        {
          internalType: 'address',
          name: '',
          type: 'address',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [],
      name: 'renounceOwnership',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [
        {
          internalType: 'uint256',
          name: '_gameId',
          type: 'uint256',
        },
        {
          internalType: 'address',
          name: '_winner',
          type: 'address',
        },
      ],
      name: 'settleGame',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [
        {
          internalType: 'uint256',
          name: '_gameId',
          type: 'uint256',
        },
        {
          internalType: 'string[]',
          name: '_questions',
          type: 'string[]',
        },
      ],
      name: 'startGame',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [
        {
          internalType: 'uint256',
          name: '_gameId',
          type: 'uint256',
        },
        {
          internalType: 'bytes[]',
          name: '_responses',
          type: 'bytes[]',
        },
      ],
      name: 'submitResponses',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [
        {
          internalType: 'address',
          name: 'newOwner',
          type: 'address',
        },
      ],
      name: 'transferOwnership',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
  ],
} as const
