const crypto = require('crypto');

const ROOM_CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no O/0/I/1 ambiguity
const ROOM_CODE_LENGTH = 6;

/**
 * Returns a cryptographically secure random integer in [min, max] inclusive.
 */
function secureRandomInt(min, max) {
  const range = max - min + 1;
  if (range <= 0) throw new Error('Invalid range for secureRandomInt');

  const maxUint32 = 0xffffffff;
  const limit = maxUint32 - (maxUint32 % range);

  let rand;
  do {
    rand = crypto.randomBytes(4).readUInt32BE(0);
  } while (rand > limit);

  return min + (rand % range);
}

/**
 * Generates a random 6-character uppercase alphanumeric room code.
 * e.g. A7X9BQ
 */
function generateRoomCode() {
  let code = '';
  for (let i = 0; i < ROOM_CODE_LENGTH; i++) {
    const idx = secureRandomInt(0, ROOM_CODE_CHARS.length - 1);
    code += ROOM_CODE_CHARS[idx];
  }
  return code;
}

/**
 * Rolls a single 6-sided die using a cryptographically secure RNG.
 */
function rollDie() {
  return secureRandomInt(1, 6);
}

/**
 * Rolls two 6-sided dice, returns { die1, die2, total, isDouble }.
 */
function rollTwoDice() {
  const die1 = rollDie();
  const die2 = rollDie();
  return { die1, die2, total: die1 + die2, isDouble: die1 === die2 };
}

/**
 * Fisher-Yates shuffle using the secure RNG. Returns a new shuffled array.
 */
function secureShuffle(array) {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = secureRandomInt(0, i);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

module.exports = {
  secureRandomInt,
  generateRoomCode,
  rollDie,
  rollTwoDice,
  secureShuffle,
};
