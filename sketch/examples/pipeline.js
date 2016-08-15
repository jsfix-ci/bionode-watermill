'use strict'

const split = require('split')
const fs = require('fs')
const through = require('through2')

const { task, join, parallel } = require('../')

const dumpPIDs = task({
  input: null,
  output: '*.pids',
  name: 'Dump all PIDs to *.pids'
}, () => `ps aux | awk '{print $2}' | tail -n +2 > ${Date.now()}.pids`)

// dumpPIDs().then((results) => console.log('final results: ', results))

const numbersToLetters = task({
  input: '*.pids',
  output: '*.txt',
  name: 'Convert lines of numbers to letters'
}, ({ input }) =>
  fs.createReadStream(input)
    .pipe(split())
    .pipe(through(function(chunk, enc, cb) {
      const line = chunk.toString()

      const val = parseInt(chunk.toString()) % 65
      if (!isNaN(val)) this.push(String.fromCharCode(val))

      cb()
    }))
    .pipe(fs.createWriteStream(input.replace(/pids$/, 'txt')))
)

numbersToLetters().then((result) => console.log('result:', result))

// A -> B
// join(dumpPIDs, numbersToLetters)()
//   .then(console.log)
