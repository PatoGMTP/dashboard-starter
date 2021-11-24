import Countdown from './src/countdown.js';
import Giphy from './src/giphy.js';
import Todo from './src/todo.js';
import Deals from './src/deals.js';
import Crypto from './src/crypto.js';
import Reference from './src/reference.js';
import Sidebar from './src/sidebar.js';

// let countdown = new Countdown(1,2);
// countdown.render();

// let gifpane = new Giphy();
// gifpane.render();

// var date = new Date(unixTimestamp*1000);

let todo_div = document.querySelector(".todo");
let crypto_div = document.querySelector(".crypto");
let reference_div = document.querySelector(".reference");
let deals_div = document.querySelector(".deals");
let side_div = document.querySelector(".sidebar");

// todo_div.style.overflow = "scroll";
// crypto_div.style.overflow = "scroll";
// reference_div.style.overflow = "scroll";
// deals_div.style.overflow = "scroll";

const todo = new Todo(todo_div);
const deals = new Deals(deals_div);
const crypto = new Crypto(crypto_div);
const reference = new Reference(reference_div);
const sidebar = new Sidebar(side_div);

sidebar.displayStart();

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

// let temp = todo.active_tasks;
// todo.completeTask(temp[0].id);

// await deals.getBestDeals();
// await deals.searchDeals("hades");
deals.loadGames().then(evt => {
    deals.displayStart();
});

await crypto.firstTimeSetup();
await crypto.getPrevious();

let val = true;

await crypto5SecLoop(true);

// console.log(crypto.current);

setInterval(() => {
    crypto5SecLoop(val).then(evt => {crypto.updateForm();});
}, 5000);

async function crypto5SecLoop(input)
{
    let resp = await cryptoPing(crypto, crypto.getCurrent);

    // console.log(resp);
    
    if (resp === "Error")
    {
        cryptoErrorHandler(crypto, crypto.getCurrent, input);   
    }
    else
    {
        startCryptoWidget(crypto, input);
    }
}

await crypto1MinLoop();

setInterval(() => {
    crypto1MinLoop().then(evt => {crypto.renderPlot();});
}, 60000);

async function crypto1MinLoop()
{
    let resp = await cryptoPing(crypto, crypto.getHistory);
    
    if (resp === "Error")
    {
        cryptoErrorHandler(crypto, crypto.getHistory, false);   
    }
}


async function cryptoPing(widget, func)
{
    let resp = null;
    let count = 0;
    while (resp === null)
    {
        if (count > 20)
        {
            console.log("Serious API Error!");
            resp = "Error";
            break;
        }
        try
        {
            resp = await func();
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

async function cryptoErrorHandler(widget, func, input)
{
    let error_string = "Error...";
    crypto.content_element.innerHTML = error_string;

    let resp = null;

    while (resp === null)
    {
        setTimeout(async evt => {resp = await cryptoPing(widget, func);}, 100);
    }

    startCryptoWidget(widget, input);
}

async function startCryptoWidget(widget, input)
{
    // console.log(input);
    if (input)
    {
        val = false;
        return widget.displayStart();
    }
}