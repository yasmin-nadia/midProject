const mongoose=require("mongoose");
const databaseConnection= async(callback)=>{
    try{
        if(process.env.DATABASE_URL){
            const client=await mongoose.connect(process.env.DATABASE_URL);
            if (client){
                console.log("Connected successfully")
                callback();
            }
            else{
                console.log("Not connected")
            }
        }
    }
    catch(error){
        console.log(error);
    }
}
module.exports=databaseConnection;