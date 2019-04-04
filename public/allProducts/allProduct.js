var response;
var table;
function myProductTable() {
  table = document.getElementById("table");
  while (table.firstChild) {
    table.removeChild(table.firstChild);
  }
  var xhr = new XMLHttpRequest();
  xhr.open('GET', "http://localhost:8083/getproducts/", true);
  xhr.send();
  xhr.onreadystatechange = processRequest;
  function processRequest(e) {
      if (xhr.readyState == 4 && xhr.status == 200) {
          response = JSON.parse(xhr.responseText);
          console.log(response);
          var headers = ["ProductId", "ProductName","Price","gstrate","Action"];
          //Create a HTML Table element.

          table.border = "1";
          //Add the header row.
          var row = table.insertRow(-1);
          for (var i = 0; i < 5; i++) {
           var headerCell = document.createElement("TH");
           headerCell.innerHTML = headers[i];
           row.appendChild(headerCell);
          }
          //Add the data rows.
          for (var i = 0; i < response.length; i++) {
           row = table.insertRow(-1);
           var pName = row.insertCell(-1);
           pName.innerHTML = response[i].pid;
           var pPrice = row.insertCell(-1);
           pPrice.innerHTML = response[i].pname;
           var gSlab = row.insertCell(-1);
           gSlab.innerHTML = response[i].price;
           var rate = row.insertCell(-1);
           rate.innerHTML = response[i].gstrate;
           var action = row.insertCell(-1);
           var btn = document.createElement("BUTTON");
           var t = document.createTextNode("edit");
            btn.appendChild(t);
            btn.setAttribute("onclick", "show("+i+")");

            var btn1 = document.createElement("BUTTON");
            var t1 = document.createTextNode("delete");
             btn1.appendChild(t1);
             btn1.setAttribute("onclick","del("+i+")");
          action.appendChild(btn);
          action.appendChild(btn1);
          }

      }


  }

  console.log("function called");

}

function show(i){
  console.log(table.rows[i+1]);
  var box = [];
  box[0] = document.createElement("input");
  box[1] = document.createElement("input");
  box[2] = document.createElement("input");
  box[0].type = "text"
  box[1].type = "text";
  box[2].type = "text";
  var btn = document.createElement("BUTTON");
  var t = document.createTextNode("submit");
  btn.appendChild(t);
  console.log(table.rows[i+1].childNodes[1]);
  for(var j = 1;j <= 4;j++){
    if(j == 4){
      btn.setAttribute("onclick", "edit("+i+")");
      table.rows[i+1].childNodes[j].removeChild(table.rows[i+1].childNodes[j].childNodes[0]);
      table.rows[i+1].childNodes[j].removeChild(table.rows[i+1].childNodes[j].childNodes[0]);
      table.rows[i+1].cells[j].appendChild(btn);
    }else{
      table.rows[i+1].childNodes[j].removeChild(table.rows[i+1].childNodes[j].childNodes[0]);
      table.rows[i+1].cells[j].appendChild(box[j-1]);
    }

  }
  // table.rows[i].cells[1].replaceChild(table.rows[i].childNodes[1].firstChild, input);
}

function edit(i){
  var name;
  var price;
  var gstrate;
  var pid = response[i].pid;
  name = table.rows[i+1].childNodes[1].childNodes[0].value;
  price = table.rows[i+1].childNodes[2].childNodes[0].value;
  gstrate = table.rows[i+1].childNodes[3].childNodes[0].value;
  var xhr = new XMLHttpRequest();
  xhr.open('POST',"http://localhost:8083/updateproduct/", true);
  xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
  xhr.onload = function () {
  // do something to response
   console.log(this.responseText);
  };
  var params = 'pid='+pid+'&name='+name+'&price='+price+'&gstrate='+gstrate;
   xhr.send(params);
   xhr.onreadystatechange = processRequest;
   function processRequest(e) {
       if (xhr.readyState == 4 && xhr.status == 200) {
           var r = xhr.responseText;
           console.log(r);
           myProductTable();
         }
       }
  }

  function del(i){
    var pid = response[i].pid;
    var xhr = new XMLHttpRequest();
    xhr.open('POST',"http://localhost:8083/deleteproduct/", true);
    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    xhr.onload = function () {
    // do something to response
     console.log(this.responseText);
    };
    var params = 'pid='+pid;
     xhr.send(params);
     xhr.onreadystatechange = processRequest;
     function processRequest(e) {
         if (xhr.readyState == 4 && xhr.status == 200) {
             var r = xhr.responseText;
             console.log(r);
             myProductTable();
           }
     } 
  }

myProductTable();
