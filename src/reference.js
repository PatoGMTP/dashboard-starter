import MyDB from './database.js';

class Reference
{
    db;

    constructor()
    {
        this.db = MyDB.getStandardAPIs();
    }
}

export default Reference;