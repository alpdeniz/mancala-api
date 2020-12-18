const mancala = require('./mancala');

// init game
let m = new mancala();
let result;

test("Init and make the first move", () => {

    expect(m.pits).toStrictEqual([ 6, 6, 6, 6, 6, 6, 0, 6, 6, 6, 6, 6, 6, 0 ])
})

test("Play again", () => {
    result = m.pick(0, 0)
    expect(result.moveAgain).toBe(true)
    result = m.pick(0, 1)
    expect(result.moveAgain).toBe(false)
})

test("Wrong pit selection", () => {
    result = m.pick(1, 3)
    expect(result.moveAgain).toBe(false)
    expect(result.error).toBe(true)
})

test("Continue playing", () => {
    result = m.pick(1, 10)
    expect(m.pits[10]).toBe(0)
})