define(['handlebars.runtime'], function(Handlebars) {
  Handlebars = Handlebars["default"];  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
return templates['page'] = template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, helper, functionType="function", escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  var buffer = "", stack1, helper;
  buffer += "\n";
  if (helper = helpers.htmlTag) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.htmlTag); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n";
  return buffer;
  }

function program3(depth0,data) {
  
  
  return "\n<html>\n";
  }

function program5(depth0,data) {
  
  var buffer = "", stack1, helper;
  buffer += "\n        <";
  if (helper = helpers.name) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.name); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + " ";
  stack1 = helpers.each.call(depth0, (depth0 && depth0.attributes), {hash:{},inverse:self.noop,fn:self.program(6, program6, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += ">";
  if (helper = helpers.content) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.content); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "</";
  if (helper = helpers.name) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.name); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + ">\n    ";
  return buffer;
  }
function program6(depth0,data) {
  
  var buffer = "", stack1;
  buffer += escapeExpression(((stack1 = (data == null || data === false ? data : data.key)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "=\""
    + escapeExpression((typeof depth0 === functionType ? depth0.apply(depth0) : depth0))
    + "\" ";
  return buffer;
  }

function program8(depth0,data) {
  
  var buffer = "";
  buffer += "\n        <link rel=\"stylesheet\" type=\"text/css\" href=\""
    + escapeExpression((typeof depth0 === functionType ? depth0.apply(depth0) : depth0))
    + "\">\n    ";
  return buffer;
  }

function program10(depth0,data) {
  
  var buffer = "", stack1, helper;
  buffer += "\n        <script type=\"text/javascript\">\n            requirejs(['";
  if (helper = helpers.lib) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.lib); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "'], function () {\n                var bootstrap = requirejs.config({\n                    baseUrl: '/',\n                    paths: {\n                        'resolver': 'lib/common/resolver',\n                        'text': 'vendor/text',\n                        'json': 'vendor/json'\n                    }\n                });\n\n                bootstrap(['bootstrap'], function () {});\n            });\n        </script>\n    ";
  return buffer;
  }

function program12(depth0,data) {
  
  
  return "\n        <script type=\"text/javascript\">\n            (function () {\n                var bootstrap = requirejs.config({\n                    baseUrl: '/',\n                    paths: {\n                        'resolver': 'lib/common/resolver',\n                        'text': 'vendor/text',\n                        'json': 'vendor/json'\n                    }\n                });\n\n                bootstrap(['bootstrap'], function () {});\n            })();\n        </script>\n    ";
  }

function program14(depth0,data) {
  
  var buffer = "", stack1, helper;
  buffer += " class='";
  if (helper = helpers.bodyClass) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.bodyClass); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "'";
  return buffer;
  }

  buffer += "<!DOCTYPE html>\n<!-- handlebars -f simplePage.js -a simplePage.hbs -->\n\n";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.htmlTag), {hash:{},inverse:self.program(3, program3, data),fn:self.program(1, program1, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n<head>\n    <meta charset=\"UTF-8\">\n    ";
  stack1 = helpers.each.call(depth0, (depth0 && depth0.tags), {hash:{},inverse:self.noop,fn:self.program(5, program5, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n    ";
  stack1 = helpers.each.call(depth0, ((stack1 = (depth0 && depth0.dependencies)),stack1 == null || stack1 === false ? stack1 : stack1.css), {hash:{},inverse:self.noop,fn:self.program(8, program8, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n\n    <script type=\"text/javascript\">\n        window.addEventListener('load', function (e) {\n            window.applicationCache.addEventListener('updateready', function (e) {\n                if (window.applicationCache.status == window.applicationCache.UPDATEREADY) {\n                    window.location.reload();\n                }\n            }, false);\n        }, false);\n    </script>\n\n    <script type=\"text/javascript\">\n        var LAZO = {\n            initConf: {\n                layout: '";
  if (helper = helpers.layout) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.layout); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "',\n                rootCtx: ";
  if (helper = helpers.rootCtx) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.rootCtx); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += ",\n                rootCtl: ";
  if (helper = helpers.rootCtl) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.rootCtl); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += ",\n                shim: ";
  if (helper = helpers.shim) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.shim); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += ",\n                paths: ";
  if (helper = helpers.paths) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.paths); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += ",\n                args: ";
  if (helper = helpers.args) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.args); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n            }\n        };\n    </script>\n    <script src=\"/lib/vendor/require.js\"></script>\n    ";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.lib), {hash:{},inverse:self.program(12, program12, data),fn:self.program(10, program10, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n</head>\n<body";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.bodyClass), {hash:{},inverse:self.noop,fn:self.program(14, program14, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += ">\n    ";
  if (helper = helpers.body) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.body); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n</body>\n</html>";
  return buffer;
  });
});