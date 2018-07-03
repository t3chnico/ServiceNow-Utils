var popup;
var tabid;
var g_ck;
var sysId;
var url;
var instance;
var nme;
var jsnNodes;
var urlFull;
var updateSetTables = [];

//Attatch eventlistener, setting extension only active on *.service-now.com
chrome.runtime.onInstalled.addListener(function() {
    chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
        chrome.declarativeContent.onPageChanged.addRules([{
            conditions: [
                new chrome.declarativeContent.PageStateMatcher({
                    pageUrl: { urlContains: '.service-now.com' },
                })
            ],
            actions: [new chrome.declarativeContent.ShowPageAction()]
        }]);
    });
});

chrome.runtime.onUpdateAvailable.addListener(function() {
    //clear storage on update (just to keep it clean)
    chrome.storage.local.clear();
});


chrome.commands.onCommand.addListener(function(command) {
    if (command == "show-technical-names")
        addTechnicalNames();
    else if (command == "pop")
        pop();
    else if (command == "show-select-field-values")
        showSelectFieldValues();
});

// chrome.runtime.onMessageExternal.addListener(
//     function (request, sender, sendResponse) {
//         g_ck = request.g_ck;
//         url = sender.url.split('/').slice(0, 3).join('/');

//         if (updateSetTables.length ==0){
//             setUpdateSetTables() 
//             sendResponse({ "answer": "unkowmn"});
//         }
//         else
//             sendResponse({ "answer": (updateSetTables.indexOf(request.table) > -1)});
// });



chrome.contextMenus.create({ "type": "separator" });

chrome.contextMenus.create({ "id": "goto", "contexts": ["selection"], "title": "Search / GoTo" });
chrome.contextMenus.create({ "id": "instancesearch", "parentId": "goto", "title": "Instance Search: %s", contexts: ["selection"], "onclick": openSearch });
chrome.contextMenus.create({ "id": "openscript", "parentId": "goto", "title": "Script Include: %s", contexts: ["selection"], "onclick": openScriptInclude });
chrome.contextMenus.create({ "id": "opentablelist", "parentId": "goto", "title": "Table list: %s", contexts: ["selection"], "onclick": openTableList });
chrome.contextMenus.create({ "id": "openprop", "parentId": "goto", "title": "System Property: %s", contexts: ["selection"], "onclick": openSysProperty });
chrome.contextMenus.create({ "id": "openuipolicies", "parentId": "goto", "title": "UI Policies: %s", contexts: ["selection"], "onclick": openUiPolicies });
chrome.contextMenus.create({ "id": "openuipolicyactions", "parentId": "goto", "title": "UI Policy Actions: %s", contexts: ["selection"], "onclick": openUiPolicyActions });
chrome.contextMenus.create({ "id": "tools", "contexts": ["all"], "title": "Tools" });
chrome.contextMenus.create({ "id": "popinout", "parentId": "tools", "title": "PopIn / PopOut", "contexts": ["all"], "onclick": togglePop });
chrome.contextMenus.create({ "id": "shownames", "parentId": "tools", "title": "Show technical names", "contexts": ["all"], "onclick": addTechnicalNames });
chrome.contextMenus.create({ "id": "showselectfieldvalues", "parentId": "tools", "title": "Show Select-field values", "contexts": ["all"], "onclick": showSelectFieldValues });
chrome.contextMenus.create({ "id": "setmandatoryfieldstofalse", "parentId": "tools", "title": "Set all fields to non-mandatory", "contexts": ["all"], "onclick": setAllMandatoryFieldsToFalse });
chrome.contextMenus.create({ "id": "canceltransaction", "parentId": "tools", "title": "Cancel transactions", "contexts": ["all"], "onclick": function(e, f) { openUrl(e, f, '/cancel_my_transactions.do'); } });
//chrome.contextMenus.create({ "id": "canceltransaction", "parentId": "tools", "title": "Cancel transactions", "contexts": ["all"], "onclick": function (e, f) { cancelTransactions(e); } });
chrome.contextMenus.create({ "id": "versions", "parentId": "tools", "title": "Update Versions", "contexts": ["all"], "onclick": function(e, f) { openVersions(e, f) } });
chrome.contextMenus.create({ "id": "stats", "parentId": "tools", "title": "stats.do", "contexts": ["all"], "onclick": function(e, f) { openUrl(e, f, '/stats.do') } });

chrome.contextMenus.create({ "title": "Separator Context Menu", "type": "separator" });

chrome.contextMenus.create({ "id": "businessrules", "title": "Business Rules", "contexts": ["all"], "onclick": function(e, f) { openUrl(e, f, '/sys_script_list.do?sysparm_order=sys_updated_on&sysparm_order_direction=desc') } });
chrome.contextMenus.create({ "id": "clientscripts", "title": "Client Scripts", "contexts": ["all"], "onclick": function(e, f) { openUrl(e, f, '/sys_script_client_list.do?sysparm_order=sys_updated_on&sysparm_order_direction=desc') } });
chrome.contextMenus.create({ "id": "scriptincludes", "title": "Script Includes", "contexts": ["all"], "onclick": function(e, f) { openUrl(e, f, '/sys_script_include_list.do?sysparm_order=sys_updated_on&sysparm_order_direction=desc') } });
chrome.contextMenus.create({ "id": "uiactions", "title": "UI Actions", "contexts": ["all"], "onclick": function(e, f) { openUrl(e, f, '/sys_ui_action_list.do?sysparm_order=sys_updated_on&sysparm_order_direction=desc') } });
chrome.contextMenus.create({ "id": "uipolicies", "title": "UI Policies", "contexts": ["all"], "onclick": function(e, f) { openUrl(e, f, '/sys_ui_policy_list.do?sysparm_order=sys_updated_on&sysparm_order_direction=desc') } });
chrome.contextMenus.create({ "id": "notification", "contexts": ["all"], "title": "Notification" });
chrome.contextMenus.create({ "id": "notifications", "parentId": "notification", "title": "Notifications", "contexts": ["all"], "onclick": function(e, f) { openUrl(e, f, '/sysevent_email_action_list.do') } });
chrome.contextMenus.create({ "id": "emailscripts", "parentId": "notification", "title": "Email scripts", "contexts": ["all"], "onclick": function(e, f) { openUrl(e, f, '/sys_script_email_list.do') } });
chrome.contextMenus.create({ "id": "emailtemplates", "parentId": "notification", "title": "Templates", "contexts": ["all"], "onclick": function(e, f) { openUrl(e, f, '/sysevent_email_template_list.do') } });
chrome.contextMenus.create({ "title": "Separator Context Menu", "type": "separator" });
chrome.contextMenus.create({ "id": "updates", "title": "Customer Updates", "contexts": ["all"], "onclick": function(e, f) { openUrl(e, f, '/sys_update_xml_list.do?sysparm_order=sys_updated_on&sysparm_order_direction=desc') } });
// chrome.contextMenus.create({ "id": "updates", "title": "Customer Updates (Today)", "contexts": ["all"], "onclick": function (e, f) { openUrl(e, f, '/sys_update_xml_list.do?sysparm_query=sys_updated_onONToday@javascript:gs.beginningOfToday()@javascript:gs.endOfToday()&sysparm_order=sys_updated_on&sysparm_order_direction=desc') } });
chrome.contextMenus.create({ "id": "updatesets", "title": "Update Sets", "contexts": ["all"], "onclick": function(e, f) { openUrl(e, f, '/sys_update_set_list.do?sysparm_order=sys_updated_on&sysparm_order_direction=desc') } });
chrome.contextMenus.create({ "id": "users", "title": "Users", "contexts": ["all"], "onclick": function(e, f) { openUrl(e, f, '/sys_user_list.do?sysparm_order=sys_updated_on&sysparm_order_direction=desc') } });
chrome.contextMenus.create({ "id": "syslogs", "title": "System Logs (Today)", "contexts": ["all"], "onclick": function(e, f) { openUrl(e, f, '/syslog_list.do?sysparm_query=sys_created_onONToday@javascript:gs.daysAgoStart(0)@javascript:gs.daysAgoEnd(0)&sysparm_order=sys_created_on&sysparm_order_direction=desc') } });
chrome.contextMenus.create({ "id": "props", "title": "System Properties", "contexts": ["all"], "onclick": function(e, f) { openUrl(e, f, '/sys_properties_list.do?sysparm_order=sys_updated_on&sysparm_order_direction=desc') } });

chrome.contextMenus.create({ "title": "Separator Context Menu", "type": "separator" });

chrome.contextMenus.create({ "id": "codesnippets", "contexts": ["editable"], "title": "Code Snippets" });
chrome.contextMenus.create({ "id": "worknotesnippets", "contexts": ["editable"], "title": "Worknote Snippets" });


var snippets = {
    "codesnippet1": ["codesnippets", "GlideAggregate Count", `var count = new GlideAggregate('incident');
    count.addAggregate('COUNT');
    count.query();
    var incidents = 0;
    if(count.next()) 
       incidents = count.getAggregate('COUNT');`],

    "codesnippet2": ["codesnippets", "GlideAggregate Count by", `var count = new GlideAggregate('incident');
    count.addQuery('active','true');
    count.addAggregate('COUNT','category');
    count.query();
    while(count.next()){
      var category = count.category;
      var categoryCount = count.getAggregate('COUNT','category');
      gs.log("The are currently "+ categoryCount +" incidents with a category of "+ category);
    }`],

    "codesnippet3": ["codesnippets", "GlideAggregate Aggregates", `var count = new GlideAggregate('incident');
    count.addAggregate('MIN','sys_mod_count');
    count.addAggregate('MAX','sys_mod_count');
    count.addAggregate('AVG','sys_mod_count');
    count.groupBy('category');
    count.query();
    while(count.next()){
      var min = count.getAggregate('MIN','sys_mod_count');
      var max = count.getAggregate('MAX','sys_mod_count');
      var avg = count.getAggregate('AVG','sys_mod_count');
      var category = count.category.getDisplayValue();
      gs.log(category +" Update counts: MIN = "+ min +" MAX = "+ max +" AVG = "+ avg);
    }`],

    "codesnippet4": ["codesnippets", "gs.getUser", `var ourUser = gs.getUser(); 
    gs.­print(­ourUser.­getFirstName()); //print the first name of the user you are currently logged in as 
    ourUser = ourUser.­getUserByID(­'abel.tuter'); //fetch a different user, using the user_name field or sys_id on the target user record. 
    gs.­print(­ourUser.­getFirstName()); //first name of the user you fetched above 
    gs.­print(­ourUser.­isMemberOf(­'Capacity Mgmt'));`],

    "codesnippet6": ["codesnippets", "Workflow / Scratchpad", `//the run script activity sets a value in the scratchpad
    workflow.scratchpad.important_msg = "scratch me";
     
    //get the workflow script include helper 
    var workflow = new Workflow();
     
    //get the requested items workflow context 
    //this will get all contexts so you'll need to get the proper one if you have multiple workflows for a record 
    var context = workflow.getContexts(current); 
    //make sure we have a valid context 
    if (context.next()) { 
      //get a value from the scratchpad 
      var msg = context.scratchpad.important_msg; 
      //msg now equals "scratch me", that was set in the run script activity
     
      //add or modify a scratchpad value
      context.scratchpad.status = "completed"; 
      //we need to save the context record to save the scratchpad
      context.update(); 
    }`],

    "workenotesnippet1": ["worknotesnippets", "Hyperlink", `[code]<a href="URL" target="_blank">TEXT</a>[/code] `],

    "workenotesnippet2": ["worknotesnippets", "Code", `[code]<pre> 
    </pre>[/code] `]

};

for (var snip in snippets) {
    chrome.contextMenus.create({ "id": snip, "parentId": snippets[snip][0], "contexts": ["editable"], "title": snippets[snip][1], "onclick": insertSnippet });
}

function insertSnippet(e, f) {

    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        var pretext = '';
        if (snippets[e.menuItemId][2] == "codessnippet")
            pretext = "// Below snippet inserted via SN Utils Chrome Extension\n";

        chrome.tabs.sendMessage(tabs[0].id, { "snippet": pretext + snippets[e.menuItemId][2] });
    });
}




chrome.contextMenus.onClicked.addListener(function(clickData, tab) {
    if (clickData.menuItemId == "popinout")
        togglePop(clickData, tab.id);
});


function addTechnicalNames() {

    chrome.tabs.query({ currentWindow: true, active: true },
        function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, { method: "runFunction", myVars: "addTechnicalNames();", funtion() {} });

        })

}

function showSelectFieldValues() {
    chrome.tabs.query({ currentWindow: true, active: true },
        function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, { method: "runFunction", myVars: "showSelectFieldValues();", funtion() {} });
        });
}

function setAllMandatoryFieldsToFalse() {
    chrome.tabs.query({ currentWindow: true, active: true },
        function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, { method: "runFunction", myVars: "setAllMandatoryFieldsToFalse ();", funtion() {} });
        });
}

function openVersions(e, f) {
    var tokens = e.pageUrl.split('/').slice(0, 3);
    var baseurl = tokens.join('/');

    var url = e.frameUrl || e.pageUrl;
    var urlParts = url.split((/[?/&]+/));
    var msg = "";
    var sys_id = "";
    var updateName = urlParts[2].replace(".do", "_");
    for (var i = 3; i < urlParts.length; i++) {
        if (urlParts[i].startsWith("sys_id")) {
            sys_id = urlParts[i].split("=")[1];
            if (sys_id.length != 32)
                msg = "Invalid sys_id: " + sys_id;

            break;
        }
    }

    if (sys_id) {

        getGck(function() {
            sys_id = sysId || sys_id;
            loadXMLDoc(g_ck,
                baseurl + "/api/now/stats/sys_update_version?sysparm_count=true&sysparm_query=name=" + updateName + sys_id,
                null,
                function(jsn) {
                    if (typeof jsn == "undefined" || jsn == "error")
                        alert("No access to Update Versions");
                    else if (Number(jsn.result.stats.count))
                        chrome.tabs.create({ "url": baseurl + "/sys_update_version_list.do?sysparm_query=name=" + updateName + sys_id + "^ORDERBYDESCsys_recorded_at" });
                    else
                        alert("No Update versions found for record: " + updateName + sys_id);
                });
        });
    } else
        alert("No table and sys_id found in this page / frame");

}

function cancelTransactions(e) {
    var tokens = e.pageUrl.split('/').slice(0, 3);
    var url = tokens.join('/');
    jQuery.get(url + '/cancel_my_transactions.do', function(r) {
        alert(r);
    })
}


function openUrl(e, f, u) {
    var tokens = e.pageUrl.split('/').slice(0, 3);
    var url = tokens.join('/') + u;
    chrome.tabs.create({ "url": url });
}

function openSearch(e) {
    var tokens = e.pageUrl.split('/').slice(0, 3),
        URL = tokens.join('/');

    var srch = e.selectionText;
    if (srch.length < 100)
        chrome.tabs.create({ url: URL + "/textsearch.do?sysparm_search=" + srch });
}

function openScriptInclude(e) {
    var tokens = e.pageUrl.split('/').slice(0, 3),
        URL = tokens.join('/');
    var srch = e.selectionText;
    if (srch.length < 40)
        chrome.tabs.create({ url: URL + "/sys_script_include.do?sysparm_refkey=name&sys_id=" + srch });
}

function openTableList(e) {
    var tokens = e.pageUrl.split('/').slice(0, 3),
        URL = tokens.join('/');
    var srch = e.selectionText;
    if (srch.length < 40)
        chrome.tabs.create({ url: URL + "/" + srch + "_list.do?sysparm_query=sys_updated_onONToday@javascript:gs.daysAgoStart(0)@javascript:gs.daysAgoEnd(0)" });
}

function openSysProperty(e) {
    var tokens = e.pageUrl.split('/').slice(0, 3),
        URL = tokens.join('/');
    var srch = e.selectionText;
    if (srch.length < 40)
        chrome.tabs.create({ url: URL + "/sys_properties.do?sysparm_refkey=name&sys_id=" + srch });
}

function openUiPolicies(e) {
    var tokens = e.pageUrl.split('/').slice(0, 3),
        URL = tokens.join('/');
    var srch = e.selectionText;
    if (srch.length < 255)
        chrome.tabs.create({ url: URL + "/sys_ui_policy_list.do?sysparm_query=short_description=" + srch });
}

function openUiPolicyActions(e) {
    var tokens = e.pageUrl.split('/').slice(0, 3),
        URL = tokens.join('/');
    var srch = e.selectionText;
    if (srch.length < 80)
        chrome.tabs.create({ url: URL + "/sys_ui_policy_action_list.do?sysparm_query=field=" + srch });
}

function pop() {

    chrome.tabs.query({
        active: true,
        currentWindow: true
    }, function(tabs) {
        var u = tabs[0].url;
        var tid = tabs[0].id;
        var baseUrl = u.substring(0, u.indexOf(".com/") + 4);
        var navToIdx = u.indexOf("nav_to.do?uri=");
        if (navToIdx > -1) {
            var pth = decodeURIComponent(u.substring(navToIdx + 14, 1000));
            chrome.tabs.update(tid, {
                url: baseUrl + pth
            })
        } else {
            var pth = "/nav_to.do?uri=" + encodeURIComponent(u.substring(u.indexOf(".com/") + 5, 1000));
            chrome.tabs.update(tid, {
                url: baseUrl + pth
            })
        }
    });
}


function togglePop(clickData, tid) {

    console.log(clickData);
    console.log(tid);

    var frameHref = clickData.frameUrl || '';
    var urlFull = '' + clickData.pageUrl.match(/([^;]*\/){3}/)[0];
    if (frameHref.length > 10) {
        chrome.tabs.update(tid, {
            url: frameHref
        })
    } else {
        var newHref = encodeURIComponent(clickData.pageUrl.replace(urlFull, ''));
        var newUrl = urlFull + '/nav_to.do?uri=' + newHref;
        chrome.tabs.update(tid, {
            url: newUrl
        });
    }

}


//This listens for messages from FileSyncer and saves back scripts to the instance.
chrome.runtime.onMessageExternal.addListener(
    function(request, sender, sendResponse) {
        //console.log(request);
        if (request.details) {
            loadXMLDoc(g_ck,
                url + '/api/now/table/' + request.details[2] + '/' + request.details[4].split('.')[0],
                "{" + request.details[3] + ":" + JSON.stringify(request.details[1]) + "}",
                function(resp) {
                    sendResponse({ result: "saved" });
                });
        } else if (request.instance) {
            sendResponse({ instance: (instance || 'not set') });
        }
    });


//Retrieve variables from browser tab, passing them back to popup
function getBrowserVariables(tid) {
    tabid = tid;
    popup = chrome.extension.getViews({ type: "popup" })[0];
    chrome.tabs.sendMessage(tabid, { method: "getVars", myVars: "g_ck,g_user_date_time_format,NOW.user.roles,NOW.user.name,NOW.user_name" }, function(response) {
        g_ck = response.myVars.g_ck || '';
        url = response.url;
        instance = url.replace("https://", "").replace(".service-now.com", "");
        nme = response.myVars.NOWusername || response.myVars.NOWuser_name;
        popup.setBrowserVariables(response);
    });
}

//get g_ck token from browser, incase it didnt load via popup
function getGck(callback) {
    if (g_ck && sysId)
        callback();
    else {
        chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, { method: "getVars", myVars: "g_ck,NOW.sysId" }, function(response) {
                g_ck = response.myVars.g_ck || '';
                sysId = response.myVars.NOWsysId || '';
                callback();
            });
        });
    }
}



//Try to retrieve current table and syid from browser tab, passing them back to popup
function getRecordVariables(scriptscync) {
    popup = chrome.extension.getViews({ type: "popup" })[0];
    chrome.tabs.sendMessage(tabid, { method: "getVars", myVars: "NOW.targetTable,NOW.sysId,mySysId,document.cookie" }, function(response) {
        popup.setRecordVariables(response, scriptscync);
    });
}

function getGRQuery(varName, template) {

    varName = varName || 'gr';

    popup = chrome.extension.getViews({ type: "popup" })[0];

    chrome.tabs.sendMessage(tabid, { method: "runFunction", myVars: "getListV3Fields()" }, function() {

        chrome.tabs.sendMessage(tabid, { method: "getVars", myVars: "g_list.filter,g_list.tableName,g_list.sortBy,g_list.sortDir,g_list.rowsPerPage,g_list.fields" }, function(response) {
            var tableName = response.myVars.g_listtableName;
            var encQuery = response.myVars.g_listfilter;
            var orderBy = response.myVars.g_listsortBy;
            var isDesc = (response.myVars.g_listsortDir == "DESC");
            var fields = ('' + response.myVars.g_listfields).split(',');
            var rowsPerPage = response.myVars.g_listrowsPerPage;
            var queryStr = "var " + varName + " = new GlideRecord('" + tableName + "');\n";
            queryStr += varName + ".addEncodedQuery(\"" + encQuery + "\");\n";
            if (isDesc)
                queryStr += varName + ".orderByDesc('" + orderBy + "');\n";
            else
                queryStr += varName + ".orderBy('" + orderBy + "');\n";
            queryStr += varName + ".setLimit(" + rowsPerPage + ");\n";
            queryStr += varName + ".query();\n";
            queryStr += "while (" + varName + ".next()) {\n";
            queryStr += "    //" + varName + ".initialize();\n";
            if (template) {
                for (var i = 0; i < fields.length; i++) {
                    queryStr += "    " + template.replace(/\{0\}/g, varName).replace(/\{1\}/g, fields[i]) + "\n";
                }
            } else
                queryStr += "\n\n    //todo: code ;)\n\n"
            queryStr += "    //" + varName + ".update();\n";
            queryStr += "    //" + varName + ".insert();\n";
            queryStr += "    //" + varName + ".deleteRecord();\n";
            queryStr += "}";
            popup.setGRQuery(queryStr);
        });
    });
}

function getGRQueryForm(varName, template) {

    varName = varName || 'gr';

    popup = chrome.extension.getViews({ type: "popup" })[0];

    chrome.tabs.sendMessage(tabid, { method: "getVars", myVars: "g_form.tableName,NOW.sysId,mySysId,elNames" }, function(response) {
        var tableName = response.myVars.g_formtableName;
        var sysId = response.myVars.NOWsysId || response.myVars.mySysId;
        var fields = ('' + response.myVars.elNames).split(',');
        var queryStr = "var " + varName + " = new GlideRecord('" + tableName + "');\n";
        queryStr += "if (" + varName + ".get('" + sysId + "')) {\n";
        queryStr += "    //" + varName + ".initialize();\n";
        if (template) {
            for (var i = 0; i < fields.length; i++) {
                queryStr += "    " + template.replace(/\{0\}/g, varName).replace(/\{1\}/g, fields[i]) + "\n";
            }
        } else
            queryStr += "\n\n    //todo: code ;)\n\n"
        queryStr += "    //" + varName + ".update();\n";
        queryStr += "    //" + varName + ".insert();\n";
        queryStr += "    //" + varName + ".deleteRecord();\n";
        queryStr += "}";
        popup.setGRQuery(queryStr);
    });

}

//Query servicenow for details of user, passhtml string to popup
function getUserDetails(userName) {

    var myurl = url + "/api/now/table/sys_user?sysparm_display_value=all&sysparm_query=user_name%3D" + userName;
    loadXMLDoc(g_ck, myurl, null, function(fetchResult) {
        var listhyperlink = " <a target='_blank' href='" + url + "/sys_user_list.do?sysparm_query=user_nameLIKE" + userName + "%5EORnameLIKE" + userName + "'> <i class='fa fa-list' aria-hidden='true'></i></a>";

        if (fetchResult.result.length > 0) {
            var usr = fetchResult.result[0];
            var html = "<br /><table class='table table-condensed table-bordered table-striped'>" +
                "<tr><th>User details</th><th>" + usr.user_name.display_value + listhyperlink + "</th></tr>" +

                "<tr><td>Name:</td><td><a href='" + url + "/nav_to.do?uri=sys_user.do?sys_id=" +
                usr.sys_id.display_value + "' target='_user'>" +
                usr.name.display_value + "</a></td></tr>" +
                "<tr><td>Active:</td><td>" + usr.active.display_value + "</td></tr>" +
                "<tr><td>Last login:</td><td>" + usr.last_login_time.display_value + "</td></tr>" +
                "<tr><td>Created:</td><td>" + usr.sys_created_on.display_value + "</td></tr>" +
                "<tr><td>Created by:</td><td>" + usr.sys_created_by.display_value + " <a id='createdby' data-username='" + usr.sys_created_by.display_value + "' href='#'> <i class='fa fa-sign-out fa-1' aria-hidden='true'></i></a></td></tr>" +
                "<tr><td>Phone:</td><td>" + usr.phone.display_value + "</td></tr>" +
                "<tr><td>E-mail:</td><td><a href='mailto:" + usr.email.display_value + "'>" + usr.email.display_value + "</a></td></tr></table>";
            popup.setUserDetails(html);
        } else {
            var html = "<br /><table class='table table-condensed table-bordered table-striped'><tr><th>User details</th><th>" + userName + listhyperlink + "</th></tr>" +
                "<tr><td>Result:</td><td>No exact match, try clicking the list icon.</td></tr></table>";
            popup.setUserDetails(html);
        }
    });
}


//Query ServiceNow for tables, pass JSON back to popup
function getTables() {
    var myurl = url + '/api/now/table/sys_db_object?sysparm_fields=name,label&sysparm_query=sys_update_nameISNOTEMPTY^nameNOT LIKE00%5EORDERBYlabel';
    loadXMLDoc(g_ck, myurl, null, function(jsn) {
        popup.setTables(jsn.result);
    });
}


//Query ServiceNow for tables and set to chrome storage
function setUpdateSetTables() {

    var myurl = url + "/api/now/table/sys_dictionary?sysparm_fields=name&sysparm_query=" +
        "name=javascript:new PAUtils().getTableDecendants('sys_metadata')^internal_type=collection^attributesNOT LIKEupdate_synch=false^NQattributesLIKEupdate_synch=true";
    loadXMLDoc(g_ck, myurl, null, function(jsn) {

        var tbls = [];
        for (var t in jsn.result) {
            tbls.push(jsn.result[t].name);
        }
        setToChromeStorage("updatesettables", tbls);
        updateSetTables = tbls;
    });
}


function getUpdateSetTables() {



    var query = [instance + "-updatesettables", instance + "-updatesettables-date"];
    chrome.storage.local.get(query, function(result) {
        try {
            var thedate = new Date().toDateString();
            if (thedate == result[query[1]].toString()) {
                updateSetTables = result[query[0]];
            } else
                setUpdateSetTables()
        } catch (err) {
            setUpdateSetTables();
        }
    })

}


//Place the key value pair in the chrome local storage, with metafield for date added.
function setToChromeStorage(theName, theValue) {
    var myobj = {};
    myobj[instance + "-" + theName] = theValue;
    myobj[instance + "-" + theName + "-date"] = new Date().toDateString();
    chrome.storage.local.set(myobj, function() {

    });
}




//Query ServiceNow for nodes
function getNodes() {
    var myurl = url + '/api/now/table/v_cluster_nodes?sysparm_query=ORDERBYname&sysparm_fields=node&sysparm_display_value=all';
    loadXMLDoc(g_ck, myurl, null, function(jsn) {
        popup.setNodes(jsn.result);
    });
}

function setActiveNode(nodeId, nodeName) {


    $.get(url + '/stats.do', function(statsDo) {

        var ipArr = statsDo
            .match(/IP address: ([\s\S]*?)\<br\/>/g)[0]
            .replace('IP address: ', '')
            .replace('<br />', '')
            .split('.');

        var nodeArr = nodeName.split(".");
        var ip34 = nodeArr[0].replace("app", ""); //ie: 28125
        var ipSegments = [ipArr[0], ipArr[1], Number(ip34.slice(0, -3)), Number(ip34.slice(3))];

        var encodedIP = 0;
        for (var i = 0; i < ipSegments.length; i++) {
            var n = (ipSegments[i] * Math.pow(256, i));
            encodedIP += n;
        }


        var myurl = url + '/api/now/table/sys_cluster_state?sysparm_query=node_id=' + nodeId + '&sysparm_fields=stats';
        loadXMLDoc(g_ck, myurl, null, function(jsn) {
            var port = ($($.parseXML(jsn.result[0].stats)).find('servlet\\.port').text());
            var encodedPort = Math.floor(port / 256) + (port % 256) * 256;
            var encodeBIGIP = encodedIP + '.' + encodedPort + '.0000';
            chrome.cookies.set({
                "name": "BIGipServerpool_" + instance,
                "url": "https://" + instance + ".service-now.com",
                "secure": true,
                "httpOnly": true,
                "value": encodeBIGIP
            }, function(s) {
                chrome.cookies.set({
                    "name": "glide_user_route",
                    "url": "https://" + instance + ".service-now.com",
                    "secure": true,
                    "httpOnly": true,
                    "value": 'glide.' + nodeId
                }, function(s) {
                    getActiveNode(jsnNodes);
                });
            });
        });




    });


}


function getActiveNode(jsn) {
    jsnNodes = jsn;
    chrome.cookies.get({
        "name": "glide_user_route",
        "url": "https://" + instance + ".service-now.com"
    }, function(c) {
        popup.setDataTableNodes(jsnNodes, c.value.replace('glide.', ''));
    });
}




//Query ServiceNow for tables, pass JSON back to popup
function getExploreData() {

    popup = chrome.extension.getViews({ type: "popup" })[0];
    chrome.tabs.sendMessage(tabid, { method: "getVars", myVars: "g_form.tableName,NOW.sysId,mySysId,elNames" }, function(response) {
        var tableName = response.myVars.g_formtableName;
        var sysId = response.myVars.NOWsysId || response.myVars.mySysId;


        if (!(tableName && sysId)) {
            popup.setDataExplore([]);
            return true;
        }

        var myurl = url + '/api/now/ui/meta/' + tableName;
        loadXMLDoc(g_ck, myurl, null, function(metaData) {
            var query = '';
            if (sysId)
                query = '&sysparm_query=sys_id%3D' + sysId;
            var myurl = url + '/api/now/table/' + tableName + '?sysparm_display_value=all&sysparm_limit=1' + query;
            loadXMLDoc(g_ck, myurl, null, function(jsn) {

                var dataExplore = [];
                var propObj = {};
                propObj.name = "#TABLE / SYS_ID";
                propObj.meta = { "label": "#TABLE / SYS_ID", "type": "TABLE" };
                propObj.display_value = "<a class='referencelink' href='" + url + "/" + tableName + ".do?sys_id=" + sysId + "' target='_blank'>" + tableName + " / " + sysId + "</a>";
                propObj.value = tableName + " / " + sysId;
                dataExplore.push(propObj);

                var rows = jsn.result[0];

                for (var key in rows) {
                    var propObj = {}
                    if (!rows.hasOwnProperty(key)) continue;

                    var display_value = rows[key].display_value;
                    var link = propObj.link = rows[key].link;
                    if (link) {
                        var linksplit = link.split('/');
                        var href = url + '/' + linksplit[6] + '.do?sys_id=' + linksplit[7];
                        display_value = "<a href='" + href + "' target='_blank'>" + display_value + "</a>";
                    }

                    propObj.name = key;
                    propObj.meta = metaData.result.columns[key];
                    propObj.display_value = display_value;
                    propObj.value = (display_value != rows[key].value) ? rows[key].value : '';


                    dataExplore.push(propObj);
                }



                popup.setDataExplore(dataExplore);
            });
        });
    });

}

function getScriptFields() {
    var myurl = url + '/api/now/table/sys_dictionary?sysparm_display_value=true&sysparm_fields=name,element,internal_type.name&sysparm_query=internal_type.labelLIKEhtml^ORinternal_type.labelLIKEscript^ORinternal_type.labelLIKExml^ORinternal_type.labelLIKEcss';
    loadXMLDoc(g_ck, myurl, null, function(jsn) {
        popup.setScriptFields(jsn.result);
    });
}

//Query ServiceNow for updatsets, pass JSON back to popup
function getUpdateSets() {
    var myurl = url + '/api/now/ui/concoursepicker/updateset';
    loadXMLDoc(g_ck, myurl, null, function(jsn) {
        popup.setDataTableUpdateSets(jsn);
    });
}


//Query ServiceNow for updaes by current user, pass JSON back to popup
function getUpdates(username) {
    var myurl = url + '/api/now/table/sys_update_xml?sysparm_display_value=true&sysparm_fields=sys_id%2Ctype%2Cname%2Ctarget_name%2Cupdate_set.name%2Csys_updated_on%2Csys_updated_by&sysparm_query=sys_updated_byLIKE' + username + '%5EORDERBYDESCsys_updated_on&sysparm_limit=20';
    loadXMLDoc(g_ck, myurl, null, function(jsn) {
        popup.setDataTableUpdates(jsn);
    });
}

//Set active updateset and refresh list on popup after it
function setUpdateSet(data) {
    var myurl = url + '/api/now/ui/concoursepicker/updateset';
    loadXMLDoc(g_ck, myurl, data, function(jsn) {
        getUpdateSets();
    });
}


//Function to query Servicenow API
function loadXMLDoc(token, url, post, callback) {

    var hdrs = {
        'Cache-Control': 'no-cache',
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    }

    if (token) //only for instances with high security plugin enabled
        hdrs['X-UserToken'] = token;

    var method = "GET";
    if (post) method = "PUT";

    $.ajax({
        url: url,
        method: method,
        data: post,
        headers: hdrs
    }).done(function(rspns) {
        callback(rspns);
    }).fail(function(jqXHR, textStatus) {
        callback(textStatus);
    });

};