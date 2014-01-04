

var rows = new Array();		
var temprows = new Array();
var oldrows = new Array();
var filterkeys = new Array();		
var sortOn=-1;
var sortOrder=0; //0 - ascending , 1 - descending
var headerstored=false;
var headerrendered=false;
var tableheader="";
$(document).ready(function() {

	function poll() {
		$.ajax({
          url: targetPage,
          type: "post",
          dataType: "json",
          success: function (response) {        
              	while(temprows.length >0)
              		temprows.pop();
              	
              	var temp ="";	
              	$.each(response,function(i,item) {
               		$.each(item,function(q,r) {
						temp = temp+r+";";
						if(!headerstored)
						{
							tableheader = tableheader + q + ";";
						}

					});
					headerstored = true;
					temprows.push(temp);	    					
					temp="";
				});	
				if(!headerrendered) 
				{
					var tableh = tableheader.split(";");
					var headerstring="";
					headerstring=headerstring+'<table border"1"><caption>Victim Information</caption><thead><tr style="background-color: #91A3A3">';
					for(x=0;x<tableh.length-1;x++)
					{
						headerstring=headerstring+"<th id='"+x+"' onclick='doSort('"+x+"')>"+tableh[x]+"</th>";
					}
					headerstring=headerstring+'</thead><tbody id="tableContent"><tr><td colspan=16><p align="center">Loading Data...</h3></td></tr></tbody></table>';
					$("#Content").append(headerstring);
					headerrendered=true;
				}				
              	checkAndPerformUpdate();
           }
    	});	







		$("th").click(function(event) 
		{		
	    	if(sortOn === -1) 
	    	{ 
	    		sortOn = event.target.id;
	    		$("th").find("img").remove();
	        	$("#"+sortOn).append("<img src='sort_up.gif'/>");
	        	sort();
	        	
	    	}
	    	if(sortOn == event.target.id)
	    	{
	    		if(sortOrder==0)
	        	{
	        		sortOrder=1;
	        		$("th").find("img").remove();
	        		$("#"+sortOn).append("<img src='sort_up.png'/>");
	        		sort();
	        		//console.log("reverse sort : " + rows);
	        		renderTable();
	        	}	            		
	        	else
	        	{
	        		sortOrder=0;
	        		$("th").find("img").remove();
	        		$("#"+sortOn).append("<img src='sort_down.png'/>");
	        		sort();
	        		rows.reverse();
	        		//console.log("reverse sort : " + rows);
	        		renderTable();
	        	}	
	    	}
	    	else
	    	{
	    		sortOn = event.target.id;
	    		$("th").find("img").remove();
	        	$("#"+sortOn).append("<img src='sort_up.png'/>");
	        	sort();
	        	
	    	}
	    	//console.log("rows after sort:"+rows);
    	});
	}

	

	


	setInterval(function(){ poll(); }, pollrate);

    $( "#filterbox" ).autocomplete({
			source: filterkeys
	});

    
	$("#filterbox").keypress(function(event) {
		/* Act on the event */
		if(event.keyCode == 13) {
			var filterParams = $(this).val().split(":");
			filter(filterParams[0],filterParams[1]);
		}				
	});

	$("#btPrint").click(function() {
	/* Act on the event */
	w=window.open();
	if(!w)
		alert("allow pop-ups please, print function opens in new pop-up window.");
	else
	{
		w.document.write($('#Content').html());
		w.print();
		w.close();	
	}
	});
});

function performUpdate()
{
	while(rows.length > 0)
		rows.pop();
	while(oldrows.length > 0)
		oldrows.pop();
	for(p=0;p<temprows.length;p++)
	{
		rows.push(temprows[p]);
		oldrows.push(temprows[p]);
	}
	while(filterkeys.length > 0)
		filterkeys.pop();
	generateFilters();
	if($("#filterbox").val().length > 0)
	{
		var filterParams = $("#filterbox").val().split(":");
		filter(filterParams[0],filterParams[1]);
	}
	if(sortOn != -1)
	{
		if(sortOrder == 0)
		{
			sort();		
        	rows.reverse();
		}
		else
		{
			sort();
		}
	}			
	renderTable();
}

function checkAndPerformUpdate()
{
	var maxrows;
	var dataUpdated = false;
	if(temprows.length != oldrows.length)
	{
		performUpdate();
	}
	else
	{
		for(p=0;p<temprows.length;p++)
		{
			var temp1 = temprows[p].split(";");
			var temp2 = oldrows[p].split(";");
			for(q=0;q<temp1.length;q++)
			{
				if(temp1[q] != temp2[q])
				{
					dataUpdated = true;
					break;
				}
			}
			if(dataUpdated)
				break;
		}
		if(dataUpdated)
		{
			//console.log("new data");
			performUpdate();
		}
		else
		{
			//console.log("no new data");
		}
	}
}

function filter(key, value)
{
	var u=0;
	var resetflag = false;
	if(key === "status")
	{
		while(rows.length > 0)
			rows.pop();
		for(u=0;u<temprows.length;u++)
			rows.push(temprows[u]);
		u=0;
		while(u < rows.length)
		{
			var temp = rows[u].split(";")[13];
			if(temp != value)
			{
				rows.splice(u,1);
				resetflag = true;
			}
			if(resetflag == true) {
				u=0;
				resetflag = false;
			}
			else {
				u++;	
			}
		}
		renderTable();					
	}
	if(key === "location")
	{
		while(rows.length > 0)
			rows.pop();
		for(u=0;u<temprows.length;u++)
			rows.push(temprows[u]);
		u=0;
		while(u < rows.length)
		{
			var temp = rows[u].split(";")[4].split(" ")[0];
			if(temp != value)
			{
				rows.splice(u,1);
				resetflag = true;
			}
			if(resetflag == true) {
				u=0;
				resetflag = false;
			}
			else {
				u++;	
			}
		}
		renderTable();				
	}
	if(key === "category")
	{
		while(rows.length > 0)
			rows.pop();
		for(u=0;u<temprows.length;u++)
			rows.push(temprows[u]);
		u=0;
		while(u < rows.length)
		{
			var temp = rows[u].split(";")[12];
			if(temp != value)
			{
				rows.splice(u,1);
				resetflag = true;
			}
			if(resetflag == true) {
				u=0;
				resetflag = false;
			}
			else {
				u++;	
			}
			
		}
		renderTable();				
	}
	if(key === "")
	{
		u=0;
		while(rows.length > 0)
			rows.pop();
		for(u=0;u<temprows.length;u++)
			rows.push(temprows[u]);
		renderTable();
	}
}

function sort()
{
	var key= new Array();
	for(i=0;i<rows.length;i++)
		key.push(rows[i].split(";")[sortOn]);
	var origkey = new Array();
	for(i=0;i<key.length;i++)
		origkey.push(key[i]);
	if(/^(\d*)$/.test(key[0])) {
		//console.log("num");
		key.sort();
		//console.log(key);
	}	
	else if(/^[a-zA-Z() ]+$/.test(key[0])) {
		//console.log("alpha");
		key.sort();
		//console.log(key);
	}
	else {
		key.sort(function(a, b) {
			  var regex = /(^[a-zA-Z]*)(\d*)$/;
			  matchA = regex.exec(a);
			  matchB = regex.exec(b); 

			  if(matchA[1] === matchB[1]) {
			    return matchA[2] > matchB[2];
			  }
			  return matchA[1] > matchB[1];
		});
		//console.log("alpha num");
		//console.log(key);
	}
	var oldrows = new Array();
	for(i=0;i<rows.length;i++)
		oldrows.push(rows[i]);
	while(rows.length > 0) 
		rows.pop();
	for(i=0;i<origkey.length;i++) {
		var k = lsearch(key[i],origkey);
		 rows.push(oldrows[k]);				
		 origkey.splice(k,1,"");
	}
	renderTable();
}

function lsearch(key,originalList)
{
	for(j=0;j<originalList.length;j++){
		if(key===originalList[j]) 			
			return j;
		
	}	
}

function renderTable()
{
	var tbl="";
	var alt=0;
	$("#tableContent").empty();
	for(i=0;i<rows.length;i++)
    {	if(alt++ % 2 == 0)
    	{
    		tbl = tbl + "<tr style='background-color:#91A9ED'>";	
    	}
    	else
    		tbl = tbl + "<tr style='background-color:#A3ED91'>"
    	var rowsA = rows[i].split(";");
    	for(j=0;j<rowsA.length-1;j++)
    	{
    		if(rowsA[j] === "Immediate")
    			tbl = tbl + '<td style="color:red">'+rowsA[j]+'</td>';
			else if(rowsA[j] === "Delayed")
				tbl = tbl + '<td style="color:yellow">'+rowsA[j]+'</td>';
			else
				tbl = tbl + '<td>'+rowsA[j]+'</td>';
    		
    	}
    	tbl = tbl + '</tr>';            	

        }            
    $("#tableContent").append(tbl);		    
    
}

function generateFilters()
{
	var key3 = new Array();
	var key9 = new Array();
	var key14 = new Array();
	var key3u = new Array();
	var key9u = new Array();
	var key14u = new Array();
	for(c=0;c<rows.length;c++)
	{
		key3[c] = rows[c].split(";")[4].split(" ")[0];
		key9[c] = rows[c].split(";")[12];
		key14[c] = rows[c].split(";")[13];
	}
	$.each(key3, function(i, el){
		if($.inArray(el, key3u) === -1) key3u.push(el);
	});
	$.each(key9, function(i, el){
		if($.inArray(el, key9u) === -1) key9u.push(el);
	});
	$.each(key14, function(i, el){
		if($.inArray(el, key14u) === -1) key14u.push(el);
	});
	$.each(key3u, function(i, el) {
		filterkeys.push("location:"+el);
	});
	$.each(key9u, function(i, el) {
		filterkeys.push("category:"+el);
	});
	$.each(key14u, function(i, el) {
		filterkeys.push("status:"+el);
	});
}