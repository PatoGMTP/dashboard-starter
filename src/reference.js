import MyDB from './database.js';

class Note
{
    title;
    text;
    id;

    constructor (input)
    {
        if (Array.isArray(input))
        {
            this.title = input[0];
            this.text = input[1];
            this.id = 0;        // THIS MUST BE SET ELSEWHERE!!!!!!!!
        }
        else
        {
            Object.assign(this, input);
        }
    }
}

class Reference
{
    db;

    tablename = "reference";

    list;

    parent_element;
    title_element;
    buttons_element;
    content_element;

    constructor(parent)
    {
        this.db = MyDB.getStandardAPIs();

        this.list = [];

        this.parent_element = parent;
        this.title_element = this.parent_element.querySelector(".title")
        this.buttons_element = this.parent_element.querySelector(".buttons")
        this.content_element = this.parent_element.querySelector(".content")
    }

    makeNewNote = async(title, text) =>
    {
        let newNote = new Note([title, text]);

        let query = {};

        query.table = this.tablename;
        query.record = newNote;

        let resp = await this.db.create.post("",query);

        newNote.id = resp.data.id;

        this.list.push(newNote);

        this.reloadDatalist();
    }

    loadNotes = async() =>
    {
        let query = {};
        query.table = this.tablename;
        query.orderBy = "title";

        let resp = await this.db.read.post("", query);
        this.list = resp.data.records.map(item=> new Note(item));
    }

    editNote = async(id, title, text) =>
    {
        let target = this.list.find(item=> item.id === id);

        if (title !== "") target.title = title;
        if (text !== "") target.text = text;

        let query = {}
        query.table = this.tablename;
        query.record = target;

        let resp = await this.db.update.post("", query);

        this.reloadDatalist();
    }

    deleteNote = async(id) =>
    {
        let target = this.list.find(item=> item.id === id);

        let query = {}
        query.table = this.tablename;
        query.id = id;

        let resp = await this.db.delete.post("", query);
        
        console.log(resp);

        this.list = this.list.filter(item=> item !== target);

        this.reloadDatalist();
    }

    displayNote(note)
    {
        this.home = false;

        this.content_element.innerHTML = "";

        this.form.id = note.id;

        this.form_title.readOnly = true;
        this.form_body.readOnly = true;
        this.form_delete.hidden = true;
        
        this.form_submit.value = "Edit";
        this.form_title.value = note.title;
        this.form_body.value = note.text;
        
        this.content_element.appendChild(this.form);
    }

    displayFormForNew()
    {
        this.home = false;

        this.content_element.innerHTML = "";

        this.form.reset();
        this.form_title.readOnly = false;
        this.form_body.readOnly = false;
        this.form_submit.hidden = false;
        this.form_submit.value = "Create!";
        this.form_delete.hidden = true;

        this.content_element.appendChild(this.form);
    }

    displayStart()
    {
        this.home = true;

        this.initializeButtons();

        this.title_element.innerHTML = "Reference";

        this.content_element.innerHTML = "";

        this.initializeHome();

        this.content_element.appendChild(this.search_bar);
        this.content_element.appendChild(this.button_add);

        this.initializeForm();
    }

    initializeHome()
    {
        if (!this.search_bar)
        {
            let search_bar = document.createElement("div");

            let search_field = document.createElement("input");
            search_field.placeholder = "Type here!"
            search_field.setAttribute("list", "notes");

            this.search_field = search_field;

            this.reloadDatalist();

            let button_search = document.createElement("button");
            button_search.innerHTML = "Go";
            button_search.classList.add("shownote");
            button_search.addEventListener("click", evt =>{
                let target = this.list.find(item => item.title === this.search_field.value);
                if (target)
                {
                    this.displayNote(target);
                }
                else
                {
                    console.log("Not in list!");
                }
                this.search_field.value = "";
            });

            this.button_search = button_search;

            search_bar.appendChild(this.search_field);
            search_bar.appendChild(this.datalist);
            search_bar.appendChild(this.button_search);

            this.search_bar = search_bar;
        }

        if (!this.button_add)
        {
            let button_add = document.createElement("button");
            button_add.innerHTML = "Add New Note";
            button_add.classList.add("newnote");
            button_add.addEventListener("click", evt =>{
                this.displayFormForNew();
            });
            this.button_add = button_add;
        }
    }

    initializeForm()
    {
        if (!this.form)
        {
            let form = document.createElement("form");
            form.classList.add("noteform");
            let label_title = document.createElement("label")
            label_title.innerHTML = "Note Title:";
            label_title.classList.add("title");
            let form_title = document.createElement("input");
            form_title.readOnly = true;

            let label_body = document.createElement("label")
            label_body.innerHTML = "Note Text:"
            label_body.classList.add("title");
            let form_body = document.createElement("textarea");
            form_body.readOnly = true;

            label_title.for = "title";
            form_title.name = "title";
            form_title.required = true;

            label_body.for = "body";
            form_body.name = "body";
            form_body.required = true;

            label_title.style.display = "block";
            label_body.style.display = "block";

            form.appendChild(label_title);
            form.appendChild(form_title);
            form.appendChild(label_body);
            form.appendChild(form_body);

            let form_submit = document.createElement("input");
            form_submit.type = "submit";
            form_submit.value = "Create!";

            let form_delete = document.createElement("input");
            form_delete.type = "submit";
            form_delete.value = "Delete";
            form_delete.hidden = true;

            form_delete.addEventListener("click", evt =>{
                evt.preventDefault();
                this.validateFormInput("delete");
                evt.stopPropagation();
            });

            form.appendChild(form_submit);
            form.appendChild(form_delete);

            this.form = form;
            this.form_title = form_title;
            this.form_body = form_body;
            this.form_submit = form_submit;
            this.form_delete = form_delete;

            this.form.addEventListener("submit", evt =>{
                evt.preventDefault();
                console.log(evt.target);

                switch (this.form_submit.value)
                {
                    case "Edit":
                        this.form_title.readOnly = false;
                        this.form_body.readOnly = false;
                        this.form_submit.value = "Save";
                        this.form_delete.hidden = false;
                        break;
                    case "Create!":
                        this.validateFormInput("new");
                        break;
                    case "Save":
                        this.validateFormInput("edit");
                        break;
                }
            });
        }
    }

    validateFormInput(action)
    {
        if (action === "new")
        {
            let target = this.list.find(item=> item.title === this.form_title.value);

            if (target)
            {
                alert("That title is already taken!");
            }
            else
            {
                this.makeNewNote(this.form_title.value, this.form_body.value);
                this.content_element.innerHTML = "Success!";
                this.form.reset();
                setTimeout(() => {this.displayStart();}, 1000);
            }
        }
        else if (action === "edit")
        {
            let target = this.list.find(item=> item.title === this.form_title.value && item.id !== this.form.id);

            if (target)
            {
                alert("That title is already taken!");
            }
            else
            {
                this.editNote(this.form.id, this.form_title.value, this.form_body.value);
                this.content_element.innerHTML = '<span class="success-msg title">Success!</span>';
                this.form.reset();
                setTimeout(() => {this.displayStart();}, 1000);
            }
        }
        else if (action === "delete")
        {
            this.deleteNote(this.form.id);
            this.content_element.innerHTML = '<span class="success-msg title">Success!</span>';
            this.form.reset();
            setTimeout(() => {this.displayStart();}, 1000);
        }
        else
        {
            console.log("called validateFormInput without action!");
        }
    }

    reloadDatalist()
    {
        let datalist = document.createElement("datalist");
        datalist.id = "notes";
        this.list.forEach(item => {
            let option = document.createElement("option");
            option.value = item.title;
            datalist.appendChild(option);
        });
        this.datalist = datalist;
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

export default Reference;