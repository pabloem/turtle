var HanjaReqs = function() {
    this.req = new XMLHttpRequest();
    this._base_url = "/runquery";
};

HanjaReqs.prototype.logRequest = function() {
};

HanjaReqs.prototype.nodeRequest = function(node_id,nodeQResult) {
    if(Array.isArray(node_id)) {
        node_id = node_id.join(" ");
    }
    this._request("?query=node "+node_id, nodeQResult,true);
};

HanjaReqs.prototype.fullNodeRequest = function(node_id,fullNodeQRes) {
    if(Array.isArray(node_id)) {
        node_id = node_id.join(" ");
    }
    this._request("?query=node "+node_id, fullNodeQRes,true);
};

HanjaReqs.prototype.searchRequest = function(search_str,searchQResult,async) {
    if("undefined" == typeof async) async = true;
    this._request("?query=search "+search_str, searchQResult,async);
};

HanjaReqs.prototype.rootRequest = function(root,rootReqResult) {
    this._request("?query=root "+root,rootReqResult,true);
};

HanjaReqs.prototype._request = function(url_suffix, callback,async) {
    var url = this._base_url + url_suffix;
    console.log("URL is: \"" +url+"\"");
    this.req.open("GET",url,async);
    this.req.onreadystatechange = callback;
    this.req.send( null );
};
