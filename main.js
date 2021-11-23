import Countdown from './src/countdown.js';
import Giphy from './src/giphy.js';
import Todo from './src/todo.js';
import Deals from './src/deals.js';
import Crypto from './src/crypto.js';
import Reference from './src/reference.js';

// let countdown = new Countdown(1,2);
// countdown.render();

// let gifpane = new Giphy();
// gifpane.render();

// var date = new Date(unixTimestamp*1000);

let todo_div = document.querySelector(".todo");
let crypto_div = document.querySelector(".crypto");
let reference_div = document.querySelector(".reference");
let deals_div = document.querySelector(".deals");

const todo = new Todo(todo_div);
const deals = new Deals(deals_div);
const crypto = new Crypto(crypto_div);
const reference = new Reference(reference_div);

console.log(todo, deals, crypto, reference);

// todo.checkRecords();
// await todo.makeNewTask("TEST");
todo.loadActiveTasks().then(evt => {
    todo.loadHistoricTasks().then(evt => {
        todo.displayStart();
    });
});
// await todo.editTask(todo.active_tasks[0].id, "Bye!");
// console.log(todo.active_tasks, todo.historic_tasks);
// todo.displayActiveTasks(todo_div);
// todo.displayStart();

// await reference.makeNewNote("Test", "TEXT!");
reference.loadNotes().then(evt => {reference.displayStart();});
// reference.editNote(reference.list[0].id, "test2", "New");
// reference.deleteNote(reference.list[0].id);
// reference.displayStart();

let resp = cryptoPing(crypto);

if (resp === "Error")
{
    cryptoErrorHandler(crypto);   
}
else
{
    startCryptoWidget(crypto);
}

async function cryptoPing(widget)
{
    let resp = null;
    let count = 0;
    while (resp === null)
    {
        if (count > 10)
        {
            console.log("Serious API Error!");
            resp = "Error";
            break;
        }
        try
        {
            resp = await widget.getCurrent();
        }
        catch (error)
        {
            count++;
            console.log("API failed, retrying");
            // setTimeout(console.log("trying now..."), 1000);
        }
    }
    console.log("Number of times crypto API failed:", count);
    return resp;
}

async function cryptoErrorHandler(widget)
{
    let error_string = "Error...";
    crypto.content_element.innerHTML = error_string;

    let resp = null;

    while (resp === null)
    {
        setTimeout(async evt => {resp = await cryptoPing(widget);}, 1000);
    }

    startCryptoWidget(widget);
}

async function startCryptoWidget(widget)
{
    await widget.firstTimeSetup();
    widget.getPrevious();
    return widget.displayStart();
}

// let temp = todo.active_tasks;
// todo.completeTask(temp[0].id);

// await deals.getBestDeals();
// await deals.searchDeals("hades");
deals.displayStart();