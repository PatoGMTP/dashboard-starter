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

    active_list;
    historic_list;

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
        query.record = target;

        let resp = await this.db.update.post("", query);

        this.active_tasks = this.active_tasks.filter(item=> item !== target);
    }

    displayHistoricTasks()
    {
        this.home = false;

        this.button_new_task.hidden = true;

        this.content_element.innerHTML = "";

        if (this.historic_list.innerHTML === "")
        {
            for (let item of this.historic_tasks)
            {
                this.historic_list.appendChild(this.displayHistoricTask(item));
            }
        }
        else
        {
            console.log("Reusing history!");
        }
        
        this.content_element.appendChild(this.historic_list);
    }

    displayActiveTasks()
    {
        this.home = false;

        this.button_new_task.hidden = false;

        this.content_element.innerHTML = "";
        
        if (this.active_list.innerHTML === "")
        {
            for (let item of this.active_tasks)
            {
                this.active_list.appendChild(this.displayActiveTask(item));
            }
        }
        else
        {
            console.log("Reusing content!");
        }
        
        this.content_element.appendChild(this.active_list);
    }

    displayActiveTask(item)
    {
        let li = document.createElement("li");

        let left_button = document.createElement("button");
        left_button.innerHTML = "Done";
        left_button.style.display = "inline";

        left_button.addEventListener("click", evt => {
            if (evt.target.innerHTML === "Done")
            {
                console.log("Done!");
                let parent = evt.target.parentElement;
                this.completeTask(parent.id);
                this.active_list.removeChild(parent.parentElement);
            }
            else if (evt.target.innerHTML === "Save")
            {
                console.log("Save!");
                let parent = evt.target.parentElement;
                parent.children[0].innerHTML = "Done";
                parent.children[1].readOnly = true;
                parent.children[2].innerHTML = "Edit";

                this.editTask(parent.id, parent.children[1].value)
            }
        });
        
        let task_text = document.createElement("input");
        task_text.value = item.text;
        task_text.readOnly = true;
        task_text.style.display = "inline";
        
        let right_button = document.createElement("button");
        right_button.innerHTML = "Edit";
        right_button.style.display = "inline";

        right_button.addEventListener("click", evt => {
            if (evt.target.innerHTML === "Edit")
            {
                let parent = evt.target.parentElement;
                parent.children[0].innerHTML = "Save";
                parent.children[1].readOnly = false;
                parent.children[2].innerHTML = "Delete";
            }
            else if (evt.target.innerHTML === "Delete")
            {
                let parent = evt.target.parentElement;
                // console.log("Delete!", evt.target.previousElementSibling.value);
                this.deleteTask(parent.id);
                this.active_list.removeChild(parent.parentElement);
            }
        });

        let holder = document.createElement("div");
        holder.id = item.id;

        holder.appendChild(left_button);
        holder.appendChild(task_text);
        holder.appendChild(right_button);

        li.appendChild(holder);

        li.id = item.id;

        return li;
    }

    displayStart()
    {
        this.home = true;

        this.initializeButtons();

        this.title_element.innerHTML = "Todo";

        this.content_element.innerHTML = "";

        this.initializeHome();

        this.content_element.appendChild(this.button_display);

        this.initializeLists();
    }

    initializeLists()
    {
        if (!this.active_list)
        {
            let list = document.createElement("ol");
            list.type = "1";
            this.active_list = list;
        }

        if (!this.historic_list)
        {
            let list = document.createElement("ol");
            list.type = "1";
            this.historic_list = list;
        }
    }

    initializeHome()
    {
        if (!this.button_display)
        {
            let button_display = document.createElement("button");
            button_display.innerHTML = "Todo List";
            button_display.classList.add("showactive");
            button_display.addEventListener("click", evt =>{
                this.displayActiveTasks();
            });
            this.button_display = button_display;
        }

        if (!this.button_history)
        {
            let button_history = document.createElement("button");
            button_history.innerHTML = "Task History";
            button_history.classList.add("showhistory");
            button_history.addEventListener("click", evt =>{
                this.displayHistoricTasks();
            });
            this.button_history = button_history;
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

            let button_new_task = document.createElement("button");
            button_new_task.innerHTML = "New Task";
            button_new_task.classList.add("newtask");
            button_new_task.addEventListener("click", evt =>{
                this.makeNewTask("").then(resp =>{
                    let newest = this.active_tasks.slice(-1)[0];
                    let newest_li = this.active_list.appendChild(this.displayActiveTask(newest));
                    newest_li.children[0].children[2].dispatchEvent(new Event("click"));
                    newest_li.children[0].children[1].focus();
                });
            });

            this.button_new_task = button_new_task;
            this.button_new_task.hidden = true;
    
            // this.parent_element.appendChild(title);
            this.buttons_element.appendChild(button_exit);
            this.buttons_element.appendChild(button_new_task);
        }
        else
        {
            console.log("Buttons are good!");
            this.button_new_task.hidden = true;
        }
    }
}

export default Todo;