import dotenv from "dotenv";
import mongoose from "mongoose";
import { DB_NAME } from "./constants.js";
import connectDB from "./db/index.js";

dotenv.config({
  path: "./env",
});

connectDB()
  .then(() => {
    app.on("error", (error) => {
      console.log("ERROR:", error);
      throw error;
    });
    app.listen(process.env.PORT || 8000, () => {
      console.log(`Server is runnning at port: ${process.env.PORT}`);
    });
  })
  .catch((error) => {
    console.log("Mongo DB connection Failed:", error);
  });

/* 
// Approach-1:

import express from 'express'
const app = express()



;(async()=>{// this is called an ' IFFY '-> this will rrun immediately without any calling...(professional appraoch)
            //  always starts with a ';' as there are chances that previous line may or maynot have a ';'

            try{
                await mongoose.connect(`${process.env.MONGODB_URI}
                    /${DB_NAME}`);
                app.on("error",(error)=>{
                    console.log("ERROR:",error);
                    throw error;
                })    

                app.listen(process.env.PORT,()=>{
                    console.log(`App is listening on port ${process.env.PORT}`)
                })
                
            }
            catch(error){
               console.log("ERROR:", error)
               throw error 
            }
})() 
*/
