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
// await todo.makeNewTask("TEST");
await todo.loadActiveTasks();
await todo.loadHistoricTasks();
// await todo.editTask(todo.active_tasks[0].id, "Bye!");
console.log(todo.active_tasks, todo.historic_tasks);

// await reference.makeNewNote("Test", "TEXT!");
await reference.loadNotes();
console.log(reference.list);
// reference.editNote(reference.list[0].id, "test2", "New");
// reference.deleteNote(reference.list[0].id);

let resp = null;

while (resp === null)
{
    try
    {
        resp = await crypto.getCurrent();
    }
    catch (error)
    {
        console.log("API failed, retrying soon...");
        setTimeout(console.log("trying now..."), 1000);
    }
}

await crypto.firstTimeSetup();
crypto.getPrevious();

// let temp = todo.active_tasks;
// todo.completeTask(temp[0].id);

let countdown = new Countdown(1,2);
countdown.render();

let gifpane = new Giphy();
gifpane.render();