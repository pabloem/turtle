var HanjaExplorer = function(hanjaRequester) {
    this._g = {nodes:{}};
    this._hr = hanjaRequester;
    this._r = new sigma('container');
    this.refresh();

    var he = this;
    this._r.bind('clickNode', function(e) {
        var node_id = e.data.node.id;
        he._setFocus(node_id);
    });
};

HanjaExplorer.prototype.showNode = function(node) {
    this._addNode(node);
    this._setFocus(node.id);
};

// Ready
HanjaExplorer.prototype._addNode = function(node) {
    var gr = this._r.graph.nodes(node['id']);
    if (gr) {
        // The node is already in the graph
        return ;
    }
    // The nodes don't come with SigmaJS properties added, so we add:
    node.x = Math.random();
    node.y = Math.random();
    node.color = '#AAAAAA';
    node.size = 1;
    node.label = 
        node.korean+" - "+node.chinese+"\n"+
        node.english;
    this._r.graph.addNode(node);
    this.refresh();
};

// Ready
HanjaExplorer.prototype._configForceAtlasTimeout = function(sig, timeout) {
    console.log("Setting layout algorithm timeout: "+timeout);
    setTimeout(function() { 
        console.log("Stopping force atlas layout algorithm");
        sig.killForceAtlas2();},timeout);
    console.log("Set up timeout for ForceAtlas layout");
};

// Ready
HanjaExplorer.prototype.fixLayout = function(timeout) {
    if(!timeout) {
        timeout = 500;
    }
    if(this._r.isForceAtlas2Running()) {
        console.log("ForceAtlas algorithm is running at the moment.");
        return;
    }
    this._r.startForceAtlas2({worker: false, barnesHutOptimize: false});
    this._configForceAtlasTimeout(this._r,timeout);
};

// Ready
HanjaExplorer.prototype._dropNeighbors = function (node_id) {
    console.log("Dropping neighbors of " + node_id + " - not fully implemented.");
    var nd = this._r.graph.nodes(node_id);
    var nodes_to_remove = nd.neighbors;

    for(var i = 0; i < nodes_to_remove.length; i++) {
        if (nodes_to_remove[i] == this._focus) continue;
        this._r.graph.dropNode(nodes_to_remove[i]);
    }
};

HanjaExplorer.prototype._setFocus = function(node_id) {
    var old_focus = this._focus;
    this._focus = node_id;
//    if (old_focus) this._dropNeighbors(old_focus);
    this._focus = node_id;
    this._addNeighbors(node_id);
};

// Ready
HanjaExplorer.prototype.addEdge = function(from,to) {
    if (this._r.graph.edges(from+" "+to) || 
        this._r.graph.edges(to+" "+from)) {
        console.log("Edge " + from + " " + to + 
                    " is already in the graph");
        return ;
    }
    console.log("Adding edge: "+from+" "+to);
    var edge = {id: from+" "+to,
                source: from, 
                target: to};
    this._r.graph.addEdge(edge);
    this.refresh();
};

HanjaExplorer.prototype._receiveAddNeighbors = function(node_id) {
    if(!(this._hr.req.readyState == 4 && this._hr.req.status == 200))
        return;
    var res = eval(this._hr.req.responseText);
    console.log("RES IS HERE:");
    console.log(res);
    for(var i = 0; i < res.length; i++) {
        this._addNode(res[i]);
    }
    for(var j = 0; j < res.length; j++) {
        var from = node_id < res[j].id ? node_id : res[j].id;
        var to =  node_id >= res[j].id ? node_id : res[j].id;
        this.addEdge(from,to);
    }
    this.fixLayout();
};

HanjaExplorer.prototype._addNeighbors = function(node_id) {
    var nd = this._r.graph.nodes(node_id);
    if(!nd.neighbors) {
        console.log("Node has no neighbors. Can't add them.");
        return ;
    }
    var _this = this;
    // Adding here the first 10 neighbors
    var nb_list = nd.neighbors.slice(0,10);
    this._hr.nodeRequest(nb_list, 
                         function() {
                         _this._receiveAddNeighbors.bind(_this)(node_id);
                         });
    return ;
};

HanjaExplorer.prototype.clear = function() {
    this._r.graph.clear();
    this.refresh();
};

HanjaExplorer.prototype.refresh = function() {
    this._r.refresh();
};
