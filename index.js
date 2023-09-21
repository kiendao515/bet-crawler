const express = require('express');
const app = express();
var cors = require('cors');
const { crawl , login} = require("./etopfun")
app.use(express.json());
app.use(express.urlencoded({extended:false}))
app.use(express.static('public'));

const corsOpts = {
    origin: '*',
    methods: [
        'GET',
        'POST',
        'PUT',
        'DELETE'
    ],

    allowedHeaders: [
        'Content-Type',
        'Authorization'
    ],
};

app.use(cors(corsOpts));
app.post('/crawl', async (req, res)=> {
    let rs = await login("mohinhtinhxxx","Kiendao2001@", req.body.url);
    return res.json({status:true, data:"/"+rs+".png"})
})
app.all('*',(req,res)=>{
    res.json({status:'fail',msg:'-.-Kiểm tra kĩ lại route api'})
})
app.listen(process.env.PORT || 5000,(req,res)=>{
   console.log("server chay o port 5000")
})