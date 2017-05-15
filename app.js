//requires modules 

const express = require("express");
const app = express();
const bodyparser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const Bing = require("node-bing-api")({accKey:' b420e0cc437f4d88aa9dcaa8039e76db'});
const searchTerm = require('./models/searchTerm');
app.use(bodyparser.json());
app.use(cors());


// connect to database
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost/searchTerms');


app.get('/', function(req, res) {

	res.writeHead(200, {'Content-Type': 'text/plain'});
	res.end(' To get images for your search in JSON format follow these steps . 1)After (https://image-abstraction-knrt.c9users.io)write /api/imagesearch/(anything you want to search) . 2) To see latest searches write after (https://image-abstraction-knrt.c9users.io) /api/recentsearches/ . ');
});

app.get('/api/recentsearches/',(req , res ,next)=>{
    searchTerm.find({} , (err,data)=>{
        res.json(data);
    });
});

// get call for required parameters

app.get('/api/imagesearch/:searchVal*',(req , res ,next)=>{
   
   var searchVal = req.params.searchVal;
   var offset = req.query.offset;
   
   
    var data = new searchTerm(
      {
      searchVal,
      searchDate: new Date()
      }
    );
    
    data.save(err=>{
      if(err){
        return res.send("Error in saving to database");
      }
      
  
    });
    
   
    var searchOffset;
    
    if(offset){
        if(offset==1){
            offset=0;
            searchOffset=1;
        }
        else if(offset>1){
            searchOffset = offset + 1;
        }
    }
   
   
    
   Bing.images(searchVal,{
       top:(10 * searchOffset),
       skip:(10 * offset)
       
   },function(error,rez,body){
      
      var bingData = [] ;
      for(var i=0;i<10;i++){
          bingData.push({
              url:body.value[i].webSearchUrl,
              snippet:body.value[i].name,
              thumbnail:body.value[i].thumbnailUrl,
              context:body.value[i].hostPageDisplayUrl
          })
      }
     res.json(bingData)  ;
      
   });
   
   
/* return  res.json({
       searchVal,
       offset
   });
  */  
});  
app.listen(process.env.PORT || 27017,()=>{  //call back funtion as per (ES6) , (ES5) format was function(){}
  console.log("everyting is working!!");
});