function AppearanceTracker(session) {
  this.clear();
}
////////////////////////////////////////////////////////////
// Action types = ['CLICK_LIST','CLICK_NODE', 'DOUBLE_CLICK_NODE'];

AppearanceTracker.actionLimit = 10;
AppearanceTracker.maxActions = 20;

AppearanceTracker.prototype.clear = function() {
  this._actions = [];
};
AppearanceTracker.prototype.clickRootAction = function(old_details,search_box) {
  var action = { 'type': 'CLICK_ROOT',
                 'nodes': undefined,
                 'prev_details': old_details,
                 'search_box': search_box};
  this.addAction(action);
};

AppearanceTracker.prototype.clickListAction = function(node,old_details) {
  var action = { 'type': 'CLICK_LIST',
                 'nodes': [node],
                 'prev_details': old_details};
  this.addAction(action);
};
AppearanceTracker.prototype.clickNodeAction = function(old_details) {
  var action = {'type': 'CLICK_NODE',
                'prev_details': old_details};
  this.addAction(action);
};
AppearanceTracker.prototype.doubleClickNodeAction = function(nodes) {
  var action = {'type': 'DOUBLE_CLICK_NODE',
                'nodes': nodes};
  this.addAction(action);
};
AppearanceTracker.prototype.addAction = function(action) {
  console.log("Adding action: "); console.log(action);
  this._actions.push(action);
  if(this._actions.length > AppearanceTracker.maxActions) {
    this._actions = this._actions.slice(AppearanceTracker.actionLimit);
  }
};
AppearanceTracker.prototype.popAction = function() {
  if(this._actions.length == 0) return undefined;
  var res = this._actions.pop();
  return res;
};
