var HanjaExplorer = function(items) {
    this._g = people;
    this._r = new sigma('container');
    this.refresh();
};

HanjaExplorer.prototype.showNode = function(node) {
    this._addNode(node);
    this._setFocus(node.id);
};

HanjaExplorer.prototype._addNode = function(node) {
  if (this._r.graph.nodes(node['id'])) {
        // The node is already in the graph
        return ;
    }
    this._r.graph.addNode(node);
    this.refresh();
};

HanjaExplorer.prototype._configForceAtlasTimeout = function(sig, timeout) {
    console.log("Setting layout algorithm timeout: "+timeout);
    setTimeout(function() { 
        console.log("Stopping force atlas layout algorithm");
        sig.killForceAtlas2();},timeout);
    console.log("Set up timeout for ForceAtlas layout");
};

HanjaExplorer.prototype.fixLayout = function(timeout) {
    if(!timeout) {
        timeout = 500;
    }
    if(this._r.isForceAtlas2Running()) {
        console.log("ForceAtlas algorithm is running at the moment.");
        return;
    }
    console.log("Got " + this._r.graph.nodes().length+" nodes");
    this._r.startForceAtlas2({worker: false, barnesHutOptimize: false});
    this._configForceAtlasTimeout(this._r,timeout);
};

HanjaExplorer.prototype._dropNeighbors = function (node_id) {
    console.log("Dropping neighbors of " + node_id + " - not fully implemented.");
    var links  = this._r.graph.edges();
    var edges_to_remove = [];
    var nodes_to_remove = [];
    for(i = 0; i < links.length; i++) {
        var split_arr = links[i].id.split(" ");
        var pos = split_arr.indexOf(node_id);
        if( pos >= 0) {
            // Edge from our node to another. We add the OTHER
            // node to the removal list
            // Why 1-pos? When pos=0, remove 1; else remove 0.
            nodes_to_remove.push(split_arr[1-pos]);
            edges_to_remove.push(links[i].id);
        }
    }
    for(i = 0; i < nodes_to_remove.length; i++) {
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
    if(this._r.graph.nodes().length > 2) {
        this.fixLayout();
    }
};

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

HanjaExplorer.prototype._addNeighbors = function(node_id) {
    var index = this._g.nodes.indexOf(node_id);
    var links = this._g.links;
    var new_nodes = [];
    for(i = 0; i < links.length; i++) {
        if (links[i].source == index) {
            new_nodes.push([links[i].target, links[i].value]);
        }
        if (links[i].target == index) {
            new_nodes.push([links[i].source,links[i].value]);
        }
    }
    for(i = 0; i < new_nodes.length; i++) {
        var target_id = this._g.nodes[new_nodes[i][0]];
        var node_size = 20*Math.exp(-new_nodes[i][1]/20);
        this._addNode({color: '#AAA',
                      id: target_id,
                      x: Math.random(), y: Math.random(),
                      label: target_id,
                      size: node_size});
        this.addEdge(node_id,target_id);
    }
    return ;
};

HanjaExplorer.prototype.clear = function() {
    this._r.graph.clear();
    this.refresh();
};

HanjaExplorer.prototype.refresh = function() {
    this._r.refresh();
};
