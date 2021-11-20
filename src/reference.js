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

    constructor()
    {
        this.db = MyDB.getStandardAPIs();

        this.list = [];
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
    }

    deleteNote = async(id) =>
    {
        let target = this.list.find(item=> item.id === id);

        let query = {}
        query.table = this.tablename;
        query.id = target.id;

        let resp = await this.db.delete.post("", query);

        this.list = this.list.filter(item=> item !== target);
    }
}

export default Reference;