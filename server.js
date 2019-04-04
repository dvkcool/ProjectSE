var express = require('express');
var app = express();
var request = require('request');
var bodyParser = require('body-parser');
require('request-debug')(request);
var fetch =  require('fetch');
var mysql = require('mysql');
var config = require("./config.json");
// const JSONToCSV = require("json2csv").parse;
const FileSystem = require("fs");
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({
    extended: true
  }));

  // CORS removal
  app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.setHeader("Access-Control-Allow-Headers", "Authorization, Cache-Control, Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers");
    next();
  });

  // Static HTML server
  app.use(express.static(__dirname + '/public'));

  // DB Connection
  var pool = mysql.createPool(config);

  //  An endpoint to test from mobile application
  app.get('/test', (req, res) =>{
    var done = {
      "sucess": 1
    }
    res.send(done);
  });

  //   An endpoint to get items of a bill based on a bill id:
  app.get('/bill/:billId', (req,res)=>{
    pool.query('SELECT * FROM Bill where billId = ?',[req.params.billId], (error,results,fields)=>{
      if (error) { console.log(error)};
       console.log('The solution is: ', results);
      res.send(results);
    })
  });

  // To check if the user is registered
  app.get('/isRegistered', (req,res)=>{
    pool.query('SELECT * from details;', function (error, results, fields) {
      if (error) { console.log(error)};
      console.log('The solution is: ', results);
      var output;
      if(results.length<1){
        output = {
          "isRegistered": 0
        }
      }
      else{
        output = {
          "isRegistered": 1
        }
      }
      res.send(output);
    });
  });

  // To register the details of user
  app.post('/Register', (req,res)=>{
    console.log(req.body);
    console.log("Hi");
    pool.query('delete from details',(error,results,fields)=>{
      if (error) { console.log(error)};
       console.log("row deleted");
    });
    pool.query('Insert into details values(?, ?)',[req.body.name, req.body.gst], (error,results,fields)=>{
      if (error) { console.log(error)};
      var output={
        success: 1
      }
      res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
      res.setHeader("Access-Control-Allow-Headers", "Authorization, Cache-Control, Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers");
      res.send(output);
    })
  });

  //VAIBHAV: An endpoint to get the current order
  app.get('/getCurrentOrder/', (req,res)=>{
    pool.query('SELECT * FROM CurrentOrder', (err,rows,fields)=>{
      if(!err){
         res.send(rows);
      }
      else {
        console.log(err);
      }
    })
  });


  // An endpoint to add a product in current order
  //deleting the 1 from the Current order values
  //rows not defined errro so changing your result to row
  app.post('/productscan', (req,res)=>{
    pool.query('Insert into `CurrentOrder` values(?, ?, ?, ?, ? )',[req.body.pId, req.body.pName, req.body.price, req.body.gst, req.body.billId], (error,results,fields)=>{
      if (error){
        console.log(error);
      }
      res.send("added succesfully");
    })
  });

  //VAIBHAV: an endpoint to get all productscan
  app.get('/getproducts/', (req,res)=>{

    console.log("req body: ", req.body);
    pool.query("SELECT * FROM products",[req.body.id], (err,rows,fields)=>{
      if(!err){
         console.log(rows);
         res.send(rows);
      }
      else {
        console.log(err);
      }
    })
  });

  //VAIBHAV: updating the product based on productId
  app.post('/updateproduct',(req,res)=>{
    pool.query('UPDATE products SET pname = ?, price = ?, gstrate = ? WHERE pid = ?',[req.body.name, req.body.price, req.body.gstrate, req.body.pid], (error,rows,fields)=>{
      if(error) {
        console.log(error);
      }else{
        res.send("updated");
        console.log("done dana done");
      }

    })
  })

  // To Discard current ORDER
  app.get('/DiscardOrder', (req,res)=>{
    pool.query('Delete FROM CurrentOrder', (error,results,fields)=>{
      if (error) { console.log(error)};
       console.log("Deleted");
      res.send("Done");
    })
  });

  // Generate CSV report
  app.get('/GenerateReport', (req,res)=>{
    pool.query('Select billId as `Innovice Number`,SaleDate as `Invoice date`, billAmount as `Invoice Value`,  ? as `Place Of Supply`, gst as `Rate`, ? as `Applicable % of Tax Rate`, taxAmount as `Taxable Value`, 0 as `Cess Amount`, ? as `E-Commerce GSTIN`, ? as `Sale from Bonded WH` from bill', ["22-Chhatisgarh", " ", "GST1234", "N"], (error,results,fields)=>{
      if (error) { console.log(error)};
      var csv = JSONToCSV(results, { fields: ["Innovice Number", "Invoice date", "Invoice Value", "Place Of Supply", "Rate", "Applicable % of Tax Rate", "Taxable Value", "Cess Amount", "E-Commerce GSTIN", "Sale from Bonded WH"]});
    FileSystem.writeFileSync("./destination.csv", csv);
       console.log(results);
      res.send("Done");
    })
  });

  // An endpoint to place the ORDER
  app.post('/PlaceOrder', (req,res)=>{
    pool.query('Insert into OrderHistory select * from CurrentOrder', (error,results,fields)=>{
      if (error) { console.log(error)};
    });
    pool.query('Insert into bill values(?, ?, ?)', [req.body.billId, req.body.TotalAmount, req.body.TotalGST], (error,results,fields)=>{
      if (error) { console.log(error)};
    });
    pool.query('delete from CurrentOrder', (error,results,fields)=>{
      if (error) { console.log(error)};
      console.log("Done");
      res.send("Done");
    })
  });

  // query for getting product with required productid
 app.post('/product', (req,res)=>{

   console.log("req body: ", req.body);
   pool.query("SELECT * FROM product WHERE pid=?",[req.body.id], (err,rows,fields)=>{
     if(!err){
        console.log(rows);
        res.send(rows);
     }
     else {
       console.log(err);
     }
   })
 });

 app.post('/addProduct', (req, res)=>{
   console.log(req.body);
   pool.query("Insert into product(pname, gst, price) values(?, ?, ?)",[req.body.name, req.body.gst, req.body.price], (err,rows,fields)=>{
     if(!err){
       pool.query("select pId from product order by pId DESC limit 1", (err,ros,felds)=>{
         if(!err){
           var hi={
             id: ros[0].pId
           }
           console.log(hi);
           hi = JSON.stringify(hi);
           console.log(hi);
           res.send(hi);
         }
         else {
           console.log(err);
         }
       })
     }
     else {
       console.log(err);
     }
   })
 });

  // Vaibhav: query for deleting a product from DATABASE
   app.post('/deleteproduct/', (req,res)=>{

     pool.query("DELETE FROM products WHERE pid=?",[req.body.pid],(err,rows,fields)=>{
       if(!err){
         console.log("product deleted");
         res.send("deleted succesfully");
       }else{
         console.log(err);
       }
     })
   });

 //Vaibhav: query  for entering bill PDetails
 app.post('/addbill/', (req,res)=>{
     console.log("request", req.body);

     var billno = req.body.billno;
     var bdate = req.body.bdate;
     var billamt = req.body.billamt;
     var gst = req.body.gst;

     pool.query('INSERT INTO `bills` VALUES (?,?,?,?)',[parseInt(billno), bdate, parseInt(billamt), parseFloat(gst)], (err,rows,fields)=>{
       if(!err){
          res.send("added succesfully");
       }
       else {
         console.log(err);
       }
     })
   });


  //Vaibhav: -getting the latest bill id
   app.get('/getlatest/', (req,res)=>{
     pool.query('SELECT billno FROM bills ORDER BY billno desc LIMIT 1', (err,rows,fields)=>{
       if(!err){
          res.send(rows);
       }
       else {
         console.log(err);
       }
     })
   });

  // Starting the server on 8083 port
  app.listen(8083, function () {
    console.log('App listening on port 8083!');
  });


/*
// Vaibhav:

var mysqlConnection = mysql.createConnection({
    host:'localhost',
    user: 'root',
    password:process.env.passoword,
    database:"gst"
  });

mysqlConnection.connect((err)=> {
  if(!err)
   console.log("DB connection succeded");
  else {
    console.log("DB connection failed \n error"+JSON.stringify(err, undefined, 2));
  }
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, ()=>console.log('express server is ready at port no: 3000'));

app.get('/', (req,res)=>{
       res.send("hi this is port 3000");
});

 query adding a product in DATABASE
app.post('/addproduct/', (req,res)=>{
  console.log("request", req.body);
  var pid = req.body.pid;
  var pname = req.body.pname;
  var price = req.body.price;
  var gstrate = req.body.gstrate;

  mysqlConnection.query('INSERT INTO `products` VALUES (?,?,?,?)',[pid.toString(), pname.toString(), parseInt(price), parseFloat(gstrate)], (err,rows,fields)=>{
    if(!err){
       res.send("added succesfully");
    }
    else {
      console.log(err);
    }
  })
});

 query for getting product with required productid
app.get('/product/', (req,res)=>{

  console.log("req body: ", req.body);
  mysqlConnection.query("SELECT * FROM products WHERE pid=?",[req.body.id], (err,rows,fields)=>{
    if(!err){
       console.log(rows);
       res.send(rows);
    }
    else {
      console.log(err);
    }
  })
});

 query for deleting a product from DATABASE
app.get('/deletepro/', (req,res)=>{
  var pro = req.body.name;
  mysqlConnection.query("DELETE FROM products WHERE pname=?",[pro],(err,rows,fields)=>{
    if(!err){
      console.log("product deleted");
      res.send("deleted succesfully");
    }else{
      console.log(err);
    }
  })
})

 query  for entering bill PDetails
app.post('/addbill/', (req,res)=>{
  console.log("request", req.body);

  var billno = req.body.billno;
  var bdate = req.body.bdate;
  var billamt = req.body.billamt;
  var gst = req.body.gst;

  mysqlConnection.query('INSERT INTO `bills` VALUES (?,?,?,?)',[parseInt(billno), bdate, parseInt(billamt), parseFloat(gst)], (err,rows,fields)=>{
    if(!err){
       res.send("added succesfully");
    }
    else {
      console.log(err);
    }
  })
});


 //getting the latest bill id
app.get('/getlatest/', (req,res)=>{
  mysqlConnection.query('SELECT * FROM bills ORDER BY billno LIMIT 1', (err,rows,fields)=>{
    if(!err){
       res.send(rows);
    }
    else {
      console.log(err);
    }
  })
})
*/
