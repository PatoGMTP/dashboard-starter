import Countdown from './src/countdown.js';
import Giphy from './src/giphy.js';
import Todo from './src/todo.js';
import Deals from './src/deals.js';
import Crypto from './src/crypto.js';
import Reference from './src/reference.js';

// var date = new Date(unixTimestamp*1000);

const todo = new Todo();
const deals = new Deals();
const crypto = new Crypto();
const reference = new Reference();

console.log(todo, deals, crypto, reference);

todo.checkRecords();
await todo.loadActiveTasks();
await todo.loadHistoricTasks();
console.log(todo.active_tasks, todo.historic_tasks);

// let temp = todo.active_tasks;
// todo.completeTask(temp[0].id);

let countdown = new Countdown(1,2);
countdown.render();

let gifpane = new Giphy();
gifpane.render();