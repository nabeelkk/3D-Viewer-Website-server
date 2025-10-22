import mongoose from 'mongoose'
import gridfsStream from 'gridfs-stream'

export const connectDB =async ()=>{
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI,{
            useNewUrlParser : true,
            useUnifiedTopology : true
        })
        console.log(`mongoDB connected:`)

        const db = mongoose.connection.db;
        const gfs = gridfsStream(db,mongoose.mongo)
        gfs.collection('models')
        return db
    } catch (error) {
        console.error('Database connection error:', error);
        process.exit(1);
    }
}   