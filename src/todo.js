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

    convertDates()
    {
        this.date_created = new Date(this.date_created);
        this.date_edited = new Date(this.date_edited);
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
        this.historic_list = [];
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
        query.orderBy = "date_edited";
        query.query = "status != 0";

        let resp = await this.db.read.post("", query);
        this.historic_tasks = resp.data.records.map(item=> new Task(item));
        this.historic_tasks.forEach(item => {
            item.convertDates();
        });
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
        await this.loadHistoricTasks();
        this.reloadHistoricList("New");
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
        await this.loadHistoricTasks();
        this.reloadHistoricList("New");
    }

    displayHistoricTasks()
    {
        this.home = false;

        this.dropdown.hidden = false;

        this.button_new_task.hidden = true;

        this.content_element.innerHTML = "";

        console.log(this.historic_list);
        
        this.content_element.appendChild(this.historic_list[this.history_counter]);
    }

    displayActiveTasks()
    {
        this.home = false;

        if (this.active_tasks.length === 5)
        {
            this.button_new_task.hidden = true;
        }
        else
        {
            this.button_new_task.hidden = false;
        }

        this.dropdown.hidden = true;


        this.content_element.innerHTML = "";
        
        this.content_element.appendChild(this.active_list);
    }

    displayHistoricDetails(id)
    {
        this.content_element.innerHTML = "";

        this.button_back.hidden = false;

        this.dropdown.hidden = true;

        let target = this.historic_tasks.find(item => item.id === id);

        this.form_title.value = target.text;

        let string = `${target.status === 1 ? "Completed" : "Deleted" }\nLast edited on:\n${target.date_edited.toString()}\nCreated on:\n${target.date_created.toString()}`;

        this.form_body.value = string;

        this.content_element.appendChild(this.form);
    }

    instantiateHistoricTask(item, num)
    {
        let td = document.createElement("td");

        let task_text = document.createElement("input");
        task_text.value = `${num+1}. ${item.text}`;
        task_text.readOnly = true;
        task_text.style.display = "inline";

        td.appendChild(task_text);

        let holder = document.createElement("tr");
        holder.id = item.id;

        holder.addEventListener("dblclick", evt => {
            console.log(holder.id);
            this.displayHistoricDetails(holder.id);
        });

        let dummy1 = document.createElement("td");
        let dummy2 = document.createElement("td");

        holder.appendChild(dummy1);
        holder.appendChild(task_text);
        holder.appendChild(dummy2);

        return holder;
    }

    instantiateActiveTask(item)
    {
        // let li = document.createElement("li");

        let left_button = document.createElement("td");
        left_button.innerHTML = "Done";
        // left_button.style.display = "inline";

        left_button.addEventListener("click", evt => {
            if (evt.target.innerHTML === "Done")
            {
                console.log("Done!");
                let parent = evt.target.parentElement;
                this.completeTask(parent.id);
                this.active_list.removeChild(parent);

                if (this.button_new_task.hidden)
                {
                    this.button_new_task.hidden = false;
                }
            }
            else if (evt.target.innerHTML === "Save")
            {
                console.log("Save!");
                let parent = evt.target.parentElement;
                parent.children[0].innerHTML = "Done";
                parent.children[1].children[0].readOnly = true;
                parent.children[2].innerHTML = "Edit";

                this.editTask(parent.id, parent.children[1].children[0].value)
            }
        });
        let td = document.createElement("td");

        let task_text = document.createElement("input");
        task_text.value = item.text;
        task_text.readOnly = true;
        task_text.style.display = "inline";

        td.appendChild(task_text);
        
        let right_button = document.createElement("td");
        right_button.innerHTML = "Edit";
        // right_button.style.display = "inline";

        right_button.addEventListener("click", evt => {
            if (evt.target.innerHTML === "Edit")
            {
                let parent = evt.target.parentElement;
                parent.children[0].innerHTML = "Save";
                parent.children[1].children[0].readOnly = false;
                parent.children[2].innerHTML = "Delete";
            }
            else if (evt.target.innerHTML === "Delete")
            {
                let parent = evt.target.parentElement;
                // console.log("Delete!", evt.target.previousElementSibling.value);
                this.deleteTask(parent.id);
                this.active_list.removeChild(parent);

                if (this.button_new_task.hidden)
                {
                    this.button_new_task.hidden = false;
                }
            }
        });

        let holder = document.createElement("tr");
        holder.id = item.id;

        holder.appendChild(left_button);
        holder.appendChild(td);
        holder.appendChild(right_button);

        return holder;

        // li.appendChild(holder);

        // li.id = item.id;

        // return li;
    }

    displayStart()
    {
        this.home = true;

        this.initializeButtons();

        this.title_element.innerHTML = "Todo";

        this.content_element.innerHTML = "";

        this.initializeHome();

        this.content_element.appendChild(this.button_active);
        this.content_element.appendChild(this.button_history);

        this.initializeLists();

        this.initializeForms();
    }

    formMaker(title_label, body_label)
    {
        let form = document.createElement("form");
        form.classList.add("taskdetails");
        let label_title = document.createElement("label");
        label_title.innerHTML = title_label;
        label_title.classList.add("title");
        let form_title = document.createElement("input");
        form_title.readOnly = true;

        let label_body = document.createElement("label");
        label_body.innerHTML = body_label;
        label_body.classList.add("title");
        let form_body = document.createElement("textarea");
        form_body.readOnly = true;

        label_title.for = "title";
        form_title.name = "title";

        label_body.for = "body";
        form_body.name = "body";

        label_title.style.display = "block";
        label_body.style.display = "block";

        form.appendChild(label_title);
        form.appendChild(form_title);
        form.appendChild(label_body);
        form.appendChild(form_body);

        return [form, form_title, form_body];
    }

    initializeForms()
    {
        if (!this.form)
        {
            [this.form, this.form_title, this.form_body] = this.formMaker("Task Title", "Task Details");
        }
        
        // if (!this.com_form)
        // {
        //     [this.com_form, this.com_form_title, this.com_form_body] = this.formMaker("Task Title", "Task Details");
        // }

        // if (!this.del_form)
        // {
        //     [this.del_form, this.del_form_title, this.del_form_body] = this.formMaker("Task Title", "Task Details");
        // }
    }

    reloadHistoricList(filter)
    {
        let temp;

        if (filter === "Deleted") temp = this.historic_tasks.filter(item => item.status === 2);
        else if (filter === "Completed") temp = this.historic_tasks.filter(item => item.status === 1);
        else temp = this.historic_tasks;

        // console.log(temp);

        this.historic_list = [];

        let count = 0;
        this.history_counter = -1;
        for (let item of temp)
        {
            if (count % 5 === 0)
            {
                this.history_counter++;

                let holder = document.createElement("table");
                holder.classList.add("historylist");
                holder.id = this.history_counter;

                let th1 = document.createElement("th");

                if (count !== 0)
                {
                    let left_button = document.createElement("span");
                    left_button.innerHTML = "Previous";

                    th1.addEventListener("click", evt => {
                        this.history_counter--;
                        this.displayHistoricTasks();
                    });

                    th1.appendChild(left_button);
                }
                else
                {
                    th1.innerHTML = "        ";
                }


                // if (count === 0) left_button.style.display = "none";

                let th2 = document.createElement("th");

                let right_button = document.createElement("span");
                right_button.innerHTML = "Next";
        
                this.th2_listener = th2.addEventListener("click", evt => {
                    if (this.historic_list[this.history_counter+1])
                    {
                        this.history_counter++;
                        this.displayHistoricTasks();
                    }
                });

                th2.appendChild(right_button);

                let list = document.createElement("th");
                list.innerHTML = "Task History";
                // list.type = "1";

                let row = document.createElement("tr");

                row.appendChild(th1);
                row.appendChild(list);
                row.appendChild(th2);

                holder.appendChild(row);

                this.historic_list.push(holder);
            }
            this.historic_list[this.history_counter].appendChild(this.instantiateHistoricTask(item, count));
            count++;
        }

        // console.log(this.historic_list[this.history_counter]);

        this.historic_list[this.history_counter].children[0].children[2].innerHTML = "    ";
    }

    initializeLists()
    {
        if (!this.active_list)
        {
            let list = document.createElement("table");
            list.classList.add("active_tasks");
            // list.type = "1";
            this.active_list = list;

            let holder = document.createElement("tr");
            let h1 = document.createElement("th");
            let h2 = document.createElement("th");
            h2.innerHTML = "Active Tasks";
            let h3 = document.createElement("th");
            holder.appendChild(h1);
            holder.appendChild(h2);
            holder.appendChild(h3);

            this.active_list.appendChild(holder);

            for (let item of this.active_tasks)
            {
                this.active_list.appendChild(this.instantiateActiveTask(item));
            }
        }

        if (this.historic_list.length === 0)
        {
            // console.log("Testing");
            this.reloadHistoricList("New");
            // console.log("Ended");
        }

        this.history_counter = 0;
    }

    initializeHome()
    {
        if (!this.button_active)
        {
            let button_active = document.createElement("button");
            button_active.innerHTML = "Todo List";
            button_active.classList.add("showactive");
            button_active.addEventListener("click", evt =>{
                this.displayActiveTasks();
            });
            this.button_active = button_active;
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
                    let newest_li = this.active_list.appendChild(this.instantiateActiveTask(newest));
                    newest_li.children[2].dispatchEvent(new Event("click"));
                    newest_li.children[1].children[0].focus();

                    if (this.active_tasks.length === 5)
                    {
                        button_new_task.hidden = true;
                    }
                });
            });

            // <label for="dog-names">Choose a dog name:</label>
            // <select name="dog-names" id="dog-names">
            // <option value="rigatoni">Rigatoni</option>
            // <option value="dave">Dave</option>
            // <option value="pumpernickel">Pumpernickel</option>
            // <option value="reeses">Reeses</option>
            // </select>

            let dropdown = document.createElement("div");
            let label = document.createElement("label");
            label.setAttribute("for", "filter");
            label.innerHTML = "Filter By:";
            label.classList.add("title");
            let dropdown_options = document.createElement("select");
            dropdown_options.name = "filter";
            let option_all = document.createElement("option");
            option_all.value = "All";
            option_all.innerHTML = "All";
            let option_com = document.createElement("option");
            option_com.value = "Completed";
            option_com.innerHTML = "Completed";
            let option_del = document.createElement("option");
            option_del.value = "Deleted";
            option_del.innerHTML = "Deleted";

            dropdown_options.addEventListener("change", evt => {
                this.reloadHistoricList(evt.target.value);
                this.history_counter = 0;
                this.displayHistoricTasks();
            });

            dropdown_options.appendChild(option_all);
            dropdown_options.appendChild(option_del);
            dropdown_options.appendChild(option_com);

            dropdown.appendChild(label)
            dropdown.appendChild(dropdown_options)

            let button_back = document.createElement("button");
            button_back.innerHTML = "Back";
            button_back.classList.add("back");
            button_back.addEventListener("click", evt => {
                this.displayHistoricTasks();
                this.button_back.hidden = true;
            });

            this.button_new_task = button_new_task;
            this.button_new_task.hidden = true;
            this.dropdown = dropdown;
            this.dropdown.hidden = true;
            this.button_back = button_back;
            this.button_back.hidden = true;
    
            // this.parent_element.appendChild(title);
            this.buttons_element.appendChild(button_exit);
            this.buttons_element.appendChild(button_new_task);
            this.buttons_element.appendChild(dropdown);
            this.buttons_element.appendChild(button_back);
        }
        else
        {
            console.log("Buttons are good!");
            this.button_new_task.hidden = true;
            this.dropdown.hidden = true;
            this.button_back.hidden = true;
        }
    }
}

export default Todo;