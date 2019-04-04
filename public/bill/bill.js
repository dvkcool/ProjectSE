var doneupto = 0;
var setheader = 0;
var response;

function getlatestbillid(){
  var xhr = new XMLHttpRequest();
  xhr.open('GET', "http://localhost:8083/getlatest/", true);
  xhr.send();
  xhr.onreadystatechange = processRequest;
  var id;
  function processRequest(e) {
      if (xhr.readyState == 4 && xhr.status == 200) {
           id = JSON.parse(xhr.responseText);
          console.log(id);
          var ele = document.getElementById("bid");
          ele.innerHTML = "Bill id: " + id[0].billno;
        }
      }
}

getlatestbillid();

function myTimer() {

var xhr = new XMLHttpRequest();
xhr.open('GET', "http://localhost:8083/getCurrentOrder/", true);
xhr.send();
xhr.onreadystatechange = processRequest;
function processRequest(e) {
    if (xhr.readyState == 4 && xhr.status == 200) {
         response = JSON.parse(xhr.responseText);
        console.log(response);
var headers = ["ProductId", "ProductName","Price","gst(%)","quantity","gst","total"];
//Create a HTML Table element.
var table = document.getElementById("table");
//Add the header row.
var row = table.insertRow(-1);
for (var i = 0; i < 7, (setheader == 0); i++) {
   var headerCell = document.createElement("TH");
   headerCell.innerHTML = headers[i];
   row.appendChild(headerCell);
   if(i == 6)
   setheader = 1;
}

//Add the data rows.

for (var i = doneupto; i < response.length; i++) {
   row = table.insertRow(-1);
   var pName = row.insertCell(-1);
   pName.innerHTML = response[i].pId;
   var pPrice = row.insertCell(-1);
   pPrice.innerHTML = response[i].pName;
   var gSlab = row.insertCell(-1);
   gSlab.innerHTML = response[i].price;
   var rate = row.insertCell(-1);
   rate.innerHTML = response[i].gst;
   var qnt = row.insertCell(-1);
   var input = document.createElement("input");
   input.type = "text";
   input.value = 1;
   input.setAttribute("style", "width:20"+"px");
   qnt.appendChild(input);
   var gst = row.insertCell(-1);
   gst.innerHTML = "";
   var ttl = row.insertCell(-1);
   ttl.innerHTML = "";
}
    doneupto = response.length;
    console.log("function called");
}
}
}
myTimer();
setInterval(myTimer, 5000);
function discard(){
  console.log("done: ", doneupto);
  var xhr = new XMLHttpRequest();
  xhr.open('GET', "http://localhost:8083/DiscardOrder", true);
  xhr.send();
  xhr.onreadystatechange = processRequest;
  function processRequest(e) {
      if (xhr.readyState == 4 && xhr.status == 200) {
           response = xhr.responseText;
          console.log(response);
          table = document.getElementById("table");
          var rowCount = table.rows.length;
          for (var i = rowCount - 1; i > 0; i--) {
            table.deleteRow(i);
        }
      }
    }
}

function calc(){
  var tot=0;
  var table = document.getElementById("table");
  for(var i=0;i < response.length;i++){
    console.log(i);
    var a = table.rows[i+1].childNodes[2].innerHTML;
    var b = table.rows[i+1].childNodes[4].childNodes[0].value;
    var c = table.rows[i+1].childNodes[3].innerHTML;
    table.rows[i+1].childNodes[6].innerHTML = a*b;
    tot += a*b;
    table.rows[i+1].childNodes[5].innerHTML = (a*b)*c/100;
    tot += (a*b)*c/100;
  }
  var row = table.insertRow(response.length+1);
  var pName = row.insertCell(-1);
  pName.innerHTML = "TOTAL: "+tot.toFixed(2);

}

function finalize(){
  var xhr = new XMLHttpRequest();
  xhr.open('GET', "http://localhost:8083/DiscardOrder", true);
  xhr.send();
}
