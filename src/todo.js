import MyDB from './database.js';

class Task
{
    text;
    status;
    date_created;
    date_edited;
    id;

    constructor(input)
    {
        if (typeof(input) === "string")
        {
            this.text = input;
            this.status = 0;
            this.date_created = new Date();
            this.date_edited = new Date();
            this.id = 0;        // THIS MUST BE SET ELSEWHERE!!!!!!!!
        }
        else
        {
            Object.assign(this, input);
        }
    }

    edit(text)
    {
        this.text = text;
        this.date_edited = new Date();
    }

    delete()
    {
        this.status = 2;
        this.date_edited = new Date();
    }

    complete()
    {
        this.status = 1;
        this.date_edited = new Date();
    }
}

class Todo
{
    db;

    active_tasks;

    historic_tasks;

    tablename = "todo";

    parent_element;
    title_element;
    buttons_element;
    content_element;

    constructor(parent)
    {
        this.db = MyDB.getStandardAPIs();
        this.active_tasks = [];
        this.historic_tasks = [];
        this.parent_element = parent;
        this.title_element = this.parent_element.querySelector(".title")
        this.buttons_element = this.parent_element.querySelector(".buttons")
        this.content_element = this.parent_element.querySelector(".content")
    }

    checkRecords = async () =>
    {
        let temp = await this.db.list();
        if (temp.data.tables.includes(this.tablename))
        {
            let query = {};
            query.table = this.tablename;
            query.orderBy = "date_created";
            let resp =  await this.db.read.post("", query);

            for (let item of resp.data.records)
            {
                console.log(item);
            }
        }
        else
        {
            console.log("No Records!");
        }
    }

    makeNewTask = async(text) =>
    {
        let query = {};

        let newTask = new Task(text);

        query.table = this.tablename;
        query.record = newTask;

        let resp = await this.db.create.post("",query);

        newTask.id = resp.data.id;

        this.active_tasks.push(newTask);
    }

    loadActiveTasks = async() =>
    {
        let query = {};
        query.table = this.tablename;
        query.orderBy = "date_created";
        query.query = "status == 0";

        let resp = await this.db.read.post("", query);
        this.active_tasks = resp.data.records.map(item=> new Task(item));
    }

    loadHistoricTasks = async() =>
    {
        let query = {};
        query.table = this.tablename;
        query.orderBy = "date_created";
        query.query = "status != 0";

        let resp = await this.db.read.post("", query);
        this.historic_tasks = resp.data.records.map(item=> new Task(item));
    }

    editTask = async(id, text) =>
    {
        let target = this.active_tasks.find(item=> item.id === id);
        target.edit(text);

        let query = {}
        query.table = this.tablename;
        query.record = target;

        let resp = await this.db.update.post("", query);
    }

    completeTask = async(id) =>
    {
        let target = this.active_tasks.find(item=> item.id === id);
        target.complete();

        let query = {}
        query.table = this.tablename;
        query.record = target;

        let resp = await this.db.update.post("", query);

        this.active_tasks = this.active_tasks.filter(item=> item !== target);
    }

    deleteTask = async(id) =>
    {
        let target = this.active_tasks.find(item=> item.id === id);
        target.delete();

        let query = {}
        query.table = this.tablename;
        query.id = target.id;

        let resp = await this.db.delete.post("", query);

        this.active_tasks = this.active_tasks.filter(item=> item !== target);
    }

    displayActiveTasks(target)
    {
        this.home = false;

        let ol = target.querySelector("ol");

        if (ol)
        {
            ol.innerHTML = "";
        }
        else
        {
            target.innerHTML = "";
            ol = document.createElement("ol");
            ol.type = "1";
            target.appendChild(ol)
        }
        
        for (let item of this.active_tasks)
        {
            let li = document.createElement("li");

            let left_button = document.createElement("button");
            left_button.innerHTML = "Done";
            left_button.style.display = "inline";
            
            let task_text = document.createElement("p");
            task_text.innerHTML = item.text;
            task_text.style.display = "inline";
            
            let right_button = document.createElement("button");
            right_button.innerHTML = "Edit";
            right_button.style.display = "inline";

            let holder = document.createElement("div");

            holder.appendChild(left_button);
            holder.appendChild(task_text);
            holder.appendChild(right_button);

            li.appendChild(holder);

            li.id = item.id;

            ol.appendChild(li);
        }

    }

    displayStart()
    {
        this.home = true;

        this.initializeButtons();

        this.title_element.innerHTML = "Todo";

        this.content_element.innerHTML = "";

        this.initializeHome();

        this.content_element.appendChild(this.button_display);
    }

    initializeHome()
    {
        if (!this.button_display)
        {
            let button_display = document.createElement("button");
            button_display.innerHTML = "Todo List";
            button_display.classList.add("showlist");
            button_display.addEventListener("click", evt =>{
                this.displayActiveTasks(this.content_element);
            });
            this.button_display = button_display;
        }
    }

    initializeButtons()
    {
        if (this.buttons_element.innerHTML === "")
        {
            let button_exit = document.createElement("button");
            button_exit.innerHTML = "Exit";
            button_exit.classList.add("exit");
            button_exit.addEventListener("click", evt =>{
                if (!this.home) this.displayStart();
                else console.log("Unfocus!");
            });
    
            // this.parent_element.appendChild(title);
            this.buttons_element.appendChild(button_exit);
        }
        else
        {
            console.log("Buttons are good!");
        }
    }
}

export default Todo;