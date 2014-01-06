var rows = new Array();
var temprows = new Array();
var oldrows = new Array();
var filterkeys = new Array();
var sortOn = -1;
var sortOrder = 0; //0 - ascending , 1 - descending
var headerstored = false;
var headerrendered = false;
var tableheader = "";
var dt_tableHeaderColSpan = -1;
var dt_targetPage = "datafile.json";
var dt_pollrate = 5000;
var dt_tableCaption = "";
var dt_tableHeaderColor = "";
var dt_sortUpImageSource = "";
var dt_sortDownImageSource = "";
var dt_tableRowColor1 = "";
var dt_tableRowColor2 = "";



$(document).ready(function() {
    function poll() {
        $.ajax({
            url: dt_targetPage,
            type: "post",
            dataType: "json",
            success: function(response) {
                while (temprows.length > 0)
                    temprows.pop();

                var temp = "";
                $.each(response, function(i, item) {
                    $.each(item, function(q, r) {
                        temp = temp + r + ";";
                        if (!headerstored) {
                            tableheader = tableheader + q + ";";
                        }
                    });
                    headerstored = true;
                    temprows.push(temp);
                    temp = "";
                });
                renderTableHeader();
                checkAndPerformUpdate();
            }
        });

        //$("th").click(function(event));
    }

    setInterval(function() {
        poll();
    }, dt_pollrate);

    $("#filterbox").autocomplete({
        source: filterkeys
    });
    $("#filterbox").keypress(function(event) {
        /* Act on the event */
        if (event.keyCode == 13) {
            var filterParams = $(this).val().split(":");
            filter(filterParams[0], filterParams[1]);
        }
    });
    $("#btPrint").click(function() {
        /* Act on the event */
        w = window.open();
        if (!w)
            alert("allow pop-ups please, print function opens in new pop-up window.");
        else {
            w.document.write($('#Content').html());
            w.print();
            w.close();
        }
    });
});

function performUpdate() {
    while (rows.length > 0)
        rows.pop();
    while (oldrows.length > 0)
        oldrows.pop();
    for (p = 0; p < temprows.length; p++) {
        rows.push(temprows[p]);
        oldrows.push(temprows[p]);
    }
    while (filterkeys.length > 0)
        filterkeys.pop();
    generateFilters();
    if ($("#filterbox").val().length > 0) {
        var filterParams = $("#filterbox").val().split(":");
        filter(filterParams[0], filterParams[1]);
    }
    if (sortOn != -1) {
        if (sortOrder == 0) {
            sort();
            rows.reverse();
        } else {
            sort();
        }
    }
    renderTable();
}

function checkAndPerformUpdate() {
    var maxrows;
    var dataUpdated = false;
    if (temprows.length != oldrows.length) {
        performUpdate();
    } else {
        for (p = 0; p < temprows.length; p++) {
            var temp1 = temprows[p].split(";");
            var temp2 = oldrows[p].split(";");
            for (q = 0; q < temp1.length; q++) {
                if (temp1[q] != temp2[q]) {
                    dataUpdated = true;
                    break;
                }
            }
            if (dataUpdated)
                break;
        }
        if (dataUpdated) {
            //console.log("new data");
            performUpdate();
        } else {
            //console.log("no new data");
        }
    }
}

function filter(key, value) {
    var u = 0;
    var resetflag = false;
    var thA = tableheader.split(";");
    var keyIndex = 0;
    if (key === "") {
        u = 0;
        while (rows.length > 0)
            rows.pop();
        for (u = 0; u < temprows.length; u++)
            rows.push(temprows[u]);
        renderTable();
    } else {
        while (keyIndex < thA.length) {
            if (key === thA[keyIndex]) {
                break;
            }
            keyIndex++;
        }
        while (rows.length > 0)
            rows.pop();
        for (u = 0; u < temprows.length; u++)
            rows.push(temprows[u]);
        u = 0;
        while (u < rows.length) {
            var temp = rows[u].split(";")[keyIndex];
            if (temp != value) {
                rows.splice(u, 1);
                resetflag = true;
            }
            if (resetflag == true) {
                u = 0;
                resetflag = false;
            } else {
                u++;
            }
        }
        renderTable();
    }
}

function sort() {
    var key = new Array();
    for (i = 0; i < rows.length; i++)
        key.push(rows[i].split(";")[sortOn]);
    var origkey = new Array();
    for (i = 0; i < key.length; i++)
        origkey.push(key[i]);
    if (/^(\d*)$/.test(key[0])) {
        key.sort(function(a, b) {
            return a - b
        });
    } else {
        key.sort();
    }
    var oldrows = new Array();
    for (i = 0; i < rows.length; i++)
        oldrows.push(rows[i]);
    while (rows.length > 0)
        rows.pop();
    for (i = 0; i < origkey.length; i++) {
        var k = lsearch(key[i], origkey);
        rows.push(oldrows[k]);
        origkey.splice(k, 1, "");
    }
    renderTable();
}

function lsearch(key, originalList) {
    for (j = 0; j < originalList.length; j++) {
        if (key === originalList[j])
            return j;
    }
}

function renderTable() {
    var tbl = "";
    var alt = 0;
    $("#tableContent").empty();
    for (i = 0; i < rows.length; i++) {
        if (alt++ % 2 == 0) {
            tbl = tbl + "<tr style='background-color:" + dt_tableRowColor1 + "'>";
        } else
            tbl = tbl + "<tr style='background-color:" + dt_tableRowColor2 + "'>"
        var rowsA = rows[i].split(";");
        for (j = 0; j < rowsA.length - 1; j++) {
            if (rowsA[j] === "Immediate")
                tbl = tbl + '<td style="color:red">' + rowsA[j] + '</td>';
            else if (rowsA[j] === "Delayed")
                tbl = tbl + '<td style="color:yellow">' + rowsA[j] + '</td>';
            else
                tbl = tbl + '<td>' + rowsA[j] + '</td>';

        }
        tbl = tbl + '</tr>';

    }
    $("#tableContent").append(tbl);
}

function generateFilters() {
    var tableh1 = tableheader.split(";");
    var keys = new Array();
    var keysu = new Array();
    for (c = 0; c < rows.length; c++) {
        var tempa = rows[c].split(";");
        for (ic = 0; ic < tempa.length; ic++) {
            keys.push(tableh1[ic] + ":" + tempa[ic]);
        }
    }
    $.each(keys, function(i, el) {
        if ($.inArray(el, keysu) === -1) keysu.push(el);
    });
    $.each(keysu, function(i, el) {
        filterkeys.push(el);
    });
}

function doSort(thid) {
    if (sortOn === -1) {
        sortOn = thid;
        $("th").find("img").remove();
        $("#" + sortOn).append("<img src='" + dt_sortUpImageSource + "'  width='12px' height='12px'/>");
        sort();

    }
    if (sortOn == thid) {
        if (sortOrder == 0) {
            sortOrder = 1;
            $("th").find("img").remove();
            $("#" + sortOn).append("<img src='" + dt_sortUpImageSource + "' width='12px' height='12px' />");
            sort();
            //console.log("reverse sort : " + rows);
            renderTable();
        } else {
            sortOrder = 0;
            $("th").find("img").remove();
            $("#" + sortOn).append("<img src='" + dt_sortDownImageSource + "' width='12px' height='12px'/>");
            sort();
            rows.reverse();
            //console.log("reverse sort : " + rows);
            renderTable();
        }
    } else {
        sortOn = thid;
        $("th").find("img").remove();
        //$("#" + sortOn).append("<img src='sort_up_green.png' width='12px' height='12px'/>");
        if (sortOrder == 0) {
            sort();
            $("#" + sortOn).append("<img src='" + dt_sortUpImageSource + "' width='12px' height='12px'/>");
            renderTable();
        } else {
            sort();
            $("#" + sortOn).append("<img src='" + dt_sortDownImageSource + "' width='12px' height='12px'/>");
            rows.reverse();
            renderTable();
        }
    }
    //console.log("rows after sort:"+rows);
}



function renderTableHeader() {
    if (!headerrendered) {
        var tableh = tableheader.split(";");
        var headerstring = "";
        headerstring = headerstring + '<table border"1"><caption>' + dt_tableCaption + ' </caption><thead><tr style="background-color:' + dt_tableHeaderColor + ' ">';
        for (x = 0; x < tableh.length - 1; x++) {
            headerstring = headerstring + "<th id='" + x + "' onclick='doSort(" + x + ")' >" + tableh[x] + "</th>";
        }
        headerstring = headerstring + '</thead><tbody id="tableContent"><tr><td colspan=' + dt_tableHeaderColSpan + '><p align="center">Loading Data...</h3></td></tr></tbody></table>';
        $("#Content").append(headerstring);
        headerrendered = true;
        dt_tableHeaderColSpan = tableh.length;
    }
}